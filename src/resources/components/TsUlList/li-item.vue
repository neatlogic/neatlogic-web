<template>
  <div :class="classes" class="radius-sm" :style="itemStyle">
    <div class="ivu-cell" :style="size === 'small' ? 'margin:0px !important;padding:0px !important' : ''" @click="onClick">
      <div class="ivu-cell-item">
        <slot :row="liData">
          <span v-if="liData[childName] && liData[childName].length > 0 && !isGroup" class="ts"></span>
          <div class="ivu-cell-main">
            <div class="ivu-cell-title" :class="{ 'text-href': liData._isSelected }">{{ liData[textName] }}</div>
          </div>
        </slot>
        <!--<div v-if="liData._isSelected" class="ivu-cell-footer"><span class="ivu-cell-extra tsfont-check text-href"></span></div>-->
      </div>
    </div>
    <div v-if="(liData[childName] && liData[childName].length > 0) || isGroup" class="ive-cell-child">
      <transition name="fade">
        <div v-show="open || isGroup">
          <LiItem
            v-for="(citem, cindex) in liData[childName]"
            :key="cindex"
            :liData="citem"
            :textName="textName"
            :valueName="valueName"
            :childName="childName"
            :isGroup="isGroup"
          ></LiItem>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
const prefixCls = 'ivu-cell';
export default {
  name: 'LiItem',
  components: {},
  props: {
    liData: Object, //{disabled _isSelected children}
    textName: String,
    valueName: String,
    childName: String,
    className: String,
    itemStyle: String,
    size: { type: String, default: 'normal' }, //normal small
    isGroup: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      open: _this.liData.open || false
    };
  },
  methods: {
    dispatch(componentName, eventName, params) {
      let parent = this.$parent || this.$root;
      let name = parent.$options.name;

      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.name;
        }
      }
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    onClick() {
      var _this = this;
      if (_this.liData[_this.childName] && _this.liData[_this.childName].length > 0) {
        _this.open = !_this.open;
        return;
      }
      _this.dispatch('TsUlList', 'on-click', _this.liData[_this.valueName]);
    }
  },
  computed: {
    classes() {
      let _this = this;
      const classes = {
        'ivu-cell-disable': _this.liData.disabled || false,
        'bg-selected': _this.liData._isSelected || false,
        'ivu-cell-group': !!(_this.liData[_this.childName] && _this.liData[_this.childName].length > 0),
        open: _this.open || false
      };
      if (this.className) {
        const cs = this.className.split('[\s]+');
        if (cs && cs.length > 0) {
          cs.forEach(c => {
            classes[c] = true;
          });
        }
      }
      return classes;
    }
  }
};
</script>
<style lang="less" scoped>
.ivu-cell-group .ivu-cell,
.ivu-cell-selected {
  border-radius: 10px;
  margin-bottom: 10px;
}
.ive-cell-child {
  padding-left: 15px;
}
.ivu-cell-group.level .ivu-cell-item {
  position: relative;
  padding-left: 20px;
}
.ivu-cell-group.group > div > .ivu-cell > .ivu-cell-item {
  position: relative;
  padding-left: 0px;
  color: #999;
  cursor: text;
}
.ivu-cell-group.group .ivu-cell-item > ts {
  display: none;
}
.ivu-cell-item > .ts {
  top: 50%;
  left: 0px;
  transform: translateY(-50%);
  position: absolute;
}
.ivu-cell {
  //覆盖原来样式
  padding: 6px !important;
}
.ivu-cell:hover {
  //覆盖原来样式
  background-color: transparent !important;
}
/*.ivu-cell-item > .ts::before {
  content: '\e811';
  padding: 0px;
}
.ivu-cell-group.open > .ivu-cell > .ivu-cell-item > .ts::before {
  content: '\e810';
}*/
</style>
