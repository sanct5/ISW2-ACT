import {
  describe, test, expect, jest,
} from '@jest/globals';
import ProcessRepository from '../../repositories/ProcessRepository.mjs';
import ProcessModel from '../../models/Process.mjs';

describe('ProcessRepository test', () => {
  test('Test save method', async () => {
    const processRepository = new ProcessRepository();
    const payload = {
      filters: ['negative', 'grayscale'],
      images: [
        {
          originalname: 'img.png',
          buffer: Buffer.from('./assets/test.jpg'),
        },
      ],
    };

    // Mockear ProcessModel para evitar llamadas a la base de datos
    jest.spyOn(ProcessModel.prototype, 'save').mockResolvedValueOnce();

    const process = await processRepository.save(payload);

    // Verificar que ProcessModel.save haya sido llamada con el nuevo proceso
    expect(ProcessModel.prototype.save).toHaveBeenCalledWith();

    // Verificar que la función save devuelva un objeto ProcessModel
    expect(process).toBeInstanceOf(ProcessModel);

    // Restaurar la implementación original después de la prueba
    ProcessModel.prototype.save.mockRestore();
  });

  test('Test getProcessById method', async () => {
    const processRepository = new ProcessRepository();
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

  test('Test updateOne method', async () => {
    const processRepository = new ProcessRepository();
    const mockProcess = {
      id: '1234',
      filters: ['negative'],
      images: [{ originalname: 'image1.png', buffer: Buffer.from('') }],
    };

    ProcessModel.findOneAndUpdate = jest.fn().mockResolvedValue(mockProcess);

    const data = { filters: ['negative'] };
    const option = { new: true };

    const fetchedProcess = await processRepository.updateOne('1234', data, option);

    expect(fetchedProcess).toMatchObject(mockProcess);
    expect(ProcessModel.findOneAndUpdate).toHaveBeenCalledWith('1234', data, option);
  });
});
