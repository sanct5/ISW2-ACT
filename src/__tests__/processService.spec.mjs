import supertest from 'supertest';
import {
  describe, expect, beforeEach, afterEach, test,
} from '@jest/globals';

import app from '../app.mjs';
import { startConnection, closeConnection } from '../mongo/index.mjs';

beforeEach(async () => {
  await startConnection();
});

afterEach(async () => {
  await closeConnection();
});

describe('test app express server', () => {
  test('get / should return ok', async () => {
    const response = await supertest(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK NORMAL');
  });

  test('POST /images should return 200', async () => {
    const response = await supertest(app).post('/images')
      .set('Content-Type', 'multipart/form-data')
      .field('filters[]', 'grayscale')
      .field('filters[]', 'blur')
      .attach('images[]', './assets/test.jpg');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('filters');
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
  });

  test('POST /images shuld return 422 status', async () => {
    const response = await supertest(app).post('/images')
      .set('Content-Type', 'multipart/form-data')
      .field('filters[]', 'grayscale');

    expect(response.status).toBe(422);
    expect(response.body.message).toHaveProperty('"images" must contain at least 1 items');
  });
});
