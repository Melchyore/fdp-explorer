module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    config.module
      .rule('xsl')
      .test(/\.xsl$/)
      .use('raw-loader')
      .loader('raw-loader')
  }
}
