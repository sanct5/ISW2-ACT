import {
  describe, test, expect, jest, afterEach,
} from '@jest/globals';
import sharp from 'sharp';
import Boom from '@hapi/boom';
import ProcessRepository from '../../repositories/ProcessRepository.mjs';
import ProcessService from '../ProcessService.mjs';

jest.mock('sharp', () => () => ({
  greyscale: jest.fn().mockReturnThis(),
  blur: jest.fn().mockReturnThis(),
  negate: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue('mock result'),
}));

describe('ProcessService test', () => {
  const processRepository = new ProcessRepository();

  const minioService = {
    saveImage: jest.fn()
      .mockImplementation(() => Promise.resolve('image1.png')),
  };

  const processService = new ProcessService({ minioService, processRepository });

  afterEach(jest.clearAllMocks);

  test('Test applyFilters function with invalid payload', async () => {
    await expect(processService.applyFilters()).rejects.toThrow();
    await expect(processService.applyFilters({})).rejects.toThrow();
    await expect(processService.applyFilters({ filters: [] })).rejects.toThrow();
  });

  test('Test applyFilters function with valid payload', async () => {
    const payload = {
      filters: ['negative'],
      images: [{ originalname: 'image1.png', buffer: Buffer.from('Hello, world!') }],
    };
    const expectedProcess = {
      id: '1234',
      filters: payload.filters,
      images: payload.images,
    };

    processRepository.save = jest.fn()
      .mockImplementationOnce(() => Promise.resolve(expectedProcess));

    minioService.saveImage = jest.fn()
      .mockImplementationOnce(() => Promise.resolve('image1.png'));

    minioService.generateSignedUrl = jest.fn()
      .mockImplementationOnce(() => Promise.resolve('mocked-signed-url'));

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

    await expect(processService.applyFilters(payload)).rejects.toThrow('The total size sum of the images exceeds 50 MB.');
  });

  test('Get image by id', async () => {
    const process = {
      id: '1234',
      filters: ['negative'],
      images: [
        {
          imageUrl: 'image1.png',
          filters: [
            { name: 'negative', status: 'IN_PROGRESS' },
          ],
        },
      ],
    };

    processRepository.getProcessById = jest.fn()
      .mockImplementationOnce(() => Promise.resolve(process));

    const result = await processRepository.getProcessById('1234');

    expect(result).toMatchObject(process);
  });

  test('Test applyFilter method', async () => {
    const mockImageBuffer = Buffer.from('mock image buffer');

    const result = await processService.applyFilter('GREYSCALE_FILTER', mockImageBuffer);

    expect(result).toBe('mock result');
  });

  test('Test applyFilter method with invalid filter', async () => {
    const mockImageBuffer = Buffer.from('mock image buffer');

    await expect(processService.applyFilter('INVALID_FILTER', mockImageBuffer)).rejects.toThrow(Boom.badData('Invalid filter: INVALID_FILTER'));
  });
});
