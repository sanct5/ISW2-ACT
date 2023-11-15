import Joi from 'joi';
import Boom from '@hapi/boom';
import {
  GREYSCALE_FILTER, BLUR_FILTER, NEGATIVE_FILTER, IN_PROGRESS_STATUS,
} from '../commons/constans.mjs';
import ApplyFiltersService from './ApplyFiltersService.mjs';

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

    const imagesPromises = images.map((image) => this.minioService.saveImage(image));

    await Promise.all(imagesPromises);

    const Data = await this.dataConstructor(images, filters, this.minioService);
    const process = await this.processRepository.save(Data);

    const newData = {
      // eslint-disable-next-line
      id: process._id,
      images: process.images.map((image) => ({
        // eslint-disable-next-line
        id: image._id,
        filters: image.filters.map((filter) => ({
          // eslint-disable-next-line
          id: filter._id,
          name: filter.name,
        })),
        originalname: image.originalname,
        buffer: images.find((img) => img.originalname === image.originalname).buffer,
      })),
    };

    new ApplyFiltersService({
      processRepository: this.processRepository,
      minioService: this.minioService,
    }).applyFilters(newData);

    return process;
  }

  async dataImage(img, filter) {
    const imageUrl = await this.minioService.generateSignedUrl(img.originalname);
    const filterData = {
      name: filter,
      status: IN_PROGRESS_STATUS,
    };
    return { imageUrl, filters: [filterData], originalname: img.originalname };
  }

  async dataConstructor(imgs, filters) {
    const imagesData = await Promise.all(
      imgs.flatMap((image) => filters.map((filter) => this.dataImage({ ...image, originalname: `${image.originalname}` }, filter))),
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
