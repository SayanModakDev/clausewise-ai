const serverOnlyPath = require.resolve('server-only');
require.cache[serverOnlyPath] = {
  id: serverOnlyPath,
  path: '',
  exports: {},
  filename: serverOnlyPath,
  loaded: true,
  children: [],
  paths: [],
  isPreloading: false,
  require: require,
  parent: null,
};
