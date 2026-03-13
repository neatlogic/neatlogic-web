# TsZtree 组件使用说明

## 1. 组件介绍

TsZtree 是基于 jQuery zTree 封装的 Vue 树组件，提供了丰富的树形结构展示和交互功能。

## 2. 安装与引入

在需要使用的组件中：

```javascript
export default {
  components: {
     TsZtree: () => import('@/resources/plugins/TsZtree/TsZtree.vue'),
  }
}
```

## 3. 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| nodes | Array | - | 树节点数据 |
| url | String | - | 获取节点数据的接口地址 |
| params | Object | - | 接口请求参数 |
| rootName | String | - | 接口返回数据的根名 |
| idKey | String | 'id' | 节点ID的属性名称 |
| pIdKey | String | 'parentId' | 父节点ID的属性名称 |
| setting | Object | - | zTree 配置项，会与默认配置合并 |
| expandAll | Boolean | true | 是否默认展开所有节点 |
| hoverDomList | Array | - | 节点悬停时显示的操作按钮列表 |
| value | String/Number | - | 默认选中的节点ID |
| enableToggleClick | Boolean | false | 是否激活反选功能（点击已选中节点取消选中） |
| urlKey | String | 'url' | 节点链接的目标URL的属性名称 |
| nodeClasses | Function | - | 自定义节点样式的函数 |

## 4. 组件方法

| 方法名 | 参数 | 返回值 | 说明 |
|-------|------|-------|------|
| getData() | 无 | Array | 获取所有节点数据 |
| toggleExpand(flag) | Boolean | 无 | 展开/折叠所有节点 |
| selectedNodeById(id) | String/Number | Object | 根据ID选中节点并返回该节点 |
| cancelSelectedAllNode() | 无 | 无 | 取消所有选中的节点 |
| getZTreeObj() | 无 | Object | 获取zTree实例对象 |

## 5. 组件事件

| 事件名 | 回调参数 | 说明 |
|-------|---------|------|
| onClick | (zTreeObj, treeNode) | 节点点击事件 |
| onDrop | (zTreeObj, treeNodes, targetNode, moveType, isCopy) | 节点拖放事件 |
| beforeExpand | Function | 节点展开前事件 |
| onExpand | Function | 节点展开事件 |
| beforeDrop | Function | 节点拖放前事件 |
| beforeDrag | Function | 节点拖动前事件 |
| beforeClick | (zTreeObj, treeNode) | 节点点击前事件，返回false可阻止点击 |
| renderName | Function | 自定义节点名称渲染函数 |
| renderTitle | Function | 自定义节点title渲染函数 |
| ready | (zTreeObj) | 树初始化完成事件 |

## 6. hoverDomList 配置

hoverDomList 是一个数组，用于配置节点悬停时显示的操作按钮，每个元素包含以下属性：

| 属性名 | 类型 | 说明 |
|-------|------|------|
| icon | String | 按钮图标类名 |
| class | String | 按钮样式类名 |
| text | String | 按钮文本 |
| desc | String | 按钮提示信息 |
| isAddFn | Function | 判断是否显示该按钮的函数，参数为当前节点 |
| clickFn | Function | 按钮点击事件处理函数，参数为当前节点 |
| initFn | Function | 按钮初始化函数，参数为当前节点和按钮元素 |

## 7. 使用示例

### 7.1 基本使用

```vue
<template>
  <TsZtree
    :nodes="treeData"
    :onClick="handleClick"
  />
</template>

<script>
export default {
  data() {
    return {
      treeData: [
        {
          id: 1,
          parentId: 0,
          name: '节点1',
          children: [
            {
              id: 2,
              parentId: 1,
              name: '节点1-1'
            }
          ]
        }
      ]
    };
  },
  methods: {
    handleClick(zTreeObj, treeNode) {
      console.log('点击了节点:', treeNode);
    }
  }
};
</script>
```

### 7.2 从接口获取数据

```vue
<template>
  <TsZtree
    :url="'/api/tree/data'"
    :params="{type: '1'}"
    :onClick="handleClick"
  />
</template>

<script>
export default {
  methods: {
    handleClick(zTreeObj, treeNode) {
      console.log('点击了节点:', treeNode);
    }
  }
};
</script>
```

### 7.3 带悬停操作按钮

```vue
<template>
  <TsZtree
    :nodes="treeData"
    :hoverDomList="hoverDomList"
    :onClick="handleClick"
  />
</template>

<script>
export default {
  data() {
    return {
      treeData: [
        {
          id: 1,
          parentId: 0,
          name: '节点1'
        }
      ],
      hoverDomList: [
        {
          icon: 'fa fa-edit',
          desc: '编辑',
          clickFn: (treeNode) => {
            console.log('编辑节点:', treeNode);
          }
        },
        {
          icon: 'fa fa-trash',
          desc: '删除',
          clickFn: (treeNode) => {
            console.log('删除节点:', treeNode);
          }
        }
      ]
    };
  },
  methods: {
    handleClick(zTreeObj, treeNode) {
      console.log('点击了节点:', treeNode);
    }
  }
};
</script>
```

### 7.4 带拖放功能

```vue
<template>
  <TsZtree
    :nodes="treeData"
    :onDrop="handleDrop"
  />
</template>

<script>
export default {
  data() {
    return {
      treeData: [
        {
          id: 1,
          parentId: 0,
          name: '节点1',
          children: [
            {
              id: 2,
              parentId: 1,
              name: '节点1-1'
            }
          ]
        }
      ]
    };
  },
  methods: {
    handleDrop(zTreeObj, treeNodes, targetNode, moveType, isCopy) {
      console.log('拖放操作:', treeNodes, targetNode, moveType);
    }
  }
};
</script>
```

## 8. 注意事项

1. 组件依赖 jQuery 和 zTree 库，确保项目中已正确引入
2. 当同时提供 nodes 和 url 时，url 返回的数据会添加到 nodes 数据后面
3. 组件内部使用了 $https 进行接口请求，确保项目中已配置好 axios 实例
4. 当需要自定义节点样式时，可以使用 nodeClasses 函数
5. 当需要自定义节点名称或 title 时，可以使用 renderName 和 renderTitle 函数
6. 组件支持通过 value 属性设置默认选中的节点
7. 当 enableToggleClick 为 true 时，点击已选中的节点会取消选中状态

## 9. 样式文件

组件默认引入了 zTree 的默认样式：

- `css/zTreeStyle.css` - 默认样式
- `css/metroStyle.css` - Metro 风格样式（可根据需要自行引入）

## 10. 图标文件

组件包含了多种图标样式，位于 `css/img/` 目录下：

- `zTreeStandard.gif` - 标准图标
- `metro.gif` - Metro 风格图标
- `diy/` - 自定义图标

## 11. 版本说明

- 基于 jQuery zTree 实现
- 支持 Vue 2.x 版本