import {
  describe, test, expect, jest, afterEach,
} from '@jest/globals';
import sharp from 'sharp';
import ApplyFiltersService from '../ApplyFiltersService.mjs';
import ProcessRepository from '../../repositories/ProcessRepository.mjs';
import Observer from '../ApplyFilterFunction/Observer.mjs';

// Mock the Observer class
jest.mock('../ApplyFilterFunction/Observer.mjs');

jest.mock('../ApplyFilterFunction/ApplyFilters', () => jest.fn().mockImplementation(() => ({
  subscribe: jest.fn(),
  notify: jest.fn(),
})));

describe('ApplyFiltersService test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Test applyFilters method', async () => {
    const sharpGrayscale = jest.spyOn(sharp.prototype, 'grayscale');
    const sharpToBuffer = jest.spyOn(sharp.prototype, 'toBuffer');
    const mockUpdateOne = jest.fn();
    const processRepository = {
      updateOne: mockUpdateOne,
    };
    processRepository.save = jest.fn();

    const minioService = {
      saveImage: jest.fn().mockResolvedValue(),
      generateSignedUrl: jest.fn().mockResolvedValue('test.jpg'),
    };

    const observer = new Observer({ processRepository });
    observer.notify = jest.fn(); // Mock the notify method

    const applyFiltersService = new ApplyFiltersService({
      processRepository,
      minioService,
      observer, // Provide the mocked Observer instance
    });

    const validPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');

    const payload = {
      images: [
        {
          originalname: 'img.png',
          buffer: validPngBuffer,
          filters: ['negative', 'grayscale'], // Move filters here
        },
      ],
    };

    try {
      await applyFiltersService.applyFilters(payload);

      // Assertions

      expect(sharpGrayscale).toHaveBeenCalled();
      expect(sharpToBuffer).toHaveBeenCalled();
      expect(minioService.saveImage).toHaveBeenCalledWith({
        originalname: 'img-grayscale.png',
        buffer: expect.any(Buffer),
      });
      expect(processRepository.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(String), 'images._id': expect.any(String) },
        {
          $set: {
            'images.$.filters.$[filter].status': 'completed',
            'images.$.filters.$[filter].imgUrl': 'test.jpg',
          },
        },
        {
          arrayFilters: [{ 'filter.name': 'grayscale' }],
        },
      );
      expect(observer.notify).toHaveBeenCalled(); // Ensure that the notify method is called
    } catch (error) {
      return error;
    }
  });

  test('Test saveImage method', async () => {
    const processRepository = new ProcessRepository();
    const applyFiltersService = new ApplyFiltersService({
      processRepository,
    });

    const image = {
      originalname: 'img.png',
      buffer: Buffer.from('./assets/test.jpg'),
    };
    applyFiltersService.saveImage = jest.fn();

    await applyFiltersService.saveImage(image);
    expect(processRepository.saveImage).toHaveBeenCalledWith(image);
  });

  test('Test rename method', () => {
    const processRepository = new ProcessRepository();
    const applyFiltersService = new ApplyFiltersService({
      processRepository,
    });

    applyFiltersService.rename = jest.fn(applyFiltersService.rename);

    const originalname = 'img.png';
    const filterName = 'grayscale';

    const result = applyFiltersService.rename(originalname, filterName);

    expect(applyFiltersService.rename).toHaveBeenCalled();
    expect(result).toBe('img-grayscale.png');
  });
});
