class MinioService {
  conn = null;

  constructor() {

  }

  async saveImage(image) {
    try {
      const { originalname, buffer } = image;
      const { name, ext } = this.getFileNameAndExtension(originalname);
      const fileName = `${name}-${Date.now()}.${ext}`;
      await this.conn.putObject('images', fileName, buffer);
      return fileName;
    } catch (error) {
      return error;
    }
  }
}

export default MinioService;
