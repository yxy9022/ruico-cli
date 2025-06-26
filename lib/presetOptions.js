module.exports = {
  'web site (Vue3 Koa2)': {
    key: 'web-site-vue3-koa2',
    repository: 'github:yxy9022/ruico-template#web-site',
    endCommand: ['pnpm install', 'pnpm run start']
  },
  'mp server (express + mysql, 用于小程序开发)': {
    key: 'mp-server-express',
    repository: 'github:yxy9022/ruico-template#mp-server',
    endCommand: ['npm install', 'npm run start']
  },
  'lite server (Koa3, 简单的的服务用于开发验证验证某些功能)': {
    key: 'lite-server-koa3',
    repository: 'github:yxy9022/ruico-template#lite-server',
    endCommand: ['yarn install', 'yarn run start']
  },
  'blank cli (commander)': {
    key: 'blank-cli',
    repository: 'github:yxy9022/ruico-template#blank-cli',
    endCommand: ['npm install', 'npm run start']
  }
};
