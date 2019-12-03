const proxy = [
  {
    context: '/api',
    target: 'https://next-jsonserver.firebaseapp.com',
    pathRewrite: {'^/api' : ''}
  }
];
module.exports = proxy;
