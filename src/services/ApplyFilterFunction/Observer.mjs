import { READY_STATUS } from '../../commons/constans.mjs';

class Observer {
  constructor({ processRepository }) {
    this.processRepository = processRepository;
  }

  async notify(id, imgId, filterId, imgUrl) {
    await this.processRepository.updateOne(
      { _id: id, 'images._id': imgId, 'images.filters._id': filterId },
      {
        $set: {
          'images.$[image].filters.$[filter].status': READY_STATUS,
          'images.$[image].filters.$[filter].imgUrl': imgUrl,
        },
      },
      {
        arrayFilters: [
          { 'image._id': imgId },
          { 'filter._id': filterId },
        ],
      },
    );
  }
}

export default Observer;
