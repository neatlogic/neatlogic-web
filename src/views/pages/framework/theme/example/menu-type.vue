<template>
  <div :class="type">
    <div class="topnav">
      <div class="topnav-menu">
        <ul class="topnav-menu-module">
          <li v-for="module in moduleList" :key="module.moduleId">
            <a class="module-item text-action">{{ module.moduleName }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {item: Object, type: String, list: Array},
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init(this.item.value);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init(val) {
      let active = this.getByValue('--top-active');
      if (this.type === 'light') {
        document.body.style.setProperty('--light-menuTopActive', active);
        document.body.style.setProperty('--light-menu', val);
      } else {
        document.body.style.setProperty('--dark-menu', val);
        document.body.style.setProperty('--dark-menuTopActive', active);
      }
    },
    getByValue(param) {
      let value = '';
      this.list.forEach(v => {
        if (v.param === param && v.value) {
          value = v.value;
        }
      });
      return value;
    }
  },
  filter: {},
  computed: {
    moduleList() {
      return this.$store.state.topMenu.moduleList;
    }
  },
  watch: {
    'item.value': {
      handler(val) {
        this.init(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.topnav {
  width: 680px;
}
.dark{
  .topnav{
    background-color: var(--dark-menu, #F0F0F0)!important;
    .module-item{
      &:hover{
        background:var(--dark-menuTopActive, #c6d9f6)!important;
      }
    }
  }
}
.light{
  .topnav{
    background-color: var(--light-menu, #c6d9f6)!important;
    .module-item{
      &:hover{
        background:var(--light-menuTopActive, #c6d9f6)!important;
      }
    }
  }
}
.topnav-menu-module {
  height: @top-height;
  background-color: transparent;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  .module-item {
    height: @top-height;
    line-height: @top-height;
    padding: 0 @space-sm;
    min-width: 60px;
    text-align: center;
    position: relative;
    transition: all 0.2s ease-in-out;
  }
  li {
    a {
      display: inline-block;
      padding: 0 10px;
      height: 50px;
      line-height: 50px;
      min-width: 60px;
      text-align: center;
      position: relative;
      transition: all 0.2s ease-in-out;
    }
  }
}
</style>
