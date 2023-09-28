import ProcessRepository from '../repositories/ProcessRepository.mjs';
import ProcessService from '../services/ProcessService.mjs';
import MinioService from '../services/MinioService.mjs';

const buildContainer = (req, _res, next) => {
  const container = {};

  const processRepository = new ProcessRepository();
  const processService = new ProcessService({ processRepository, MinioService });

  container.processService = processService;

  req.container = container;

  return next();
};

export default buildContainer;
