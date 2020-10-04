// 在render process 中引用node模块， 需要使用window.require
// const fs = require('fs').promises;
const fs = require('fs');

const fileHelper = {
  readFile: (path) => {
    return fs.readFileSync(path, { encoding: 'utf8' });
  },
  writeFile: (path, content) => {
    return fs.writeFileSync(path, content, { encoding: 'utf8' });
  },
  renameFile: (path, newPath) => {
    return fs.renameSync(path, newPath);
  },
  deleteFile: (path) => {
    return fs.unlinkSync(path);
  },
};

export default fileHelper;
