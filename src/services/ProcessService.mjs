import Joi from 'joi';
import Boom from '@hapi/boom';
import { GREYSCALE_FILTER, BLUR_FILTER, NEGATIVE_FILTER } from '../commons/constans.mjs';

class ProcessService {
  processRepository = null;

  minioService = null;

  payloadValidation = Joi.object({
    filters: Joi.array().required().min(1)
      .items(Joi.string().valid(GREYSCALE_FILTER, BLUR_FILTER, NEGATIVE_FILTER)),
    images: Joi.array().required().min(1),
  }).required();

  constructor({ processRepository, minioService }) {
    this.processRepository = processRepository;
    this.minioService = minioService;
  }

  async applyFilters(payload) {
    try {
      await this.payloadValidation.validateAsync(payload);
    } catch (error) {
      throw Boom.badData(error.message, { error });
    }

    const { images, filters } = payload;

    const process = await this.processRepository.save({ filters });

    const totalSize = images.reduce((acum, image) => acum + image.size, 0);

    if (totalSize > 50 * 1024 * 1024) {
      throw Boom.badData('The total size sum of the images exceeds 50 MB.');
    }

    const imagesPromises = images.map((image) => this.minioService.saveImage(image));

    const imagesNames = await Promise.all(imagesPromises);

    console.log(imagesNames);

    return process;
  }
}

export default ProcessService;
