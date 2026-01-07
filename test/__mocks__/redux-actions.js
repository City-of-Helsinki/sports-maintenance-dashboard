// Mock for redux-actions to avoid ES module issues
export const createAction = (type, payloadCreator, metaCreator) => {
  const actionCreator = (payload) => ({
    type,
    payload: payloadCreator ? payloadCreator(payload) : payload,
    meta: metaCreator ? metaCreator(payload) : undefined
  });
  actionCreator.toString = () => type;
  return actionCreator;
};