import {
  describe, test, expect, jest,
} from '@jest/globals';
import Observer from '../ApplyFilterFunction/Observer.mjs';
import { READY_STATUS } from '../../commons/constans.mjs';

describe('Observer', () => {
  test('notify calls processRepository.updateOne with correct parameters', async () => {
    const mockUpdateOne = jest.fn();
    const processRepository = { updateOne: mockUpdateOne };
    const observer = new Observer({ processRepository });

    const id = 'testId';
    const imgId = 'testImgId';
    const filterId = 'testFilterId';
    const imgUrl = 'testImgUrl';

    await observer.notify(id, imgId, filterId, imgUrl);

    expect(mockUpdateOne).toHaveBeenCalledWith(
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
  });
});
