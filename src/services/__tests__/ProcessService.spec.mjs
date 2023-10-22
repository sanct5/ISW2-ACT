import {
  describe, test, expect, jest,
} from '@jest/globals';
import ProcessRepository from '../../repositories/ProcessRepository.mjs';
// import MinioService from '../MinioService.mjs';
import ProcessService from '../ProcessService.mjs';

describe('ProcessService test', () => {
  const processRepository = new ProcessRepository();

  const minioService = {
    saveImage: jest.fn()
      .mockImplementationOnce(() => Promise.resolve('image1.png')),
  };

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

  test('Test upload images whose size exceeds 50MB', async () => {
    const payload = {
      filters: ['negative'],
      images: [
        { originalname: 'image1.png', buffer: Buffer.from(''), size: 30 * 1024 * 1024 }, // Image 30MB
        { originalname: 'image1.png', buffer: Buffer.from(''), size: 25 * 1024 * 1024 }, // Image 25MB
      ],
    };

    try {
      await processService.applyFilters(payload);
    } catch (error) {
      expect(error.isBoom).toBe(true);
      expect(error.output.payload.message).toBe('The total size sum of the images exceeds 50 MB.');
    }
  });
});
