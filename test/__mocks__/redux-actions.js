// Mock for redux-actions to avoid ES module issues
export const createAction = (type, payloadCreator, metaCreator) => {
  const actionCreator = (...args) => ({
    type,
    payload: payloadCreator ? payloadCreator(...args) : args[0],
    meta: metaCreator ? metaCreator(...args) : undefined
  });
  actionCreator.toString = () => type;
  return actionCreator;
};