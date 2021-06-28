#!/usr/bin/env node
const yargs = require("yargs");
const compress = require('./compress');
const glob = require("glob")

const usage = "\nUsage: $0 [-q <quality>] [-d <directory>] [-m <minSize>] to compress images;";
const options = yargs
  .usage(usage)
  .alias('d', 'directory')
  .default('d', '.')
  .alias('q', 'quality')
  .default('q', 80)
  .alias('m', 'minSize')
  .default('m', 0.1)
  .describe('m', 'Min size of image(MB) to be processed')
  .alias('p', 'pattern')
  .default('p', 'jpg,png,gif')
  .describe('p', 'file patterns to be used by glob')
  .alias('l', 'limitSize')
  .default('l', 1)
  .describe('l', 'Size limit of image(MB), alert when size >= l')
  .help(true)
  .argv;

console.log(options);

glob(`${options.d}/**/*.{${options.p}}`, options, function (er, files) {
  files.forEach(function(file){
    compress(file, options);
  });
})


