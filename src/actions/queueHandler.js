import _ from 'lodash';

import { markObservationSent, sendObservation } from './index';

function updater (item) {
  console.log('updater called for', item);
}

const throttledUpdater = _.throttle(updater, 1000);

function markAndSendObservation(store, item) {
  store.dispatch(markObservationSent(item));
  store.dispatch(sendObservation(item));
}

export default function queueHandler(store) {
  return () => {
    const queue = store.getState().updateQueue;
    // const filteredQueue = _.filter(queue, (item) => {
    //   // Pending elements have a web request underway,
    //   // do not retry while waiting for answer
    //   return item.status !== 'pending';
    // });
    const enqueuedItems = _.filter(queue, (item) => {
      return item.status === 'enqueued';
    });
    _.each(enqueuedItems, (item) => {
      markAndSendObservation(store, item);
    });
  };
}
