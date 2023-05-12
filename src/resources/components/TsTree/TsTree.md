# TsTree使用说明

## 1. 用途
用于展示树状结构，支持拖拽移动树节点，支持懒加载子节点，不支持勾选。  

## 2. 应用
neatlogic知识库模块的知识圈编辑、模板编辑，ITSM模块的知识分类管理页面等。

## 3. props
  + `draggable: {type: Boolean, default: true}`， 是否可拖拽树节点
  + `currentPage: {type: Number, default: 1}`，  当前页  
  + `boxShadow: {type: Boolean, default: true}`，  阴影，默认为true  
  + `pageSize: {type: Number, default: 20}`，  每页展示的节点数量  
  + `pageCount: {type: Number}`， 页码数    
  + `rowNum: {type: Number}`， 一级节点总数
  + `treeDepth: {type: Number, default: Infinity}`， 树的深度，如果节点深度超过树深度，则该节点不展示 
  + `keyConfig: { type: Object, default: () => {}}`， 节点数据的自定义键名配置，  
	默认值为`{ name: 'name', id: 'id', parentId: 'parentId' }`
  + `nodeList: { type: Array, required: true, default: () => []}`，树的数据，数据格式如下：  
    ``` JavaScript
    [
      {
        id: 123, 
        parentId: 0, 
        name: '一级节点1',
        children: [
          {
            id:234,
            parentId: 123, 
            name: '二级节点1-1' 
          }
        ]
      }
    ]
    ```
  + `loadData: { type: Function }`， 异步加载子节点数据的方法
    ``` JavaScript
    loadData(parentNode, resolve) {}
    /** 
     * @description 异步加载子节点数据的方法
     * @param {Object} parentNode - 父节点的数据
     * @callback resolve - 调用resolve(children)将需要添加的数据children传给父节点
    */
    ```
  + `shouldLoadData: {type: Function, default: () => false}`，判断是否需要异步加载
    ``` JavaScript
    shouldLoadData(parentNode) { return shouldLoad; }
    /**
     * @description 判断是否需要调用异步加载的函数loadData
     * @param {Object}  parentNode - 父节点的数据
     * @returns {Boolean} shouldLoad - 是否要触发loadData函数
    */
    ```
  + `checkLeaf: {type: Function, default: node => node.children && node.children.length === 0}`，检查当前节点是否为叶节点
    ```JavaScript 
    checkLeaf(node, children) { return isLeaf; }
    /**
     * @description - 检查当前节点是否为叶节点
     * @param {Object} node -当前节点数据
     * @param {Array} children - 当前节点的子节点
     * @returns {Boolean} isLeaf - 当前节点是否为叶节点
     */
    ```

## 4. 插槽slot  
  + 默认插槽， 默认展示节点名node[name]  
    `<template v-slot:default={treeComponent, rootNode, parentNode, node, index, nodeList, level, path}></template>`  

  + 右侧插槽， 主要是用来布置操作按钮的  
    `<template v-slot:right={treeComponent, rootNode, parentNode, node, index, nodeList, level, path}></template>`  

  + 插槽作用域变量解释：
      - treeComponent： TsTree组件实例
      - rootNode： 虚拟的根节点，其id为0
      - parentNode： 当前节点的父节点数据
      - node： 当前节点的数据
      - index： 当前节点在兄弟节点中的索引
      - nodeList： 当前节点的所有同级节点
      - level： 当前节点的层级
      - path： 从根节点到当前节点的路径，形式为 ` [ { node: {}, index: 1 } ] `，比如
        ```JavaScript
          [
            { "node": { "id": 123, "parentId": 0, "name": "根节点", }, "index": 0 },
            { "node": { "id": 234, "parentId": 123, "name": "一级节点2" }, "index": 2 },
            { "node": { "id": 345, "parentId": 234, "name": "二级节点2-3", }, "index": 3 }
          ]
        ```

## 5. 事件
  + `@on-choose(node, parentNode, event)`， 鼠标按住节点时
  + `@on-unchoose(node, parentNode, event)`，鼠标松开节点时  
  + `@on-node-sort(node, parentNode, event)`，节点在父节点内部排序后  
  + `@on-node-add(node, parentNode, event)`，节点添加到新的父节点后  
  + `@on-node-remove(node, parentNode, event)`，节点从父节点移除后  

## 6. 组件静态方法
  ```JavaScript
    flattenTree(list, callback) { return result; }
    /**
     * @description: 把树状数据结构扁平化为一个数组，先序遍历，深度优先
     * @param {Array | Object} list - 节点/节点列表，节点会自动转换成节点列表，默认为树的根节点
     * @callback callback - 对所有后代节点进行处理，默认原样返回
     * @returns {Array} - 返回被拍扁后的所有后代节点
     */
  ```