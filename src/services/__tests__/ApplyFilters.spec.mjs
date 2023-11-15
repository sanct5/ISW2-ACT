import {
  describe, test, expect, jest,
} from '@jest/globals';
import ApplyFilter from '../ApplyFilterFunction/ApplyFilters.mjs';

describe('ApplyFilter', () => {
  let applyFilter;
  const observer = jest.fn();

  observer.notify = jest.fn();

  beforeEach(() => {
    applyFilter = new ApplyFilter();
  });

  describe('subscribe', () => {
    test('should add observer to observers list', () => {
      applyFilter.subscribe({ imgId: 3, filterId: 1, observer });
      expect(applyFilter.subscribers).toMatchObject({ 3: { 1: observer } });
    });
  });

  describe('unsubscribe', () => {
    test('should remove observer from observers list', () => {
      applyFilter.subscribe({ imgId: 3, filterId: 2, observer });
      applyFilter.unsubscribe(3, 2);
      expect(applyFilter.subscribers).toMatchObject({ 3: {} });
    });
  });

  describe('notify', () => {
    test('should call observer with correct parameters', () => {
      applyFilter.subscribe({ imgId: 1, filterId: 2, observer });
      applyFilter.notify({
        id: 1, imgId: 1, filterId: 2, imgUrl: 'http://example.com/test.jpg',
      });
      expect(observer.notify).toHaveBeenCalledWith(1, 1, 2, 'http://example.com/test.jpg');
    });

    test('should not call observer if no observer for filterId', () => {
      observer.notify.mockReset();
      applyFilter.subscribe({ imgId: 1, filterId: 2, observer });
      applyFilter.notify({
        id: 1, imgId: 1, filterId: 3, imgUrl: 'http://example.com/test.jpg',
      });
      expect(observer.notify).not.toHaveBeenCalled();
    });
  });
});
