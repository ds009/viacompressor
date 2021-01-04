export default {
  head: {
    title: 'viacompressor usage example',
  },
  build: {
    extend(webpackConfig, { isDev, isClient }) {
      webpackConfig.resolveLoader.modules.push('..'); // for test only
      webpackConfig.module.rules.push({
        test: /\.(jpg|png|svg)$/,
        exclude: [/node_modules/,/\.nuxt/],
        loader: 'viacompressor',
        enforce: 'pre',
        options: {
          quality: 0.8,
          exclude: null,
        }
      });
    },
  }
};
