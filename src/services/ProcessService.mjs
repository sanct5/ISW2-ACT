import Joi from 'joi';
import Boom from '@hapi/boom';
import sharp from 'sharp';
import {
  GREYSCALE_FILTER, BLUR_FILTER, NEGATIVE_FILTER, IN_PROGRESS_STATUS,
} from '../commons/constans.mjs';

class ProcessService {
  constructor({ processRepository, minioService }) {
    this.processRepository = processRepository;
    this.minioService = minioService;
    this.payloadValidation = Joi.object({
      filters: Joi.array().required().min(1)
        .items(Joi.string().valid(GREYSCALE_FILTER, BLUR_FILTER, NEGATIVE_FILTER)),
      images: Joi.array().required().min(1),
    }).required();
  }

  async applyFilter(filter, imageBuffer) {
    let result;
    switch (filter) {
      case GREYSCALE_FILTER:
        result = await sharp(imageBuffer).greyscale().toBuffer();
        break;
      case BLUR_FILTER:
        result = await sharp(imageBuffer).blur().toBuffer();
        break;
      case NEGATIVE_FILTER:
        result = await sharp(imageBuffer).negate().toBuffer();
        break;
      default:
        throw Boom.badData(`Invalid filter: ${filter}`);
    }
    return result;
  }

  async applyFilters(payload) {
    try {
      await this.payloadValidation.validateAsync(payload);
    } catch (error) {
      throw Boom.badData(error.message, { error });
    }

    const { images, filters } = payload;

    const totalSize = images.reduce((acum, image) => acum + image.size, 0);

    if (totalSize > 50 * 1024 * 1024) {
      throw Boom.badData('The total size sum of the images exceeds 50 MB.');
    }

    const imagesPromises = images.map((image) => filters.map(async (filter) => {
      const imageBuffer = await this.applyFilter(filter, image.buffer);
      return this.minioService.saveImage({ ...image, buffer: imageBuffer });
    }));

    await Promise.all(imagesPromises);

    const Data = await this.dataConstructor(images, filters, this.minioService);

    const process = await this.processRepository.save(Data);

    return process;
  }

  async dataImage(img, filters) {
    const imageUrl = await this.minioService.generateSignedUrl(img.originalname);
    const filterData = filters.map((filter) => ({
      name: filter,
      status: IN_PROGRESS_STATUS,
    }));
    return { imageUrl, filters: filterData, originalname: img.originalname };
  }

  async dataConstructor(imgs, filters) {
    const imagesData = await Promise.all(
      imgs.map((image) => this.dataImage(image, filters)),
    );
    const newData = {
      filters,
      images: imagesData,
    };
    return newData;
  }

  async getProcessById(id) {
    const process = await this.processRepository.getProcessById(id);
    if (!process) {
      throw Boom.notFound(`Process with id ${id} not found`);
    }
    return process;
  }
}

export default ProcessService;
