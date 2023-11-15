class ApplyFilter {
  constructor() {
    this.subscribers = {};
  }

  subscribe({ imgId, filterId, observer }) {
    if (!this.subscribers[imgId]) {
      this.subscribers[imgId] = [];
    }
    this.subscribers[imgId][filterId] = observer;
  }

  unsubscribe(imgId, filterId) {
    if (this.subscribers[imgId]) {
      this.subscribers[imgId] = this.subscribers[imgId].filter((id) => id !== filterId);
    }
  }

  notify({
    id, imgId, filterId, imgUrl,
  }) {
    console.log('ApplyFilter.notify called');
    if (this.subscribers[imgId] && this.subscribers[imgId][filterId]) {
      this.subscribers[imgId][filterId].notify(id, imgId, filterId, imgUrl);
    }
  }
}

export default ApplyFilter;
