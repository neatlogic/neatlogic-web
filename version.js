var fs = require('fs');

try {
  var content = require('./package.json');
  fs.writeFile('./public/version.md', content.version, err => {
    if (err) {
      console.error(err);
      return;
    }
  //文件写入成功。
  });
} catch (error) {
  //
}
