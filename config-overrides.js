// https://juejin.im/post/6856772424206630926
// 在render process中使用node api

// 1. 使用window.require
// 2. 使用 customize-cra 修改 target 为 'electron-renderer'

const { override, setWebpackTarget } = require('customize-cra');

module.exports = override(setWebpackTarget('electron-renderer'));
