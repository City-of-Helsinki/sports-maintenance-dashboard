import filter from 'lodash/filter';
import each from 'lodash/each';
import delay from 'lodash/delay';

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
    const enqueuedItems = filter(queue, makeFilter('enqueued'));
    const itemsToRetry = filter(queue, makeFilter('failed'));
    const itemsToRefresh = filter(queue, makeFilter('success'));

    each(enqueuedItems, (item: PendingObservationData) => {
      markAndSendObservation(store, item);
    });

    const shouldRetryImmediately = ((opts?.initial === true) || store.getState().updateFlush);
    if (shouldRetryImmediately) {
      each(timers, (_value, key) => {
        clearTimeout(Number(key));
      });
      timers = {};
      const itemsToRetryImmediately = filter(queue, (item: PendingObservationData) => {
        const {status} = item;
        return (status === 'failed' || status === 'retrying');
      });
      each(itemsToRetryImmediately, (item: PendingObservationData) => {
        send(store, item);
      });
    }
    else {
      each(itemsToRetry, (item: PendingObservationData) => {
        store.dispatch(markObservationResent(item));
        const QUARTER_MINUTE = 15000;
        let timerId = delay(send, QUARTER_MINUTE, store, item);
        timers[timerId] = true;
      });
    }
    if (shouldRetryImmediately) {
      store.dispatch(finishRetryImmediately());
    }
    each(itemsToRefresh, (item: PendingObservationData) => {
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