import _ from 'lodash';

import {
  markObservationSent,
  markObservationResent,
  sendObservation,
  fetchResource,
  finishRetryImmediately } from './index';

function send(store, item) {
  store.dispatch(sendObservation(item));
}

function markAndSendObservation(store, item) {
  store.dispatch(markObservationSent(item));
  send(store, item);
}

function makeFilter(status) {
  return (item) => { return item.status === status; };
}

export default function queueHandler(store) {
  let timers = {};
  return () => {
    const queue = store.getState().updateQueue;
    console.log(queue);
    const enqueuedItems = _.filter(queue, makeFilter('enqueued'));
    const itemsToRetry = _.filter(queue, makeFilter('failed'));
    const itemsToRefresh = _.filter(queue, makeFilter('success'));


    _.each(enqueuedItems, (item) => {
      markAndSendObservation(store, item);
    });

    const shouldRetryImmediately = store.getState().updateFlush;
    if (shouldRetryImmediately) {
      _.each(timers, (_, key) => {
        clearTimeout(key);
      });
      timers = {};
      const itemsToRetryImmediately = _.filter(queue, (item) => {
        const {status} = item;
        return (status === 'failed' || status === 'retrying');
      });
      _.each(itemsToRetryImmediately, (item) => {
        send(store, item);
      });
    }
    else {
      _.each(itemsToRetry, (item) => {
          store.dispatch(markObservationResent(item));
          const QUARTER_MINUTE = 15000;
          let timerId = _.delay(send, QUARTER_MINUTE, store, item);
          timers[timerId] = true;
      });
    }
    if (shouldRetryImmediately) {
      store.dispatch(finishRetryImmediately());
    }
    _.each(itemsToRefresh, (item) => {
      store.dispatch(
        fetchResource(
          'unit',
          {id: item.unitId},
          ['id', 'name', 'services'],
          ['observations'],
          {observation: item})
      );
    });
  };
}
