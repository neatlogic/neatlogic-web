<template>
  <ul v-if="pathList" class="breadcrumb-container">
    <li
      v-for="(path, index) in pathList"
      :key="index"
      :class="{ active: index == pathList.length - 1 }"
      @click="clickItem(index)"
    >
      <i v-if="path.icon" :class="[path.icon, 'text-grey']"></i>
      {{ path.text }}
    </li>
  </ul>
</template>
<script>
export default {
  name: 'TsBreadcrumb',
  components: {},
  props: {
    pathList: {
      //{type , path, text , icon, beforeGoto}  type(router | href | blank)
      type: Array,
      default() {
        // return [{ type: "router", path: "/menu-manage", text: "router", icon: "ts-setting", beforeGoto: function(vnode){return false} },
        // { type: "href", path: "/process.html#/worktime-manage", text: "href", icon: "", beforeGoto: null },
        // { type: "blank", path: "/process.html#/jobclass-manage", text: "blank", icon: "", beforeGoto: null }
        // ];
        return [];
      }
    },
    beforeGoto: Function //跳转之前执行的方法，需要有返回值，如果返回为true 则执行下一步，如果为false，则不执行
  },
  data() {
    return {
      gotoIndex: null
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
    clickItem(index) {
      if (this.pathList.length == index + 1) {
        //最后的一项禁止点击
        return;
      }
      let path = this.pathList[index];
      let beforeGoto = path.beforeGoto || this.beforeGoto;
      this.gotoIndex = index;
      if (beforeGoto && beforeGoto instanceof Function) {
        beforeGoto(this) && this.gotoUrl();
      } else {
        this.gotoUrl();
      }
    },
    gotoUrl() {
      if (this.gotoIndex === null) {
        return;
      }
      let path = this.pathList[this.gotoIndex];
      if (path.type == 'router') {
        //打开新的窗口的路由跳转
        this.$router.push({ path: path.path });
      } else if (path.type == 'href') {
        //打开新的窗口的路由跳转
        let that = this.$root.$children[0] ? this.$root.$children[0].$refs.root : null;//获取router-view 的vue 对象
        this.$utils.gotoHref(HOME + path.path, that);
      } else {
        //统一模块的路由跳转
        window.open(HOME + path.path, '_blank');
      }
      this.gotoIndex == null;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
 @import (reference) '~@/resources/assets/css/variable.less';
.breadcrumb-container {
  display: inline-block;
  padding: @space-xs 0px;
  > li {
    padding: 0px @space-sm;
    display: inline-block;
    cursor: pointer;
    position: relative;
    &:first-of-type {
      padding-left: 0px;
    }
    &:last-of-type {
      padding-right: 0px;
      &::after {
        content: '';
      }
    }
    &:hover {
      color: @primary-color;
    }
    &.active {
      cursor: text;
      color: @primary-color;
    }
    &::after {
      content: '/';
      opacity: 0.5;
      position: absolute;
      right: 0px;
    }
    > i {
      &::before {
        font-weight: normal;
        margin-right: 1px;
      }
    }
  }
}
</style>
