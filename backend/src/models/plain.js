export const plain = (document) =>
  document ? JSON.parse(JSON.stringify(document)) : null;
