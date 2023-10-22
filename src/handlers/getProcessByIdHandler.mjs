import Boom from '@hapi/boom';
import HttpStatusCodes from 'http-status-codes';

const getProcessByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await req.container
      .processService.getProcessById(id);
    return res.status(HttpStatusCodes.OK).json(response);
  } catch (error) {
    const err = Boom.isBoom(error) ? error : Boom.internal(error);
    return next(err);
  }
};

export default getProcessByIdHandler;
