import Joi from 'joi';
import Boom from '@hapi/boom';
import { GREYSCALE_FILTER, BLUR_FILTER, NEGATIVE_FILTER } from '../commons/constans.mjs';

class ProcessService {
  processRepository = null;

  payloadValidation = Joi.object({
    filters: Joi.array().required().min(1)
      .items(Joi.string().valid(GREYSCALE_FILTER, BLUR_FILTER, NEGATIVE_FILTER)),
    images: Joi.array().required().min(1),
  }).required();

  constructor({ processRepository }) {
    this.processRepository = processRepository;
  }

  async applyFilters(payload) {
    try {
      await this.payloadValidation.validateAsync(payload);
    } catch (error) {
      throw Boom.badData(error.message, { error });
    }

    const process = await this.processRepository.save(payload);
    return process;
  }
}

export default ProcessService;
