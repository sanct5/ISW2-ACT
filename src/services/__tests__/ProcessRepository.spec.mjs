import {
  describe, test, expect, jest,
} from '@jest/globals';
import ProcessRepository from '../../repositories/ProcessRepository.mjs';
import ProcessModel from '../../models/Process.mjs';

jest.mock('../../models/Process.mjs', () => jest.fn().mockImplementation((process) => ({
  ...process,
  save: jest.fn().mockImplementation(() => Promise.resolve(this)),
})));

describe('ProcessRepository test', () => {
  const processRepository = new ProcessRepository();

  test('Test save method', async () => {
    jest.restoreAllMocks(); // Restore all mocks from previous tests

    const mockProcess = {
      filters: ['negative'],
      images: [{ originalname: 'image1.png', buffer: Buffer.from(''), imageUrl: 'http://example.com/image1.png' }],
    };

    const savedProcess = await processRepository.save(mockProcess);

    expect(savedProcess).toMatchObject(mockProcess);
    expect(ProcessModel).toHaveBeenCalled();
    expect(ProcessModel.mock.instances[0].save).toHaveBeenCalled();
  }, 10000);

  test('Test getProcessById method', async () => {
    const mockProcess = {
      id: '1234',
      filters: ['negative'],
      images: [{ originalname: 'image1.png', buffer: Buffer.from('') }],
    };

    ProcessModel.findById = jest.fn().mockResolvedValue(mockProcess);

    const fetchedProcess = await processRepository.getProcessById('1234');

    expect(fetchedProcess).toMatchObject(mockProcess);
    expect(ProcessModel.findById).toHaveBeenCalledWith('1234');
  });
});
