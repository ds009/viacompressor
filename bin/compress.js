const fs = require('fs')
const squoosh  = require('@squoosh/lib');
const {ImagePool} = squoosh;
const extMap = {
  jpg:'mozjpeg',
  jpeg:'mozjpeg',
  png:'oxipng',
}
const imagePool = new ImagePool();
console.log('create image pool');

function handlePath(resourcePath) {
  const index = resourcePath.lastIndexOf('/')
  return {folder:resourcePath.slice(0, index),name:resourcePath.slice(index+1)}
}
const compress =  async function (file, options) {

  const {quality,minSize,limitSize}= options;
  const currentSize = fs.statSync(file).size;

  const mega = 1024 * 1024
  if(currentSize < (minSize) * mega){
    // 小于minSize不处理
    return;
  }else if (currentSize > (limitSize) * mega){
    console.log('!!!Image size too large: '+file);
    // show alert and go on
  }
  const {folder,name} = handlePath(file);
  const infoPath = folder+'/min.json';
  let oldInfo = {};
  try {
    const infoFile = fs.readFileSync(infoPath);
    if(infoFile){
      oldInfo = JSON.parse(infoFile);
      if(oldInfo[name]===currentSize){
        // compressed before
        return;
      }
    }
  }catch (e) {
    console.error(e);
    return;
  }

  const image = imagePool.ingestImage(file);
  const encodeType = extMap[name.split('.').pop()];
  await image.decoded;
  await image.encode({[encodeType]:{quality}});
  const encoded = await image.encodedWith[encodeType]
  const rawEncodedImage = encoded.binary;
  fs.writeFileSync(file, rawEncodedImage);
  // json might be changed by other process
  try {
    const currentInfoFile = fs.readFileSync(infoPath);
    const currentInfo = JSON.parse(currentInfoFile);
    currentInfo[name] = encoded.size;
    fs.writeFileSync(infoPath, JSON.stringify(currentInfo, null, 2), {flag: 'w+'});
  }catch (e) {
    console.error(e);
    return;
  }
}
const close = ()=>imagePool.close();
module.exports = {
  compress,
  close,
}
