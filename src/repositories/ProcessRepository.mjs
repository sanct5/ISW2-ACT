import ProcessModel from '../models/Process.mjs';

class ProcessRepository {
  // eslint-disable-next-line class-methods-use-this
  async save(process) {
    const newProcess = new ProcessModel(process);
    newProcess.filters = process.filters;
    newProcess.images = process.images;
    await newProcess.save();
    return newProcess;
  }

  // eslint-disable-next-line class-methods-use-this
  async getProcessById(id) {
    const newProcess = await ProcessModel.findById(id);
    return newProcess;
  }
}

export default ProcessRepository;
