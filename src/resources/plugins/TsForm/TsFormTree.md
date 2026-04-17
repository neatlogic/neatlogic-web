# TsFormTree 组件说明文档

基于 iView / ViewUI Tree + Dropdown 封装的树形选择组件，支持：

- 单选 / 多选
- 远程加载（url）
- 远程搜索
- 懒加载子节点
- 显示层级路径
- 校验支持
- 清空功能
- 只读模式


#### 模版使用
```javascript
<TsFormTree v-model="value" v-bind="config" @on-change="changeFn"></TsFormTree>
```

## 参数
### 基础参数
|    参数名   |           数据类型          |  默认值  |  必传 | 用途           | 说明                          |
| :------: | :---------------------: | :---: | :-: | :----------- | :-------------------------- |
|   name   |          String         |   -   |  否  | 表单字段名        | 与 TsForm 联动使用               |
|   value  | String / Number / Array |   -   |  是  | 控件值（v-model） | 单选为 String/Number，多选为 Array |
| multiple |         Boolean         | false |  否  | 是否多选         | 多选自动显示 checkbox             |
| disabled |         Boolean         | false |  否  | 是否禁用         | 不可展开，不可选择                   |
| readonly |         Boolean         | false |  否  | 是否只读         | 仅展示文本，不可操作                  |
| transfer |         Boolean         | false |  否  | 下拉是否挂载到 body | 外层 overflow:hidden 时使用      |
|   size   |          String         |   ''  |  否  | 尺寸           | 当前组件内部未实际使用                 |
|   width  |     String / Number     |  100% |  否  | 控件宽度         | 来自 formMixins               |


### 数据参数
|     参数名     |  数据类型  |    默认值   |  必传 | 用途     | 说明                  |
| :---------: | :----: | :------: | :-: | :----- | :------------------ |
|   dataList  |  Array |     -    |  否  | 本地树数据  | 未传 url 时生效          |
|     url     | String |     -    |  否  | 远程数据接口 | 组件初始化时调用            |
|    params   | Object |     -    |  否  | 请求参数   | 接口请求时携带             |
|   ajaxType  | String |   post   |  否  | 请求方式   | 支持 post / get / put |
|   rootName  | String |    ''    |  否  | 接口数据路径 | 支持嵌套，如 root1.root2  |
| childrenKey | String | children |  否  | 子节点字段名 | 自定义 children key    |

### 字段映射
|    参数名    |  数据类型  |  默认值  |  必传 | 用途      | 说明      |
| :-------: | :----: | :---: | :-: | :------ | :------ |
| valueName | String | value |  否  | 节点值字段名  | 选中后返回的值 |
|  textName | String |  text |  否  | 节点显示字段名 | 展示文本    |

### 搜索
|      参数名      |      数据类型      |          默认值          |  必传 | 用途       | 说明                     |
| :-----------: | :------------: | :-------------------: | :-: | :------- | :--------------------- |
|     search    |     Boolean    |         false         |  否  | 是否启用远程搜索 | 仅 url 存在时有效            |
|    keyword    |     String     |        keyword        |  否  | 搜索参数名    | 请求时传递字段                |
| forbidContent | String / Array | ['<','>','"',"'",'&'] |  否  | 禁止输入字符   | 来自 formMixins，用于防止 XSS |

### 展示
|       参数名       |   数据类型  |            默认值            |  必传 | 用途           | 说明                                            |
| :-------------: | :-----: | :-----------------------: | :-: | :----------- | :-------------------------------------------- |
|   placeholder   |  String |  $t('page.pleaseselect')  |  否  | 占位文本         | 默认国际化“请选择”                                    |
|    clearable    | Boolean |            true           |  否  | 是否显示清除按钮     | required 单选自动禁用                               |
| selectLastLevel | Boolean |           false           |  否  | 是否只允许最后一级选择  | 父级仅可展开                                        |
|     showPath    | Boolean |           false           |  否  | 是否展示完整路径     | 仅单选生效                                         |
|   sperateText   |  String |            '/'            |  否  | 路径分隔符        | showPath 时使用                                  |
|    className    |  String |             -             |  否  | 最外层自定义 class | 来自 formMixins                                 |
|  readonlyClass  |  String | text-grey tsform-readonly |  否  | 只读状态 class   | 来自 formMixins                                 |
|       desc      |  String |             -             |  否  | 描述信息         | 展示在组件下方                                       |
|     descType    |  String |             -             |  否  | 描述展示类型       | info / success / warning / error 时使用 Alert 模式 |

### 校验
|      参数名      |   数据类型   | 默认值 |  必传 | 用途     | 说明              |
| :-----------: | :------: | :-: | :-: | :----- | :-------------- |
|  validateList |   Array  |  -  |  否  | 校验规则   | 来自 formMixins   |
|    onChange   | Function |  -  |  否  | 值变化回调  | 同时会 emit change |
| onChangelabel | Function |  -  |  否  | 文本变化回调 | 返回选中文本          |


## 事件方法
|      事件名      |  返回值                  | 说明                 |
| :-----------: | :------------------- | :----------------- |
|    change     | (value, valueObject) | 值变化触发           |
|   on-change   | (value, valueObject) | 同 change          |
| change-label  | (label, valueObject) | 返回选中文本         |
|   load-data   | (item, callback)     | 懒加载子节点         |

--------- 

#### 入参
```javascript
config:{
  value:"",
  transfer:false,
  multiple:false,
  url:"/api/rest/matrix/column/data/search/forselect",
  params:{},
  search:false,
  rootName:"children",
  valueName:"value",
  textName:"name",
  keyword:"keyword",
  dataList:[],
  readonly:false,
  disabled:false,
  childrenKey:"children",
  className:"",
  readonlyClass:"",
  validateList:['required'],
  width:"100%",
  placeholder:"",
  clearable:true,
  selectLastLevel:true,
  showPath:true,
  sperateText:">",
  onChange:function(val, valueObject){},
  onChangelabel:function(label){},
}
```