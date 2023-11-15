import Express from 'express';
import bodyParser from 'body-parser';
import Boom from '@hapi/boom';
import FiltersRouter from './handlers/filters/index.mjs';
import buildContainer from './container/buildContainer.mjs';

const app = Express();
app.use(bodyParser.json());
app.use(buildContainer);

app.get('/', (req, res) => {
  res.send('OK NORMAL');
});

app.use('/images', FiltersRouter);

app.use((error, req, res, next) => {
  if (error) {
    const err = Boom.isBoom(error) ? error : Boom.internal(error);
    const { statusCode } = err.output;
    const { payload } = err.output;
    payload.stack = error.stack;
    return res.status(statusCode).json(payload);
  }
  return next;
});

export default app;
