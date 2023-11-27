<template>
  <ul
    id="ztree"
    ref="treeDom"
    class="ztree"
    :class="{ hoverDom: hoverDomList && hoverDomList.length > 0 }"
  ></ul>
</template>

<script>
import '@/resources/assets/js/jquery-1.11.1.js';
import '@/resources/plugins/TsZtree/js/jquery.ztree.all.min.js';
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
    hoverDomList: { type: Array },
    onClick: { type: Function }, //点击事件
    onDrop: { type: Function }, //拖放事件
    value: { type: [String, Number] }, //默认选择节点
    enableToggleClick: { type: Boolean, default: false }, //是否激活反选功能（点击已选中节点取消点击)
    beforeDrop: {type: Function} // 拖放之前事件
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
          }
        },
        callback: {
          beforeDrop: this.beforeDrop,
          onDrop: (event, treeId, treeNodes, targetNode, moveType, isCopy) => {
            if (this.onDrop) {
              this.onDrop(this.zTreeObj, treeNodes, targetNode, moveType, isCopy);
            }
          },
          beforeClick: (treeId, treeNode, clickFlag) => {
            const selectedList = this.zTreeObj.getSelectedNodes();
            if (!selectedList.includes(treeNode)) {
              return true;
            } else if (this.enableToggleClick) {
              this.zTreeObj.cancelSelectedNode(treeNode);
              if (this.onClick) {
                this.onClick(this.zTreeObj, null);
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
      this.zTreeObj = $.fn.zTree.init($(this.$refs['treeDom']), this.defaultSetting, nodes);
      this.zTreeObj.expandAll(true);
      this.value && this.selectedNodeById(this.value);
    },
    selectedNodeById(id) {
      if (id != null && typeof id != 'undefined' && this.zTreeObj) {
        const node = this.zTreeObj.getNodeByParam(this.idKey, id, null);
        if (node) {
          this.zTreeObj.selectNode(node);
          this.onClick && this.onClick(this.zTreeObj, node);
        }
      }
    }
  },
  computed: {},
  watch: {
    nodes: {
      handler: function(val) {
        this.initTree();
      },
      deep: true
    },
    value: {
      handler: function(id) {
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
