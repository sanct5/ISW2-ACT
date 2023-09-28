import dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line
export const {MONGO_URI, PORT, MINIO_HOST,MINIO_ROOT_USER, MINIO_ROOT_PASSWORD} = process.env;