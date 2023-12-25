<template>
  <div>
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
  props: {
    extramenu: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      selecteData: []
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
        if (url && this.checkUrl(url)) {
          window.open(url, '_blank');
        }
      }
    },
    onVisibleChange() {
      this.selecteData = [];
    },
    checkUrl(string) {
      let givenURL;
      try {
        givenURL = new URL(string);
      } catch (error) {
        this.$Notice.error({ title: 'URL' + this.$t('page.exception'), desc: error});
        return false; 
      }
      return true;
    }
  },
  filter: {},
  computed: {},
  watch: {}
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
