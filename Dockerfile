FROM node:18-alpine

WORKDIR /usr/app

COPY index.mjs .
COPY package.json .
COPY package-lock.json .
COPY /src ./src/

ENV  MONGO_URI mongodb+srv://santiagocampino:gORPeCarETqkTdJC@practice.lh0kqgz.mongodb.net/?retryWrites=true&w=majority
ENV PORT 5001
ENV MINIO_HOST htt://minio:9000
ENV MINIO_ACCESS_KEYENV santiago
ENV MINIO_SECRET_KEY santiago
EXPOSE 5001

RUN npm install --production

ENTRYPOINT [ "npm","start" ]