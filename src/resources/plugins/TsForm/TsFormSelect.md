# 下拉选择（TsFormSelect）  

TsFormSelect 是一个功能增强型下拉选择组件，支持：

- 单选 / 多选
- 分组模式
- 本地数据 / 远程数据
- 实时搜索
- 分页加载
- 关键字高亮
- 回车创建新选项
- 自动选中唯一值
- 表单校验
- 键盘操作
- 全选
- Transfer 模式
适用于复杂业务表单场景。

## 基础用法
```javascript
<TsFormSelect v-model="value" v-bind="config" @on-change="changeFn" :selectItemList.sync="selectItemList" :needCallback.sync="needCallback" @searchCallback="refreshSuccess()">
  //下拉列表在顶部添加额外一行
  <template v-slot:first-ul>
        <li class="tsfont-plus text-href first-slot" @click="addList()">数据源</li>
  </template>
  //重写下拉列表显示
  <template v-slot:option="{item,index}">
        <div>{{item.text}} {{index}}</div>
  </template>
</TsFormSelect>


data(){
  return {
    selectItemList:false
  }
}
methods:{
  refresh(){
    //指定操作需要重新调用接口更新
    this.selectItemList =true;
  },
  refreshSuccess(){
    this.$Message.success('刷新成功');
  }
}
```

## 参数说明

### 基础属性
| 参数名                  | 类型                               | 默认值              | 说明             |
| -------------------- | -------------------------------- | ---------------- | -------------- |
| name                 | String                           | -                | 表单字段名          |
| value                | String / Number / Array / Object | 单选：null<br>多选：[] | v-model 绑定值    |
| multiple             | Boolean                          | false            | 是否多选           |
| mode                 | String                           | normal           | normal / group |
| placeholder          | String                           | -                | 占位文本           |
| search               | Boolean / null                   | null             | 是否搜索           |
| disabled             | Boolean                          | false            | 是否禁用           |
| readonly             | Boolean                          | false            | 是否只读           |
| overflow             | Boolean                          | true             | 是否允许溢出         |
| className            | String                           | ''               | 外层自定义样式        |
| clearable            | Boolean                          | true             | 是否显示清除按钮       |
| validateList         | Array                            | -                | 校验规则           |
| transfer             | Boolean                          | false            | 下拉是否挂载到 body   |
| placement            | String                           | bottom-start     | 弹出位置           |
| nowrapHead           | Boolean                          | false            | 多选不换行          |
| isNowrap             | Boolean                          | false            | 单选不换行          |
| dropdownMenuMaxWidth | String / Boolean                 | false            | 下拉最大宽度         |
| disabledHoverTitle   | String                           | ''               | 禁用悬浮提示         |
| firstSelect          | Boolean                          | true             | 唯一值自动选中        |
| isAutoSelectdOnlyValue | Boolean                         | false            | 唯一值自动选中        |
| pageSize             | Number                           | 20               | 分页大小           |
| isCanAll             | Boolean                          | false            | 是否显示全选         |
| allText              | String                           | 国际化 page.selectall | 全选文字           |

 
### 数据相关
| 参数名      | 类型    | 默认值 | 说明   |
| -------- | ----- | --- | ---- |
| dataList | Array | -   | 本地数据 |
| url                    | String           | ''    | 初始化接口   |
| params                 | Object           | -     | 接口参数    |
| ajaxType               | String           | post  | 请求方式    |
| rootName               | String           | ''    | 数据路径    |
| dealDataByUrl          | Function         | -     | 数据二次处理  |
| defaultValueIsFirst    | Boolean          | false | 默认选中第一个 |
| dynamicUrl          | String | ''           | 实时搜索接口 |
| dynamicDefaultValue | Array  | []           | 初始化默认值 |
| keyword             | String | keyword      | 搜索字段   |
| idListName          | String | defaultValue | 精确匹配字段 |


### 字段映射
| 参数名             | 类型      | 默认值      | 说明                |
| --------------- | ------- | -------- | ----------------- |
| valueName       | String  | value    | option value 字段   |
| textName        | String  | text     | option text 字段    |
| tooltipName     | String  | tooltip  | tooltip 字段        |
| showName        | String  | -        | 下拉显示字段            |
| childrenName    | String  | children | 子节点字段             |
| parentValueName | String  | value    | 父节点 value         |
| parentTextName  | String  | text     | 父节点 text          |
| isEqualValue    | Boolean | false    | 是否用 value 渲染 text |


