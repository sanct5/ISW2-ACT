import HttpStatusCodes from 'http-status-codes';
import {
  test, jest, expect, describe, beforeEach, afterEach,
} from '@jest/globals';
import applyFiltersHandler from '../handlers/filters/applyFiltersHandler.mjs';
import { startConnection, closeConnection } from '../mongo/index.mjs';

beforeEach(async () => {
  await startConnection();
});

afterEach(async () => {
  await closeConnection();
});

describe('applyFiltersHandler', () => {
  test('should handle successful filter application', async () => {
    const mockResponse = {};
    const req = {
      body: {},
      files: [],
      container: {
        processService: {
          applyFilters: jest.fn().mockResolvedValue(mockResponse),
        },
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    await applyFiltersHandler(req, res, next);

    expect(req.container.processService.applyFilters).toHaveBeenCalledWith({ images: [] });
    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
    expect(next).not.toHaveBeenCalled();
  });

  test('should handle errors', async () => {
    const error = new Error('test error');
    const req = {
      body: {},
      files: [],
      container: {
        processService: {
          applyFilters: jest.fn().mockRejectedValue(error),
        },
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    await applyFiltersHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.anything());
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
