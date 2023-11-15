import sharp from 'sharp';
import { GREYSCALE_FILTER, BLUR_FILTER, NEGATIVE_FILTER } from '../commons/constans.mjs';
import ApplyFilter from './ApplyFilterFunction/ApplyFilters.mjs';
import Observer from './ApplyFilterFunction/Observer.mjs';

class ApplyFiltersService {
  constructor({ processRepository, minioService }) {
    this.processRepository = processRepository;
    this.minioService = minioService;
  }

  async applyFilters(newImages) {
    newImages.images.map(async (image) => {
      const imageBuffer = await sharp(image.buffer).toBuffer();
      const applyImgFilter = new ApplyFilter();
      const observer = new Observer({ processRepository: this.processRepository });

      image.filters.forEach((filter) => {
        applyImgFilter.subscribe({
          imgId: image.id,
          filterId: filter.id,
          observer,
        });
      });

      image.filters.forEach(async (filter) => {
        const data = {
          id: newImages.id,
          imgId: image.id,
          filterId: filter.id,
        };

        const fileName = this.rename(image.originalname, filter.name);

        if (filter.name === GREYSCALE_FILTER) {
          const imgBuffer = await sharp(imageBuffer).grayscale().toBuffer();

          const imgUrl = await this.saveImage({
            originalname: fileName,
            buffer: imgBuffer,
          });

          applyImgFilter.notify({ ...data, imgUrl });
        }
        if (filter.name === NEGATIVE_FILTER) {
          const imgBuffer = await sharp(imageBuffer).negate({ alpha: false }).toBuffer();

          const imgUrl = await this.saveImage({
            originalname: fileName,
            buffer: imgBuffer,
          });

          applyImgFilter.notify({ ...data, imgUrl });
        }
        if (filter.name === BLUR_FILTER) {
          const imgBuffer = await sharp(imageBuffer).blur(1 + 0.7 / 2).toBuffer();

          const imgUrl = await this.saveImage({
            originalname: fileName,
            buffer: imgBuffer,
          });

          applyImgFilter.notify({ ...data, imgUrl });
        }
      });
    });
  }

  async saveImage(image) {
    await Promise.resolve(this.minioService.saveImage(image));
    const res = await Promise.resolve(this.minioService.generateSignedUrl(image.originalname));
    return res;
  }

  /* eslint-disable class-methods-use-this */
  rename(originalname, filterName) {
    const originalNameParts = originalname.split('.');
    const extension = originalNameParts[1];
    return `${originalNameParts[0]}-${filterName}.${extension}`;
  }
}

export default ApplyFiltersService;
