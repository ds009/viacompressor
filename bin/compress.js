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
// 没有close()因为公用的 close会出错

function handlePath(resourcePath) {
  const index = resourcePath.lastIndexOf('/')
  return {folder:resourcePath.slice(0, index),name:resourcePath.slice(index+1)}
}
module.exports = async function (file, options) {
  const {quality,minSize,limitSize}= options.quality;
  const currentSize = fs.statSync(file).size;
  console.log("processing "+ file)
  const mega = 1024 * 1024
  if(currentSize < minSize * mega){
    // 小于minSize不处理
    return;
  }else if (currentSize >limitSize * mega){
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
    // ignore
  }

  const image = imagePool.ingestImage(file);
  const encodeType = extMap[name.split('.').pop()];
  await image.decoded;
  await image.encode({[encodeType]:{quality}});
  const encoded = await image.encodedWith[encodeType]
  const rawEncodedImage = encoded.binary;
  fs.writeFileSync(file, rawEncodedImage);
  oldInfo[name] = encoded.size;
  fs.writeFileSync(infoPath, JSON.stringify(oldInfo, null, 2), {flag: 'w+'})
}
