import Express from 'express';
import bodyParser from 'body-parser';
import Boom from '@hapi/boom';
import { startConnection } from './src/mongo/index.mjs';
import FiltersRouter from './src/handlers/filters/index.mjs';
import { PORT } from './src/commons/env.mjs';

const app = Express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('OK NORMAL');
});

app.use('/images', FiltersRouter);

app.use((error, req, res, next) => {
  if (error) {
    const err = Boom.isBoom(error) ? error : Boom.internal(error);
    const { statusCode } = err.output;
    const { payload } = err.output;
    return res.status(statusCode).json(payload);
  }
  return next;
});

const startServer = async () => {
  await startConnection();
  app.listen(PORT, () => {
    // eslint-disable-next-line
    console.log(`http://localhost:${PORT}`);
  });
};

startServer();

// Dockerizacion -> docker-compose up -d
// Detenerlo -> docker-compose stop
