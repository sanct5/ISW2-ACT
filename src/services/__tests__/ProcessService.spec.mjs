import {
  describe, test, expect, jest,
} from '@jest/globals';
import { supertest } from 'supertest';
import ProcessRepository from '../../repositories/ProcessRepository.mjs';
import MinioService from '../MinioService.mjs';
import ProcessService from '../ProcessService.mjs';
import app from '../../app.mjs';

describe('ProcessService test', () => {
  const processRepository = new ProcessRepository();

  const minioService = new MinioService();

  const processService = new ProcessService({ minioService, processRepository });

  test('Test applyFilters function with invalid payoad', () => {
    expect(processService.applyFilters()).rejects.toThrow();
    expect(processService.applyFilters({})).rejects.toThrow();
    expect(processService.applyFilters({ filters: [] })).rejects.toThrow();
  });
  test('Test applyFilters function with valid payload', async () => {
    const payload = {
      filters: ['negative'],
      images: [{ originalname: 'image1.png', buffer: Buffer.from('') }],
    };
    const expectedProcess = {
      id: '1234',
      filters: payload.filters,
      images: payload.images,
    };

    processRepository.save = jest.fn()
      .mockImplementationOnce(() => expectedProcess);

    minioService.saveImage = jest.fn()
      .mockImplementationOnce(() => Promise.resolve('image1.png'));

    const process = await processService.applyFilters(payload);

    expect(process).toMatchObject(expectedProcess);
  });

  test('POST /images should return 200', async () => {
    const response = await supertest(app).post('/images')
      .set('Content-Type', 'multipart/form-data')
      .field('filters[]', 'grayscale')
      .field('filters[]', 'blur')
      .attach('images[]', 'src/__tests__/assets/img.jpeg');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('filters');
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
  });
});
