/*
 * @Author: Azhou
 * @Date: 2021-05-12 15:29:10
 * @LastEditors: Azhou
 * @LastEditTime: 2021-08-30 10:49:42
 */

// 开发环境下才会启用的转发代理
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    // createProxyMiddleware('/dataturks', {
    //   target: 'http://47.111.17.95:9090/',
    //   changeOrigin: true,
    //   ws: true,
    // }),
    createProxyMiddleware('/dataturks', {
      target: 'http://10.214.211.205:9090/',
      changeOrigin: true,
      ws: true,
    }),
    createProxyMiddleware('/anno', {
      target: 'http://127.0.0.1:5088/',
      changeOrigin: true,
      pathRewrite: { '^/anno': '' },
    }),
      // createProxyMiddleware('/api', {
      //     target: 'http://10.61.190.17:3434', // 服务端地址
      //     changeOrigin: true,
      //     pathRewrite: { '^/api': '/api' },
      //     onProxyReq: (proxyReq, req) => {
      //         // 如果需要，可以添加额外的头
      //         proxyReq.setHeader('Authorization', 'Bearer your-token');
      //     },
      // }),
      //
      // createProxyMiddleware('/uploads', {
      //     target: 'http://10.61.190.17:3434', // 服务端地址
      //     changeOrigin: true, // 修改 Origin 头为目标地址
      //     pathRewrite: { '^/uploads': '/uploads' }, // 保持路径一致
      //     onProxyReq: (proxyReq, req) => {
      //         // 如果需要，可以添加额外的头
      //         proxyReq.setHeader('Authorization', 'Bearer your-token');
      //     },
      // })
  )
}
