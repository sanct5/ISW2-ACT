import Boom from '@hapi/boom';
import HttpStatusCodes from 'http-status-codes';
import applyFilters from '../../controllers/filters/applyFilters.mjs';

const applyFiltersHandler = async (req, res, next) => {
  try {
    const { body } = req;

    if (!body.filters) {
      throw Boom.badData('No se enviaron filtros');
    }

    let filters = [];
    try {
      filters = JSON.parse(body.filters);
    } catch (error) {
      throw Boom.badData('No se hallaron los filtros');
    }

    const response = await applyFilters({ filters, images: req.files });
    return res.status(HttpStatusCodes.OK).json(response);
  } catch (error) {
    const err = Boom.isBoom(error) ? error : Boom.internal(error);
    return next(err);
  }
};
export default applyFiltersHandler;
