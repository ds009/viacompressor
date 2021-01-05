const loaderUtils = require('loader-utils')
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const fs = require('fs')
const md5 = require('blueimp-md5')

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
  const quality = options.quality || 0.8;

  // ignore excluded files
  if (!this.resourcePath || (options.exclude && this.resourcePath.match(options.exclude))) return source

  const stats = fs.statSync(this.resourcePath);
  const fileSizeInMegabytes = stats.size / (1024*1024);
  if(fileSizeInMegabytes<0.1){
    // 小于100K不处理
    return source;
  }else if (fileSizeInMegabytes>1){
    console.log('!!!Image size too large: '+this.resourcePath)
  }
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
  imagemin([this.resourcePath], {
    destination: folder,
    plugins: [
      imageminMozjpeg([{quality:quality*100||80}]),
      imageminPngquant({
        quality: [quality,1]
      }),
      imageminSvgo()
    ]
  }).then(files=>{
    console.log('compressed file: '+ name)
    oldInfo[name] = md5(files[0].data)
    fs.writeFileSync(infoPath, JSON.stringify(oldInfo, null, 2), {flag: 'w+'})
  });
  return source
}
