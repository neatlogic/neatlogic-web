<template>
  <ul id="ztree" ref="treeDom" class="ztree" :class="{ hoverDom: hoverDomList && hoverDomList.length > 0 }"></ul>
</template>

<script>
import '@/resources/assets/js/jquery-1.11.1.js';
import '@/resources/plugins/TsZtree/js/jquery.ztree.all.js';
export default {
  name: 'TsZtree',
  components: {},
  props: {
    nodes: { type: Array },
    url: { type: String },
    params: { type: Object }, //url的参数
    rootName: { type: String }, //url返回数据的根名
    idKey: { type: String, default: 'id' }, //id的名称，默认是id
    pIdKey: { type: String, default: 'parentId' }, //父节点id的名称，默认是parentId
    setting: { type: Object },
    expandAll: { type: Boolean, default: true }, //默认全部展开
    hoverDomList: { type: Array },
    onClick: { type: Function }, //点击事件
    onDrop: { type: Function }, //拖放事件
    beforeExpand: { type: Function }, //展开前
    onExpand: { type: Function }, //展开事件
    value: { type: [String, Number] }, //默认选择节点
    enableToggleClick: { type: Boolean, default: false }, //是否激活反选功能（点击已选中节点取消点击)
    beforeDrop: { type: Function }, // 拖放之前事件
    beforeDrag: { type: Function },
    urlKey: { type: String, default: 'url' }, //节点链接的目标URL的属性名称, 特殊用途：当后台数据只能生成 url 属性，又不想实现点击节点跳转的功能时，可以直接修改此属性为其他不存在的属性名称,
    nodeClasses: { type: Function }, // 使用 className 设置文字样式，只针对 zTree 在节点上显示的<A>对象。便于 css 与 js 解耦 默认值：{add: [], remove: []} add表示新增类名，remove表示移除类名
    beforeClick: { type: Function }, //返回true或者false，判断是否可以点击
    renderName: { type: Function }, //自定义名称
    renderTitle: { type: Function } //自定义title
  },
  data() {
    return {
      zTreeObj: null,
      defaultSetting: {
        view: {
          showIcon: false,
          dblClickExpand: false,
          showLine: false,
          selectedMulti: false,
          nameIsHTML: true,
          showTitle: true,
          nodeClasses: this.nodeClasses,
          addHoverDom: (treeId, treeNode) => {
            var $a = $('#' + treeNode.tId + '_span', this.$refs['treeDom']);
            if (treeNode.hasAddDom || $a.length <= 0 || !this.hoverDomList || this.hoverDomList.length <= 0) {
              return;
            } else {
              treeNode.hasAddDom = true;
              var $html = $('<span class="addDom"></span>');
              this.hoverDomList.forEach(item => {
                if (typeof item.isAddFn === 'function' && !item.isAddFn(treeNode)) {
                  return true;
                }
                var $ele = $('<i class="' + (item.icon || '') + ' ' + (item.class || '') + '" title="' + (item.desc || '') + '">' + (item.text || '') + '</i>');
                $ele.on('click', event => {
                  typeof item.clickFn === 'function' && item.clickFn(treeNode);
                  event.stopPropagation();
                });
                typeof item.initFn == 'function' && item.initFn(treeNode, $ele); //时间按钮的图标的操作
                $html.append($ele);
              });
              $a.after($html);
            }
          }
        },
        data: {
          simpleData: {
            enable: true,
            idKey: this.idKey,
            pIdKey: this.pIdKey,
            rootPId: null
          },
          key: {
            url: this.urlKey
          },
          render: {
            name: this.renderName,
            title: this.renderTitle
          }
        },
        callback: {
          beforeDrop: this.beforeDrop,
          beforeDrag: this.beforeDrag,
          beforeExpand: this.beforeExpand,
          onExpand: this.onExpand,
          onDrop: (event, treeId, treeNodes, targetNode, moveType, isCopy) => {
            if (this.onDrop) {
              this.onDrop(this.zTreeObj, treeNodes, targetNode, moveType, isCopy);
            }
          },
          beforeClick: (treeId, treeNode, clickFlag) => {
            if (this.beforeClick) {
              return this.beforeClick(this.zTreeObj, treeNode);
            } else {
              const selectedList = this.zTreeObj.getSelectedNodes();
              if (!selectedList.includes(treeNode)) {
                return true;
              } else if (this.enableToggleClick) {
                this.zTreeObj.cancelSelectedNode(treeNode);
                if (this.onClick) {
                  this.onClick(this.zTreeObj, null);
                  return false;
                }
              }
            }
            return false;
          },
          onClick: (event, treeId, treeNode) => {
            if (this.onClick) {
              this.onClick(this.zTreeObj, treeNode);
            }
          }
        },
        edit: {
          drag: {
            isCopy: false,
            isMove: true,
            prev: true,
            next: true,
            inner: true
          },
          showRemoveBtn: false,
          showRenameBtn: false,
          enable: !!this.onDrop
        }
      }
    };
  },
  mounted() {
    this.initTree();
  },
  beforeDestroy() {
    this.cancelAxios && this.cancelAxios.cancel();
  },
  methods: {
    getData() {
      return this.zTreeObj.transformToArray(this.zTreeObj.getNodes());
    },
    async initTree() {
      const nodes = [];
      if (this.nodes && this.nodes.length > 0) {
        nodes.push(...this.nodes);
      }
      //如果提供了节点，并且同时提供了url，则url返回的数据加到节点数据后面。
      if (this.url) {
        this.cancelAxios && this.cancelAxios.cancel();
        this.cancelAxios = this.$https.CancelToken.source();
        let url = val || _this.url;
        await this.$https
          .post(url, this.params, {
            cancelToken: _this.cancelAxios.token
          })
          .then(res => {
            if (res) {
              if (res.Status == 'OK') {
                nodes.push(res.Return);
              }
            }
          })
          .catch(error => {
            console.error(error);
          });
      }
      this.zTreeObj = $.fn.zTree.init($(this.$refs['treeDom']), Object.assign(this.defaultSetting, this.setting), nodes);
      if (this.expandAll) {
        this.zTreeObj.expandAll(true);
      }
      if (this.value) {
        const node = this.selectedNodeById(this.value);
        if (node && this.onClick) {
          this.onClick(this.zTreeObj, node);
        }
      }
      this.$emit('ready', this.zTreeObj);
    },
    toggleExpand(flag) {
      this.zTreeObj.expandAll(flag);
    },
    selectedNodeById(id) {
      if (id != null && typeof id != 'undefined' && this.zTreeObj) {
        const node = this.zTreeObj.getNodeByParam(this.idKey, id, null);
        if (node) {
          this.zTreeObj.selectNode(node);
          return node;
        }
      }
      return null;
    },
    cancelSelectedAllNode() {
      var nodes = this.zTreeObj.getSelectedNodes();
      nodes.forEach(node => {
        this.zTreeObj.cancelSelectedNode(node);
      })
    },
    getZTreeObj(){ //获取 id 为 ztree 的 zTree 对象
      return $.fn.zTree.getZTreeObj('ztree');
    }
  },
  computed: {},
  watch: {
    nodes: {
      handler: function (val) {
        this.initTree();
      },
      deep: true
    },
    value: {
      handler: function (id, oldId) {
        this.selectedNodeById(id);
      },
      deep: true
    }
  }
};
</script>
<style>
@import 'css/zTreeStyle.css';
</style>
