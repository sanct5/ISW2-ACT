import Boom from "@hapi/boom";

const uploadImages = async () => {
    try {
        return { message: 'Imagenes subidas correctamente.' }
        
    } catch (error) {
        const err = Boom.isBoom(error) ? error : Boom.internal(error);
        next(err);
    }
};

export default uploadImages;