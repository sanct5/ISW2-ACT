import {
  describe, test, expect, jest,
} from '@jest/globals';
import ProcessRepository from '../../repositories/ProcessRepository.mjs';
import ProcessService from '../ProcessService.mjs';
import ApplyFiltersService from '../ApplyFiltersService.mjs';

describe('ProcessService test', () => {
  const processRepository = new ProcessRepository();

  const minioService = {
    saveImage: jest.fn()
      .mockImplementationOnce(() => Promise.resolve('image1.png')),
  };

  let processService = new ProcessService({ minioService, processRepository });

  test('Test applyFilters function with invalid payload', () => {
    expect(processService.applyFilters()).rejects.toThrow();
    expect(processService.applyFilters({})).rejects.toThrow();
    expect(processService.applyFilters({ filters: [] })).rejects.toThrow();
  });

  test('Test applyFilters function with valid payload', async () => {
    const payload = {
      filters: ['negative'],
      images: [
        { originalname: 'image1.png', buffer: Buffer.from('../../__tests__/assets/test.jpg'), filters: ['filter1'] },
      ],
    };
    const expectedProcess = {
      id: '1234',
      filters: payload.filters,
      images: payload.images,
    };

    const mockPayloadValidation = { validateAsync: jest.fn().mockResolvedValue() };
    const mockDataConstructor = jest.fn().mockResolvedValue(expectedProcess);

    processRepository.save = jest.fn()
      .mockImplementationOnce(() => expectedProcess);

    minioService.saveImage = jest.fn()
      .mockImplementationOnce(() => Promise.resolve('image1.png'));

    minioService.generateSignedUrl = jest.fn()
      .mockImplementationOnce(() => Promise.resolve('mocked-signed-url'));

    const ApplyFiltersServiceSpy = jest.spyOn(ApplyFiltersService, 'constructor');

    processService = new ProcessService({
      processRepository,
      minioService,
      payloadValidation: mockPayloadValidation,
      dataConstructor: mockDataConstructor,
    });

    let process;
    try {
      process = await processService.applyFilters(payload);
    } catch (error) {
      return error;
    }

    expect(process).toMatchObject(expectedProcess);
    expect(ApplyFiltersServiceSpy).toHaveBeenCalled();
    return null;
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
      .mockImplementationOnce(() => process);

    const result = await processService.getProcessById('1234');

    expect(result).toMatchObject(process);
  });

  test('Get image by id not found', async () => {
    processRepository.getProcessById = jest.fn()
      .mockImplementationOnce(() => null);

    try {
      await processService.getProcessById('1234');
    } catch (error) {
      expect(error.isBoom).toBe(true);
      expect(error.output.payload.message).toBe('Process with id 1234 not found');
    }
  });
});
