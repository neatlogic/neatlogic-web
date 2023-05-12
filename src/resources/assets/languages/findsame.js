#!/usr/bin/env node

const fs = require('fs');
const args = ['dialog/zh.json', 'page/zh.json', 'term/zh.json', 'message/zh.json', 'form/zh.json'];
const data = {};
for (const arg of args) {
  const type = arg.split('/')[0];
  // 读取JSON文件
  const d = JSON.parse(fs.readFileSync(arg, 'utf8'));
  data[type] = d;
}

// 建立一个默认值为列表的字典，用于存储值相同但键不同的数据项
const duplicates = {};

// 遍历JSON数据并将值相同但键不同的数据项添加到字典中
function findDuplicates(data, path) {
  if (typeof data === 'object') {
    for (const [k, v] of Object.entries(data)) {
      const newPath = path ? `${path}.${k}` : k;
      findDuplicates(v, newPath);
    }
  } else {
    duplicates[data] = duplicates[data] || [];
    duplicates[data].push(path);
  }
}

// 调用函数查找值相同但键不同的数据项
findDuplicates(data);

// 打印结果
for (const [value, keys] of Object.entries(duplicates)) {
  if (keys.length > 1) {
    console.log(`"${value}" ==> ${keys.join(', ')}`);
  }
}
