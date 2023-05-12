#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const cnword = args[0];
const key = args[1];
const files = ['dialog/zh.json', 'page/zh.json', 'term/zh.json', 'message/zh.json', 'form/zh.json'];
const data = {};

files.forEach(file => {
  const type = file.split('/')[0];
  const filePath = path.join(__dirname, file);
  // 读取JSON文件
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const d = JSON.parse(fileContent);
  data[type] = d;
});

let foundedkey = null;

// 遍历JSON数据并将值相同但键不同的数据项添加到字典中
function findDuplicates(data, path) {
  if (typeof data === 'object' && data !== null) {
    for (const [k, v] of Object.entries(data)) {
      const new_path = path ? `${path}.${k}` : k;
      const p = findDuplicates(v, new_path);
      if (p !== null) {
        return p;
      }
    }
  } else if (typeof data === 'string') {
    if (cnword.toLowerCase() === data.toLowerCase()) {
      return path;
    }
  }
  return null;
}

// 调用函数查找值相同但键不同的数据项
foundedkey = findDuplicates(data);

// 打印结果
if (foundedkey !== null) {
  console.log(`值已存在，KEY是: ${foundedkey}`);
} else if (key) {
  const keys = key.split('.');
  if (keys.length > 1) {
    if (['page', 'term', 'dialog', 'form', 'message'].includes(keys[0])) {
      let obj = data;
      for (const k of keys.slice(0, -1)) {
        if (k in obj) {
          obj = obj[k];
        } else {
          obj[k] = {};
          obj = obj[k];
        }
      }
      obj[keys[keys.length - 1]] = cnword;
      const filePath = path.join(__dirname, `${keys[0]}/zh.json`);
      fs.writeFileSync(filePath, JSON.stringify(data[keys[0]], null, 2), 'utf8');
      console.log(`新值添加成功，KEY是: ${key}`);
    } else {
      console.log('新的KEY值必须要以page、term、dialog、form、message开头');
    }
  } else {
    console.log('请提供新的KEY值');
  }
} else {
  console.log('值不存在，请提供新的KEY值');
}