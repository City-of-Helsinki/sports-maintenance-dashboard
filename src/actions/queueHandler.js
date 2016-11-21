import _ from 'lodash';

import { markObservationSent, sendObservation } from './index';

function updater (item) {
  console.log('updater called for', item);
}

const throttledUpdater = _.throttle(updater, 1000);

function send(store, item) {
  store.dispatch(sendObservation(item));
}

function markAndSendObservation(store, item) {
  store.dispatch(markObservationSent(item));
  send(store, item);
}

export default function queueHandler(store) {
  return () => {
    const queue = store.getState().updateQueue;
    console.log(queue);
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
    const itemsToRetry = _.filter(queue, (item) => {
      return item.status === 'failed';
    });
    _.each(itemsToRetry, (item) => {
      const QUARTER_MINUTE = 15000;
      store.dispatch(markObservationSent(item));
      _.delay(send, QUARTER_MINUTE, [store, item]);
    });
  };
}
