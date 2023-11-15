FROM node:18-alpine

WORKDIR /usr/app

COPY index.mjs .
COPY package.json .
COPY package-lock.json .
COPY /src ./src/

ENV MONGO_URI mongodb+srv://santiagocampino:gORPeCarETqkTdJC@practice.lh0kqgz.mongodb.net/?retryWrites=true&w=majority
ENV PORT 5001
ENV MINIO_HOST http://minio:9000
ENV MINIO_ACCESS_KEY santiago
ENV MINIO_SECRET_KEY santiago
EXPOSE 5001

RUN npm install --production

RUN npm install pm2 -g
ENV PM2_PUBLIC_KEY ccqt26xeem58946
ENV PM2_SECRET_KEY 5zkwaph4n0s0b0z

CMD ["pm2-runtime", "index.mjs", "--instances", "2"]

# ENTRYPOINT [ "npm","start" ]