# 多条件组合下拉选择（CombineSearcher）

## 功能说明
通过组合常用的表单组件和输入框回车搜索关键字，作为复杂场景的搜索条件。

## 模板使用
```vue
<CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="searchAction">
  <!-- 自定义搜索栏回显文案 -->
  <template slot="textItem" slot-scope="{valueConfig, textConfig}">{{valueConfig}}</template>
  
  <!-- 自定义激活状态插槽 -->
  <template v-slot:isActive="{valueConfig, textConfig, item}">{{item}}</template>
  
  <!-- 自定义过滤器 -->
  <template slot="filter">
    <div>
      <Tooltip content="这是一个说明" transfer placement="left-end">
        <div class="tsfont-edit"></div>
      </Tooltip>
    </div>
  </template>
</CombineSearcher>

<script>
export default {
  data() {
    return {
      searchVal: {},
      searchConfig: {
        search: false,
        searchList: []
      }
    }
  },
  methods: {
    searchAction() {
      // 搜索条件变更时的处理逻辑
    }
  }
}
</script>
```

## 参数说明

| 参数名 | 数据类型 | 默认值 | 必传 | 用途 | 说明 |
| :---: | :---: | :---: | :---: | :---: | :--- |
| value | String、Object、Boolean | 无 | 是 | 搜索的组合结果 | 一般用 v-model 进行双向绑定 |
| search | Boolean | true | 否 | 是否启用搜索功能 | 提供顶部搜索框关键字回车组合搜索功能，为 false 时会影响相关配置的生效 |
| placeholder | String | '请输入关键字' | 否 | 搜索框提示文案 | 仅在 search 为 true 时有效，默认值会根据语言环境自动获取 |
| keywordName | String | 'keyword' | 否 | 关键字参数名 | 搜索的关键字对应接口的 key 名，仅在 search 为 true 时有效 |
| keywordText | String | '关键字' | 否 | 关键字显示文本 | 搜索的关键字对应显示在已选中的 label 中文名，仅在 search 为 true 时有效，默认值会根据语言环境自动获取 |
| labelPosition | String | 'top' | 否 | 表单标签位置 | 下拉表单的 label 位置，默认上下布局 |
| labelWidth | Number | 120 | 否 | 表单标签宽度 | 下拉表单的 label 宽度设置，主要用于左右布局时，宽度过长或者过窄 |
| searchList | Array | [] | 是 | 搜索条件列表 | 与表单组件同样的数据结构，包含各种搜索条件的配置 |
| transfer | Boolean | true | 否 | 是否使用 transfer 模式 | 控制下拉菜单是否使用 transfer 模式，默认 true |
| isShowButton | Boolean | true | 否 | 是否显示按钮 | 是否显示搜索和取消按钮 |
| clearable | Boolean | true | 否 | 是否可清除 | 是否显示清除按钮，点击可清除所有搜索条件 |
| disabledList | Array | [] | 否 | 不可删除的属性 | 配置哪些搜索条件不允许删除 |
| readonly | Boolean | false | 否 | 是否只读 | 是否为只读模式，只读模式下只显示已选条件，不允许修改 |
| border | Boolean | true | 否 | 是否显示边框 | 是否显示组件边框，默认存在 |
| showSearchNumber | Number | -1 | 否 | 只读模式下显示条件数量 | 只读模式下展示搜索条件的数量，默认值 -1 表示展示所有 |
| searchMode | String | 'realtimeSearch' | 否 | 搜索模式 | 搜索模式可选：实时搜索(realtimeSearch)，非实时搜索(clickBtnSearch) |
| isShowAdvanceMode | Boolean | false | 否 | 是否显示高级模式 | 底部是否显示高级模式文案 |
| searchText | String | '搜索' | 否 | 搜索按钮文本 | 搜索按钮的显示文本，默认值会根据语言环境自动获取 |

## 插槽说明

| 插槽名 | 用途 | 说明 |
| :---: | :---: | :--- |
| [name] | 自定义搜索条件插槽 | 名称为 searchList 里的 name 的每一个自定义的下拉 slot，同 tsform 的 slot 用法。参数：{valueConfig, textConfig, item}，其中 valueConfig 为完整的搜索条件的值的对象集合（{key1: value1, ...}），textConfig 为完整的搜索条件的文案的对象集合（{key1: text1, ...}），item 为当前这一条数据的设置 |
| textItem | 搜索栏回显文案插槽 | 参数：{valueConfig, textConfig}，其中 valueConfig 为完整的搜索条件的值的对象集合，textConfig 为完整的搜索条件的文案的对象集合 |
| filter | 过滤器插槽 | 搜索栏右侧的过滤器 slot，支持自定义内容，主要用于自定义右侧的过滤内容 |
| action | 自定义底部操作按钮插槽 | 自定义下拉菜单底部的操作按钮，默认显示取消和搜索按钮 |

## 事件说明

| 事件名 | 触发时机 | 参数 | 说明 |
| :---: | :---: | :---: | :--- |
| change | 搜索条件变更时 | 搜索条件对象 | 当搜索条件发生变化时触发，参数为当前完整的搜索条件对象 |
| remove-label | 删除标签时 | 无 | 当删除某个搜索条件标签时触发 |
| change-label | 标签变更时 | 标签对象 | 当搜索条件标签发生变更时触发，参数为当前的标签对象 |
| switchMode | 切换高级模式时 | 无 | 当点击高级模式切换按钮时触发 |

## 入参示例

```javascript
searchList: [
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
    type: 'slot', // slot 的例子看 demo，可以通过 slot 的事件改变 valueConfig, textConfig 两个值
    name: 'isActive',
    label: '激活状态'
  }
  // 更多搜索条件...
]
```

## 注意事项
1. 如果要把搜索关键字放在下拉搜索里，需要把 search 设置为 false
2. 当 search 为 false 时，与搜索框相关的配置（如 placeholder、keywordName、keywordText）将不会生效
3. 自定义插槽时，可以通过修改 valueConfig 和 textConfig 来更新搜索条件
