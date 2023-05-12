<template>
  <ul :id="id" class="ztree"></ul>
</template>

<script>
import '@/resources/assets/js/jquery-1.11.1.js';
import '@/resources/plugins/ztree/js/jquery.ztree.all.min.js';
export default {
  name: 'TsZtree',
  components: {},
  props: {
    zNodes: Array,
    url: String,
    rootName: String,
    setting: Object,
    id: { type: String, required: true }
  },
  data: function() {
    var _this = this;
    var url = _this.setting && _this.setting.async && _this.setting.async.url ? _this.setting.async.url : '';
    return {
      configSetting: {},
      asyncUrl: url
    };
  },
  mounted() {
    this.getZtree();
    if (this.configSetting.addDomList && this.configSetting.addDomList.length > 0) {
      $('ul#' + this.id).addClass('hoverDom');
    }
  },
  beforeDestroy() {
    this.cancelAxios && this.cancelAxios.cancel();
  },
  methods: {
    getZtree: function(type, val) {
      if (!((this.zNodes && this.zNodes.length > 0) || this.url)) {
        //当url 和zNodes都不存在时不进行渲染
        return;
      }
      var _this = this;
      var defaultSetting = {
        //默认的配置文件
        defaultSelectId: null,
        addDomList: [], //{ icon: "tsfont-edit",class:"",text:"asdf",desc:"asdf", clickFn: function(treeNode) {},initFn:(treeNode,$span)}
        drapSetting: {
          //拖动参数设置
          drapUrl: null, //拖拽之后条用用url
          parentId: 'parentId', //拖拽传递的parentId的key值
          id: 'id', //拖拽传递的
          targetId: 'targetId'
        },
        view: {
          showIcon: false,
          dblClickExpand: true,
          showLine: true,
          selectedMulti: false,
          nameIsHTML: true,
          enable: true,
          showTitle: true,
          addHoverDom: _this.addHoverDom
        },
        data: {
          simpleData: {
            enable: true,
            idKey: 'id',
            pIdKey: 'parentId',
            rootPId: 1
          }
        },
        callback: {
          onDrop: _this.onDrop
        },
        edit: {
          drag: {
            isCopy: true,
            isMove: true,
            prev: true,
            next: true,
            inner: true
          },
          showRemoveBtn: false,
          showRenameBtn: false,
          enable: true
        }
      };

      _this.configSetting = _this.deepClone(defaultSetting, _this.setting);
      if (type == 'url' || (typeof type == 'undefined' && _this.url)) {
        //利用url获取数据
        this.cancelAxios && this.cancelAxios.cancel();
        this.cancelAxios = this.$https.CancelToken.source();
        let url = val || _this.url;
        this.$https({ method: 'get', url: url, cancelToken: this.cancelAxios.token})
          .then(res => {
            if (res) {
              if (res.Status == 'OK') {
                $.fn.zTree.init($('#' + _this.id), _this.configSetting, res.Return.menuList).expandAll(true);
              } else {
                //
              }
            }
          })
          .catch(error => {
            console.log(error);
          });
      } else if (type == 'node' || (typeof type == 'undefined' && _this.zNodes)) {
        //利用node来渲染数据
        var nodes = val || _this.zNodes;
        $.fn.zTree.init($('#' + _this.id), _this.configSetting, nodes).expandAll(true);
      } else if (type == 'asyncurl' || (typeof type == 'undefined' && _this.configSetting.async.url)) {
        //点击展开获取数据
        _this.configSetting.async.url = value || _this.configSetting.async.url;
        $.fn.zTree.init($('#' + _this.id), _this.configSetting, null).expandAll(true);
      }
      _this.configSetting.defaultSelectId && _this.selectedNodeById(_this.configSetting.defaultSelectId);
    },
    addHoverDom: function(treeId, treeNode) {
      var _this = this;
      var $a = $('#' + treeNode.tId + '_span');
      if (treeNode.hasAddDom || $a.length <= 0 || !_this.configSetting.addDomList || _this.configSetting.addDomList.length <= 0) {
        return;
      } else {
        treeNode.hasAddDom = true;
        var $html = $('<span class="addDom"></span>');
        for (let i in _this.configSetting.addDomList) {
          let item = _this.configSetting.addDomList[i];
          if (typeof item.isAddFn == 'function' && !item.isAddFn(treeNode)) {
            continue;
          }
          var $ele = $('<i class="' + (item.icon || '') + ' ' + (item.class || '') + '" title="' + (item.desc || '') + '">' + (item.text || '') + '</i>');
          $ele.on('click', function(event) {
            typeof item.clickFn == 'function' && item.clickFn(treeNode);
            event.stopPropagation();
          });
          typeof item.initFn == 'function' && item.initFn(treeNode, $ele); //时间按钮的图标的操作
          $html.append($ele);
        }
        $a.after($html);
      }
    },
    onDrop: function(event, treeId, treeNodes, targetNode, moveType, isCopy) {
      var _this = this;
      if (!_this.configSetting.drapSetting.drapUrl || targetNode == null) {
        return;
      }
      var keyId = _this.configSetting.data.simpleData.idKey;
      var treeNode = treeNodes[0];
      var parentId = null;
      if (moveType == 'inner') {
        parentId = targetNode[keyId];
      } else {
        parentId = targetNode.getParentNode() == null ? 0 : targetNode.getParentNode()[keyId];
      }
      if (moveType != null) {
        var sendData = {
          lft: treeNode.lft,
          rht: treeNode.rht,
          moveType: moveType
        };
        sendData[_this.configSetting.drapSetting.parentId] = parentId;
        sendData[_this.configSetting.drapSetting.id] = treeNode[keyId];
        sendData[_this.configSetting.drapSetting.targetId] = targetNode[keyId];

        this.$https({
          method: 'post',
          url: _this.configSetting.drapSetting.drapUrl,
          data: sendData
        })
          .then(res => {
            if (res) {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.savesuccess'));
              } else {
                _this.$Notice.warning({ title: _this.$t('message.executefailed'), desc: res.Message });
              }
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    selectedNodeById: function(id) {
      let _this = this;
      let keyId = _this.configSetting.data.simpleData.idKey;
      if (id != 'undefined') {
        let tree = $.fn.zTree.getZTreeObj(_this.id);
        let node = tree.getNodeByParam(keyId, id, null);
        tree.selectNode(node);
        node && _this.configSetting.callback.onClick && _this.configSetting.callback.onClick('', id, node);
      }
    },
    updateNodeById: function(id) {
      let _this = this;
      let keyId = _this.configSetting.data.simpleData.idKey;
      if (id != undefined) {
        let tree = $.fn.zTree.getZTreeObj(_this.id);
        let node = tree.getNodeByParam(keyId, id, null);
        tree.selectNode(node);
      }
    },
    deepClone: function(oldValue, newValue) {
      var returnValue = Object.assign({}, oldValue, newValue);
      if (!newValue) {
        return returnValue;
      }
      var item = null;
      for (item in newValue) {
        oldValue[item] && (returnValue[item] = Object.assign({}, oldValue[item], newValue[item]));
      }
      return returnValue;
    }
  },
  computed: {},
  watch: {
    url: function(val, oldVal) {
      let _this = this;
      _this.getZtree('url', val);
    },
    zNodes: {
      handler(newVal, oldVal) {
        this.getZtree('node', newVal);
      },
      deep: true
    },
     'setting.async.url': function(val, oldVal) {
      _this.getZtree('asyncurl', val);
    }
  }
};
</script>
<style>
@import 'css/zTreeStyle.css';
</style>
