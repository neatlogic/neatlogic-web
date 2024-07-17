const fs = require('fs');
const path = require('path');

try {
  const buildVersion = require('./package.json').version;
  const buidDate = new Date().toLocaleString();
  fs.writeFile('./public/version.md', JSON.stringify({ 'version': buildVersion, 'fcd': buidDate }), err => {
    if (err) {
      console.error(err);
      return;
    }
    //文件写入成功。
  });
} catch (error) {
  console.error(error);
  //
}
