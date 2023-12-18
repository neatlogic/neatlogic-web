<template>
  <div v-if="!$utils.isEmpty(extramenu)">
    <Cascader
      :value="selecteData"
      :data="getDatalist(extramenu.children)"
      transfer-class-name="extramenu-transfer-cascader"
      change-on-select
      transfer
      @on-change="changeMenu"
      @on-visible-change="onVisibleChange"
    >
      <div class="cursor-pointer padding-sm">{{ extramenu.name }}</div>
    </Cascader>
  </div>  
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      extramenu: {},
      selecteData: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      this.$api.framework.extramenu.getMenuList().then(res => {
        if (res.Status === 'OK') {
          this.extramenu = res.Return || {};
        }
      }).finally(() => {
        this.$store.commit('setExtramenu', false); 
      });
    },
    getDatalist(arr) {
      for (var i in arr) {
        if (arr[i].name) {
          arr[i].label = arr[i].name;
          arr[i].value = arr[i].id;
        }
        if (arr[i].children && arr[i].children.length > 0) {
          this.getDatalist(arr[i].children);
        }
      }
      return arr;
    },
    changeMenu(val, selectedData) {
      if (!this.$utils.isEmpty(selectedData) && selectedData[selectedData.length - 1].url) {
        let url = selectedData[selectedData.length - 1].url;
        if (sessionStorage.getItem('neatlogic_authorization')) {
          url += '?neatlogic_authorization=' + sessionStorage.getItem('neatlogic_authorization');
        }
        window.open(url, '_blank');
      }
    },
    onVisibleChange() {
      this.selecteData = [];
    }
  },
  filter: {},
  computed: {
    isUpdateExtramenu() {
      return this.$store.state.isUpdateExtramenu;
    }
  },
  watch: {
    isUpdateExtramenu: {
      handler(val) {
        if (val) {
          this.init();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
.extramenu-transfer-cascader {
  .ivu-cascader-menu {
    height: auto;
    max-width: 180px;
  }
}
</style>
