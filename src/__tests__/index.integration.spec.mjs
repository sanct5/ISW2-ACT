import request from 'supertest';
import express from 'express';
import {
  test, expect, describe, beforeEach, afterEach,
} from '@jest/globals';
import router from '../handlers/filters/index.mjs';
import { startConnection, closeConnection } from '../mongo/index.mjs';

beforeEach(async () => {
  await startConnection();
});

afterEach(async () => {
  await closeConnection();
});

const app = express();
app.use(router);

describe('router', () => {
  test('should respond to GET / with OK GET IMAGES', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK GET IMAGES');
  });
});
