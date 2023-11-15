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

  // eslint-disable-next-line class-methods-use-this
  async updateOne(id, data, option = { new: true }) {
    await ProcessModel.findOneAndUpdate(id, data, option);
  }
}

export default ProcessRepository;
