var fs = require('fs');

try {
  var content = require('../neatlogic-web-config/config.json');
  fs.writeFile('./public/config.json', JSON.stringify(content), err => {
    if (err) {
      console.error(err);
      return;
    }
  //文件写入成功。
  });
} catch (error) {
  fs.writeFile('./public/config.json', JSON.stringify({'isData': false}), err => {
    if (err) {
      console.error(err);
      return;
    }
  //文件写入成功。
  });
}
