import HttpStatusCodes from 'http-status-codes';
import Boom from '@hapi/boom';
import {
  test, jest, expect, describe, beforeEach, afterEach,
} from '@jest/globals';
import getProcessByIdHandler from '../handlers/getProcessByIdHandler.mjs';
import { startConnection, closeConnection } from '../mongo/index.mjs';

beforeEach(async () => {
  await startConnection();
});

afterEach(async () => {
  await closeConnection();
});

describe('getProcessByIdHandler', () => {
  test('should return process by id', async () => {
    const mockReq = {
      params: { id: '1' },
      container: {
        processService: {
          getProcessById: jest.fn().mockResolvedValue({ id: '1', name: 'Process 1' }),
        },
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await getProcessByIdHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCodes.OK);
    expect(mockRes.json).toHaveBeenCalledWith({ id: '1', name: 'Process 1' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should handle error', async () => {
    const mockError = new Error('Error');
    const mockReq = {
      params: { id: '1' },
      container: {
        processService: {
          getProcessById: jest.fn().mockRejectedValue(mockError),
        },
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await getProcessByIdHandler(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(Boom.internal(mockError));
  });
});
