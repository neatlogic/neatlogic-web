<template>
  <transition-group
    name="list"
    tag="ul"
    class="main-left"
    :class="isFirst ? 'menu-ul' : 'nav-ul'"
  >
    <li 
      v-for="menu in dataList" 
      :key="menu.uuid" 
      class="nav-li" 
      :class="setLiclass(menu, oldUuid, newUuid)" 
      @dragleave="dragleave($event, menu)"
    >
      <div 
        :ref="menu.uuid" 
        class="li-div"
        :class="setTxtclass(menu, oldUuid, newUuid)" 
        :draggable="menu.uuid!=helpData.uuid?true:false"
        @click.stop="gotoItem(menu.uuid)" 
        @dragstart.stop="dragstart($event, menu)" 
        @dragend="dragend($event, menu)" 
        @dragover.stop="dragenter($event, menu)"
      >
        <span
          v-if="menu.handler == 'h1'"
          class="btn-toggle "
          :class="getH1Icon(menu)"
          @click.stop="showChildren(menu)"
        ></span>
        <span :title="menu.content" v-text=" !menu.content && menu.uuid!=helpData.uuid ?emptyHtml:menu.content"> </span>
      </div>
      <LiItem
        v-if="menu.children && menu.children.filter(c => { return c.handler == 'h2'; }).length > 0 && menu.handler == 'h1' "
        v-show="menu.showNext != false"
        :menuList="menu.children"
        :isFirst="nextTag"
        :selectedUuid="selectedUuid"
        @dragEnd="dragEnd"
        @dragStart="dragStart"
        @dragEnter="dragEnter"
        @goPrev="goPrev"
      ></LiItem>
    </li>
  </transition-group>
