const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: '/', // ⬅️ clave para history mode + Express
  transpileDependencies: [
    'vue-router',
    'axios'
  ]
});
