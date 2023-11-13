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
      .attach('images[]', 'src/__tests__/assets/test.jpg');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('filters');
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
  });

  test('POST /images should return 422 status', async () => {
    const response = await supertest(app).post('/images')
      .set('Content-Type', 'multipart/form-data')
      .field('filters[]', 'invalid_filter');

    expect(response.status).toBe(422);
    expect(response.body.message).toContain('"filters[0]" must be one of [greyscale, blur, negative]');
  });

  test('POST /image should return "Filter are required"', async () => {
    const response = await supertest(app).post('/images')
      .set('Content-Type', 'multipart/form-data')
      .attach('images[]', 'src/__tests__/assets/test.jpg');

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('\"filters\" is required');
  });

  test('POST /images should return 500 status', async () => {
    const response = await supertest(app).post('/images')
      .set('Content-Type', 'multipart/form-data')
      .field('filters[]', 'grayscale')
      .field('filters[]', 'blur')
      .attach('images[]', 'src/__tests__/assets/test.png');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
  });
});
