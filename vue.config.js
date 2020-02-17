const fs = require('fs')

module.exports = {
    devServer: {
        https: {
          key: fs.readFileSync('./ssl/server.key'),
          cert: fs.readFileSync('./ssl/server.crt'),
        },
      },
    chainWebpack: config => {
        config.module.rule('pdf')
          .test(/\.pdf$/)
          .use('file-loader').loader('file-loader')
      }
  }