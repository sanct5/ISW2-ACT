import supertest from 'supertest';
import {
  describe, jest, expect, beforeEach, afterEach, test,
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
    const response = await supertest(app).post('/images').set('Content-Type', 'multipart/form-data')
      .field('filters[]', 'grayscale')
      .field('filters[]', 'blur')
      .attach('images[]', 'src/__tests__/test.jpg');
    expect(response.status).toBe(200);
  });
});
