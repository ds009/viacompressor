const loaderUtils = require('loader-utils')
const fs = require('fs')
const squoosh  = require('@squoosh/lib');

const {ImagePool} = squoosh;
const extMap = {
  jpg:'mozjpeg',
  jpeg:'mozjpeg',
  png:'oxipng',
}

function handlePath(resourcePath) {
  const index = resourcePath.lastIndexOf('/')
  return {folder:resourcePath.slice(0, index),name:resourcePath.slice(index+1)}
}
module.exports = function (source, map) {
  // init options
  const urlQuery = this.resourceQuery
    ? loaderUtils.parseQuery(this.resourceQuery)
    : null
  const options = Object.assign({}, loaderUtils.getOptions(this), urlQuery)
  if(!options.compress) return source;
  const quality = (options.quality || 0.8)*100;
  const path = this.resourcePath;
  // ignore excluded files
  if (!path || (options.exclude && path.match(options.exclude))) return source

  const currentSize = fs.statSync(path).size;
  if(currentSize < 0.1 * 1024 * 1024){
    // 小于100K不处理
    return source;
  }else if (currentSize > 1024 * 1024){
    console.log('!!!Image size too large: '+path)
    // show alert and go on
  }
  const {folder,name} = handlePath(path);
  const infoPath = folder+'/min.json';
  let oldInfo = {};
  try {
    const infoFile = fs.readFileSync(infoPath)
    if(infoFile){
      oldInfo = JSON.parse(infoFile)
      if(oldInfo[name]===currentSize){
        // compressed before
        return source
      }
    }
  }catch (e) {
    // ignore
  }
  const callback = this.async();
  async function compress(callback) {
    const imagePool = new ImagePool();
    const image = imagePool.ingestImage(path);
    const encodeType = extMap[name.split('.').pop()];
    await image.decoded;
    await image.encode({[encodeType]:{quality}});
    await imagePool.close();
    const encoded = await image.encodedWith[encodeType]
    const rawEncodedImage = encoded.binary;
    fs.writeFileSync(path, rawEncodedImage);
    oldInfo[name] = encoded.size;
    fs.writeFileSync(infoPath, JSON.stringify(oldInfo, null, 2), {flag: 'w+'})
    callback(null,source);
  }
  compress(callback)
}
