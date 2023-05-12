const path = require('path');
module.exports = function(content) {
  const loaderContext = this;
  const { rootContext, resourcePath } = loaderContext;

  const context = rootContext || process.cwd();
  //const options = loaderUtils.getOptions(loaderContext) || {}
  const rawShortFilePath = path
    .relative(context, resourcePath)
    .replace(/^(\.\.[\/\\])+/, '');
  // .replace(/\//g, '.');
  //找到vue文件中单独一行<template 开头的内容
  let tmplStartPos = content.search(/^\s*<\s*template\W/mi);
  if (tmplStartPos >= 0) {
    //20200908_zqp_修复第一行带判断导致的模版解析出错
    //第一个<template>结束标签
    let tmplEndPos = content.indexOf('>\n', tmplStartPos + 9);
    //第一个实际开始的标签
    let pos = content.indexOf('>\n', tmplEndPos + 1);
    if (pos > 0) {
      //获取<template>后续一行标签行，如果是transition或者TsDialog，则再获取下一行标签的结束位置
      let tmplFirstLine = content.substring(tmplEndPos + 1, pos + 1);
      let transPosInLine = tmplFirstLine.search(/^\s*<\s*(transition|TsDialog)\W/mi);
      if (transPosInLine >= 0) {
        pos = content.indexOf('>', pos + 1);
      }
    }
    //过滤掉node_modules的路径减少代码量
    if (pos > 0) {
      content = content.slice(0, pos) + (rawShortFilePath && rawShortFilePath.indexOf('node_modules') < 0 ? ' src-path="' + rawShortFilePath + '"' : '') + content.slice(pos);
    }
  }

  return content;
};