### 搜索增强
| 参数名           | 类型              | 默认值   | 说明     |
| ------------- | --------------- | ----- | ------ |
| filterName    | String / Array  | -     | 搜索过滤字段 |
| allowCreate   | Boolean         | false | 允许创建   |
| needCallback  | Boolean         | false | 搜索回调   |
| scrollParent  | Object / String | -     | 滚动容器   |
| sperateText   | String          | '|'   | 多选分隔符 |

### 特殊项
| 参数名         | 类型      | 默认值                              | 说明      |
| ----------- | ------- | -------------------------------- | ------- |
| firstLi     | Boolean | false                            | 是否显示第一个 |
| firstText   | String  | -                                | 第一个文本   |
| firstIcon   | String  | tsfont-plus text-href first-slot | 第一个图标   |

### 视觉增强
| 参数名     | 类型     | 默认值 | 说明   |
| ------- | ------ | --- | ---- |
| preIcon | String | ''  | 前置图标 |
| theme   | Object | -   | 主题配置 |

### 描述
| 参数名          | 类型     | 默认值 | 说明     |
| ------------ | ------ | --- | ------ |
| desc         | String | -   | 描述文本   |
| descType     | String | -   | 描述类型   |
| errorMessage | String | -   | 外部错误提示 |


### 事件
| 事件名           | 类型       | 说明              |
| :------------ | :------- | :-------------- |
| onBlur        | Function | 失去焦点            |
| onFocus       | Function | 获取焦点            |
| onChange      | Function | 值改变             |
| onChangelabel | Function | 返回选中 text       |
| on-open-change | Function | 下拉框打开/关闭 |
| first         | Function | 点击第一个选项         |
| enter-search  | Function | 回车搜索            |
| inputBlur     | Function | 输入框失去焦点         |
| searchCallback | Function | 搜索回调            |
| isChangeWrite | Boolean  | 赋值是否触发 onChange |


>  方法(通过.sync调用方法更新值)

 属性名称|用途|说明
| :---:|:---:|:---
| selectItemList|获取选中数据的对象列表| -


## 插槽(slot)

|名称|slot-scope|用途|说明
|:---:|:---:|:---:|:---
|first-ul|无|在下拉组件中添加额外的交互内容,一般用在下拉中出现添加数据按钮|卡槽内容会一直显示在下拉列表中
|option|{item,index}|一般下拉列表显示的textName对应的值，卡槽的作用主要用在比较复杂的场景|-
|validMessage|无|普通的校验和属性errorMessage不能满足需求是，可以使用插槽|-




#### 入参

```javascript
config:{
  value:"",
  disabled:false,
  size:"default",
  width:"100%",
  search:false,
  preIcon:"tsfont-edit",
  keyword:"keyword",
  idListName:"valueList",
  placeholder:"请输入",
  multiple:true,
  allowCreate:false,
  readonly:false,
  url:"/api/rest/matrix/column/data/search/forselect",
  params:{test:"test"},
  defaultValueIsFirst:false,
  dynamicUrl:"/api/rest/matrix/column/data/search/forselect",
  rootName:"tbodyList",
  dataList:[{text:"text",value:"value"}],
  valueName:"id",
  textName:"name",
  showName:"html",
  validateList:[],
  transfer:true,
  className:"",
  clearable:false,
  border:"border",
  onBlur:function(){},
  onFocus:function(){},
  onChange:function(value,objectValue,selectList){},
  desc:"adfa",
  errorMessage:"",
  onChangelabel:function(labelobject){},
  scrollParent:this.$el,
  sperateText:"|",
  dealDataByUrl:function(list){return list},
  readonlyClass:"",
  ajaxType:"post",
  firstLi:false,
  firstText:"添加",
  firstIcon:"tsfont-plus text-href first-slot",
  firstSelect:true,
  nowrapHead:false,
  isNowrap:false,
  dropdownMenuMaxWidth:false,
  disabledHoverTitle:"",
  isAutoSelectdOnlyValue:false,
  pageSize:20,
  isCanAll:false,
  allText:"全选"
}
```