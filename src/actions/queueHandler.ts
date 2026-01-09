import _ from 'lodash';

import {
  markObservationSent,
  markObservationResent,
  sendObservation,
  fetchResource,
  finishRetryImmediately } from './index';
import { RootState, PendingObservationData } from '../reducers/types';

interface QueueHandlerOptions {
  initial?: boolean;
}

interface Store {
  getState(): RootState;
  dispatch(action: any): void;
}

function send(store: Store, item: PendingObservationData): void {
  store.dispatch(sendObservation(item, store.getState().auth.token));
}

function markAndSendObservation(store: Store, item: PendingObservationData): void {
  store.dispatch(markObservationSent(item));
  send(store, item);
}

function makeFilter(status: string) {
  return (item: PendingObservationData): boolean => { return item.status === status; };
}

export default function queueHandler(store: Store) {
  let timers: Record<string, boolean> = {};
  return (opts?: QueueHandlerOptions): void => {
    const queue = store.getState().updateQueue;
    const enqueuedItems = _.filter(queue, makeFilter('enqueued'));
    const itemsToRetry = _.filter(queue, makeFilter('failed'));
    const itemsToRefresh = _.filter(queue, makeFilter('success'));

    _.each(enqueuedItems, (item: PendingObservationData) => {
      markAndSendObservation(store, item);
    });

    const shouldRetryImmediately = ((opts?.initial === true) || store.getState().updateFlush);
    if (shouldRetryImmediately) {
      _.each(timers, (_, key) => {
        clearTimeout(Number(key));
      });
      timers = {};
      const itemsToRetryImmediately = _.filter(queue, (item: PendingObservationData) => {
        const {status} = item;
        return (status === 'failed' || status === 'retrying');
      });
      _.each(itemsToRetryImmediately, (item: PendingObservationData) => {
        send(store, item);
      });
    }
    else {
      _.each(itemsToRetry, (item: PendingObservationData) => {
        store.dispatch(markObservationResent(item));
        const QUARTER_MINUTE = 15000;
        let timerId = _.delay(send, QUARTER_MINUTE, store, item);
        timers[timerId] = true;
      });
    }
    if (shouldRetryImmediately) {
      store.dispatch(finishRetryImmediately());
    }
    _.each(itemsToRefresh, (item: PendingObservationData) => {
      store.dispatch(
        fetchResource(
          'unit',
          {id: item.unitId},
          ['id', 'name', 'services', 'extensions'],
          ['observations'],
          {observation: item})
      );
    });
  };
}