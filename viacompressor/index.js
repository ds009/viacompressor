const loaderUtils = require('loader-utils')
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const fs = require('fs')
const md5 = require('blueimp-md5')

function handlePath(resourcePath) {
  const index = resourcePath.lastIndexOf('/')
  return {folder:resourcePath.slice(0, index),name:resourcePath.slice(index+1)}
}
async function compress(path,folder, quality){

  const files = await imagemin([path], {
    destination: folder,
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [quality,1]
      })
    ]
  });
  return md5(files[0].data);
}
module.exports = function (source, map) {
  // init options
  const urlQuery = this.resourceQuery
    ? loaderUtils.parseQuery(this.resourceQuery)
    : null
  const options = Object.assign({}, loaderUtils.getOptions(this), urlQuery)
  if(!options.compress) return source;
  const quality = options.quality || 0.8;

  // ignore excluded files
  if (!this.resourcePath || (options.exclude && this.resourcePath.match(options.exclude))) return source
  const {folder,name} = handlePath(this.resourcePath);
  const infoPath = folder+'/min.json';
  const file = fs.readFileSync(this.resourcePath);
  const oldMd5 = md5(file);
  let oldInfo = {};
  try {
    const infoFile = fs.readFileSync(infoPath)
    if(infoFile){
      oldInfo = JSON.parse(infoFile)
      if(oldInfo[name]===oldMd5){
        return source
      }
    }
  }catch (e) {
    // ignore
  }

  compress(this.resourcePath,folder, quality).then(newMd5=>{
    oldInfo[name] = newMd5
    fs.writeFileSync(infoPath, JSON.stringify(oldInfo, null, 2), {flag: 'w+'})
  })
  return source
}