</template>
<script>
export default {
  inject: {
    $fn: {
      default: {}
    }
  },
  name: 'LiItem',
  components: {},
  filters: {},
  props: {
    menuList: Array,
    isFirst: {
      type: Boolean,
      default: true
    },
    selectedUuid: String
  },
  data() {
    return {
      helpData: {handler: 'h1', uuid: 'helpUuid', content: '', config: {}},
      dataList: [], //树图相关的数据
      selectId: null, //选中哪一个，用于左侧选中右侧正文定位
      nextTag: false, //第二层开始的有个标志不是第一层的标志
      oldUuid: null, //拖动哪一个
      newUuid: null, //拖动到哪一个
      isPrev: false, //拖拽是否在元素前面
      timer: null, //第一层数据是否要触发更新事件的定时器（加个loaddash防止拖动触发太快导致的计算位移问题）
      emptyHtml: '(' + this.$t('message.knowledge.notcatalog') + ')'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    gotoItem(uuid) {
      //定位当前菜单的正文内容
      let parent = getParent(this);
      parent.anchor(uuid);
    },
    getNext(item, i) {
      //获取当前的h1的下一层
      let handler = item.handler;
      let typeArr = ['h1', 'h2', 'ol', 'ul', 'p', 'table', 'img', 'code'];
      let list = [];
      let li = this.dataList;
      for (var j = i + 1; j < li.length; j++) {
        if (typeArr.indexOf(li[j].handler) > typeArr.indexOf(handler)) {
          list.push(li[j]);
        }
        if (li[j].handler == handler) {
          break;
        }
      }
      return list;
    },
    dragstart(e, value) {
      if (value.uuid == this.helpData.uuid) {
        return false;
      } 
      //拖动哪一个
      if (this.isFirst) {
        this.oldUuid = value.uuid;
      } else {
        this.oldUuid = value.uuid;
        this.$emit('dragStart', value.uuid, value);
      }
    },
    dragend(e, value) {
      //拖拽结束的时候再计算
      if (this.isFirst) {
        this.updateList(e);
      } else {
        this.$emit('dragEnd');
      }
    },
    dragenter(e, value) {
      //拖动过程里拖动到哪一个(由原来的dragenter调整为dragover，不然li的子级无法单独得到拖进事件)
      e.dataTransfer.setData('dropEffect', 'move');
      //如果拖动元素y偏移>拖动到的元素则为在拖动元素前添加
      let isPrev = e.clientY > this.$refs[value.uuid][0].getBoundingClientRect().top;
      if (this.isFirst) {
        this.newUuid = value.uuid;
        this.isPrev = isPrev;
      } else {
        this.newUuid = value.uuid;
        this.$emit('dragEnter', value.uuid);
        this.$emit('goPrev', isPrev);
      }
    },
    dragleave(e, value) {
      //离开的时候需要清除选中的样式
      if (!this.isFirst) {
        this.newUuid = null;
      }
    },
    showChildren(item) {
      //是否显示二级
      if (item.showNext != false) {
        this.$set(item, 'showNext', false);
      } else {
        this.$set(item, 'showNext', true);
      }
    },
    dragEnd() {
      //如果不是第一层，结束事件需要一层一层往上传递到第一层
      if (!this.isFirst) {
        this.$emit('dragEnd');
      } else {
        this.updateList();
      }
    },
    dragStart(oldUuid) {
      //如果不是第一层，拖动元素的数据需要一层一层往上传递到第一层
      if (!this.isFirst) {
        this.$emit('dragStart', oldUuid);
      } else {
        this.oldUuid = oldUuid;
      }
    },
    dragEnter(uuid) {
      //如果不是第一层，拖动到哪个元素需要一层一层往上传递到第一层
      if (!this.isFirst) {
        this.$emit('dragEnter', uuid);
        this.oldUuid = null;
        this.newUuid = null;
      } else {
        this.newUuid = uuid;
      }
    },
    goPrev(status) {
      if (!this.isFirst) {
        this.$emit('goPrev', status);
      } else {
        this.isPrev = status;
      }
    },
    updateList(e) {
      //结束拖拽后都需要置空每一层的拖拽记录数据
      let _this = this;
      if (_this.timer) {
        clearTimeout(_this.timer);
        _this.timer = null;
      } else {
        _this.timer = function() {
          setTimeout(function() {
            _this.update();
          }, 150);
        };
        _this.timer();
      }
    },
    update() {
      let _this = this;
      if (_this.timer) {
        clearTimeout(_this.timer);
        _this.timer = null;
      }
      if (this.oldUuid != this.newUuid && this.newUuid != null) {
        let newlist = this.$fn.updataMenuList();
        newlist.push(this.helpData);
        let oldConfig = this.getDataByUuid(newlist, this.oldUuid);
        let news = newlist.splice(oldConfig.startIndex, oldConfig.endIndex - oldConfig.startIndex);
        let newConfig = this.getDataByUuid(newlist, this.newUuid);
        newlist.splice(newConfig.startIndex, 0, ...news);
        newlist.splice(newlist.length - 1, 1);
        this.$emit('getMenu', newlist);
        this.oldUuid = null;
        this.newUuid = null;
      }
    },
    getDataByUuid(list, uuid) {
      let config = {startIndex: null, endIndex: null};
      let starCom = null;
      list.forEach((item, index) => {
        if (item.uuid == uuid) {
          config.startIndex = index;
          starCom = item;
        } else if (starCom && config.endIndex === null && (item.handler == starCom.handler || item.handler == 'h1')) {
          config.endIndex = index;
        }
      });
      config.endIndex === null && (config.endIndex = list.length - 1);
      return config;
    }
  },
  computed: {
    setLiclass() {
      return function(item, olduuid, newuuid) {
        let className = 'nav-' + item.handler;
        if (!this.isFirst) {
          className += ' second-li ';
        }
        if (item.uuid == newuuid && item.uuid != olduuid) {
          className += ' drop-target border-primary';
        }
        return className;
      };
    },
    setTxtclass() {
      return function(item, olduuid, newuuid) {
        let className = '';
        // if (this.selectedUuid && this.selectedUuid == item.uuid) {
        //   className = 'text-href selected';
        // } else {
        //   className = 'text-action';
        // }
        if (olduuid != newuuid) {
          if (item.uuid == olduuid) {
            className += ' li-from';
          } else if (item.uuid == newuuid) {
            className += ' li-to';
          }
        }
        return className;
      };      
    },
    getH1Icon() {
      return function(menu) {
        let classStr = '';
        let hasChildren = menu.children && menu.children.find(item => item.handler == 'h2');
        if (hasChildren) {
          classStr = classStr + (menu.showNext != false ? 'tsfont-drop-down' : 'tsfont-drop-right');
        } else if (menu.uuid != this.helpData.uuid) {
          classStr = classStr + 'tsfont-dot';
        }
        return classStr;
      };
    }
  },
  watch: {
    menuList: {
      handler: function(val) {
        this.dataList = this.$utils.deepClone(val);
        if (this.isFirst) {
          this.dataList.length > 0 && this.dataList.push(this.helpData);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
function getParent(node) {
  let list = ['EditMain'];
  if (node && node.$parent) {
    let tag = node.$parent.$options.tagComponent;
    if (list.indexOf(tag) >= 0) {
      return node.$parent;
    } else if (node.$parent) {
      return getParent(node.$parent);
    } else {
      return false;
    }
  } else {
    return false;
  }
}
</script>
<style lang="less" scoped>
ul.main-left{
   white-space: pre;
}
.menu-ul {
  overflow: hidden;
  li {
    position: relative;
  }
  .nav-h2 {
    padding-left: 20px;
    &.second-li {
      .li-div {
        &:before {
          margin: 0px 6px 0px 0px;
        }
      }
    }
  }
}
.li-div {
  line-height: 26px;
  height: 26px;
  overflow: hidden;
  white-space: pre;
  word-break: keep-all;
  text-overflow: ellipsis;

  cursor: pointer;
  .btn-toggle {
    width: 18px;
    text-align: center;
    font-size: 20px;
    position: absolute;
    left: 0px;
  }
  &.selected {
    font-weight: bold;
  }
}
.nav-li {
  display: none;
  &.drop-target{
    position: relative;
    &::before{
      position: absolute;
      content: '';
      left: -50px;
      right: -50px;
      border-top: 1px solid;
      border-top-color: inherit;
    }
  }
  .li-from {
    cursor: move;
  }
  
  .li-to {
    position: relative;
  }
}
.nav-h2 {
  display: inline-block;
  width: 100%;
  line-height: 36px;
  min-height: 36px;
}
.nav-h1 {
  display: block;
  width: 100%;
  line-height: 36px;
  min-height: 36px;
  > .li-div {
    font-size: 110%;
    line-height: 30px;
    height: 30px;
    padding-left: 20px;
  }
}
.list-enter-active,
.list-leave-active {
  transition: all 0.1s;
}
.list-enter,
.list-leave-to {
  opacity: 0;
}
</style>
