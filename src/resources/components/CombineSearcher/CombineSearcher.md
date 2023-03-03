### 多条件组合下拉选择（CombineSearcher）  

通过组合常用的表单组件和输入框回车搜索关键字，作为复杂场景的搜索条件

#### 模版使用
```javascript
<CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="searchAction">
  <template slot="textItem"  slot-scope="{valueConfig,textConfig}">{{valueConfig}}</template>
  <template v-slot:isActive="{valueConfig,textConfig,item}">{{item}}</template>
  <template slot="filter">
    <div>
      <Tooltip content="这是一个说明" transfer placement="left-end">
        <div class="tsfont-edit"></div>
      </Tooltip>
    </div>
  </template>
  <template slot="textItem">
    <Tag closable :fade="false">
      这是一个顶部的显示文案选贤
    </Tag>
  </template>
</CombineSearcher>

data() {
    return {
      searchVal:{},
      searchConfig:{
        search: false,
        searchList: []
      }
    }
}
methods: {
  searchAction(){
    //do something when search changed
  }
}
```

#### 参数、方法说明


>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
value|String、Object、Boolean|无|是|搜索的组合结果 |一般用v-model进行双向绑定 
search|Boolean|true|否|是否可以搜索（提供顶部搜索框关键字回车组合搜索功能）|如果为false会影响一系列相关配置是否生效 
placeholder|String|'请输入关键字'|否|如果有关键字搜索，输入框提示文案 |如果search为false时无效
keywordName|String|'keyword'|否|如果有关键字搜索，搜索的关键字对应接口的key名 |如果search为false时无效 
keywordText|String|'请输入关键字'|否|搜索的关键字对应显示在已选中的label中文名 |如果search为false时无效 
labelPosition|String|'top'|否|下拉的表单的label位置默认上下布局 |无 
labelWidth|Number|120'|否|下拉的表单的label的宽度设置 |无 
searchList|Boolean、Array|[]|是|下拉的搜索列表，与表单组件同样的数据结构 |如果要把搜索关键字放在下拉搜索里，需要把search设置为false!

 


>>  slot卡槽说明


 卡槽名|用途|说明
:---:|:---:|:---
****|名称为searchList里的key的每一个自定义的下拉slot,同tsform的slot用法|{valueConfig,textConfig,item}：valueConfig为完整的搜索条件的值的对象集合（{key1:value1,...}）,textConfig为完整的搜索条件的文案的对象集合（{key1:text1,...}）,item为当前这一条数据的设置
textItem|搜索栏回显的文案列表的slot|{valueConfig,textConfig}：valueConfig为完整的搜索条件的值的对象集合（{key1:value1,...}）,textConfig为完整的搜索条件的文案的对象集合（{key1:text1,...}）
filter|搜索栏右侧的过滤器slot，支持自定义内容|主要用于自定义右侧的过滤的内容


#### 入参示例（同tsform）

```javascript
searchList:[
  {
    type: 'select',
    name: 'typeId',
    label: '类型',
    placeholder: '请选择',
    search: true,
    dynamicUrl: '/api/rest/autoexec/type/search',
    rootName: 'tbodyList',
    textName: 'name',
    valueName: 'id',
    transfer: true
  },
  {
    type: 'slot',//slot的例子看demo,可以通过slot的事件改变valueConfig,textConfig2个值
    name: 'isActive',
    label: '激活状态'
  }
  ...
]
```
