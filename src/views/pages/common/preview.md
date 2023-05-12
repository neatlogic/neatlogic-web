### 打开新的tab，文件预览页面

> 注意，如果是文本文件，返回的就是字符串文本的形式，除文本的格式外，其他格式返回二进制文件流的形式

### 参数说明

参数名|类型|用途|说明
:---:|:---:|:---|:---|
url | String| 请求地址
urlParams | Object| 请求地址参数
title | String | 页面左上角标题(文件名称)
type | String | 文件类型，目前支持的类型有 xlsx/xls/doc/docx/pdf/txt/json/sql/ctl/exp/imp/prc/pck/pkg/pkgh/pkgb/json