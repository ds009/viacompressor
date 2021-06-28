#!/usr/bin/env node
const yargs = require('yargs');
const {compress, close} = require('./compress');
const glob = require('glob');

const usage = "\nUsage: $0 [-q <quality>] [-d <directory>] [-i <ignore>] [-m <minSize>]  [-l <limitSize>] to compress images;";
const options = yargs
  .usage(usage)
  .alias('h', 'help')
  .alias('d', 'directory')
  .default('d', '.')
  .alias('q', 'quality')
  .default('q', 80)
  .alias('i', 'ignore')
  .default('i', './node_modules/**')
  .alias('m', 'minSize')
  .default('m', 0.1)
  .describe('m', 'Min size of image(MB) to be processed')
  .alias('p', 'pattern')
  .default('p', 'jpg,png,webp')
  .describe('p', 'file patterns to be used by glob')
  .alias('l', 'limitSize')
  .default('l', 1)
  .describe('l', 'Size limit of image(MB), alert when size >= l')
  .help(true)
  .argv;

const pattern = options.p.includes(',')?`{${options.p}}`:options.p
const files = glob.sync(`${options.d}/**/*.${pattern}`, {ignore:options.i})
let processed = 0;
const callback = async () => {
  processed += 1;
  if (processed === files.length) {
    await close()
    process.exit();
  }
}
files.forEach(async function (file) {
  await compress(file, options);
  await callback();
});



