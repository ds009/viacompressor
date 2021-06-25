const loaderUtils = require('loader-utils')
const compress = require('./compress')

module.exports = function (source) {
  // init options
  const urlQuery = this.resourceQuery
    ? loaderUtils.parseQuery(this.resourceQuery)
    : null
  const options = Object.assign({}, loaderUtils.getOptions(this), urlQuery)
  if(!options.compress) return source;
  const callback = this.async();
  options.path = this.resourcePath;
  compress(source, options, callback)
}
