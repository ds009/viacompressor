export default {
  head: {
    title: 'viacompressor usage example',
  },
  build: {
    extend(webpackConfig, { isDev, isClient }) {
      webpackConfig.resolveLoader.modules.push('..'); // for test only
      webpackConfig.module.rules.unshift({
        test: /\.(jpe?g|png|svg)$/i,
        exclude: [/node_modules/,/\.nuxt/],
        loader: 'viacompressor',
        options: {
          compress: isDev&&isClient,
          quality: 0.8,
          exclude: /(-min)|(exclude)/,
        }
      });
    },
  }
};
