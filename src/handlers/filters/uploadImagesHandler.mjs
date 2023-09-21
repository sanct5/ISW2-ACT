import Boom from '@hapi/boom';
import HttpStatusCodes from 'http-status-codes';
import uploadImages from '../../controllers/filters/uploadImages.mjs';

const uploadImagesHandler = async (req, res, next) => {
  try {
    const { files } = req;
    console.log(files);

    if (files.length === 0) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: 'No se enviaron imagenes.' });
    }

    if (files.length > 3) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: 'Se permiten como máximo 3 imagenes.' });
    }

    for (const file of files) {
      if (!file.originalname.match(/\.(jpg|jpeg)$/i)) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: 'Las imagenes deben estar en formato JPG o JPEG.' });
      }
    }

    const response = await uploadImages(files);
    return res.status(HttpStatusCodes.OK).json(response);
  } catch (error) {
    const err = Boom.isBoom(error) ? error : Boom.internal(error);
    next(err);
  }

  return next;
};

export default uploadImagesHandler;
