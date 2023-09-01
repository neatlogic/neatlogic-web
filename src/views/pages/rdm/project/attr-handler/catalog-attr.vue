<template>
  <div>
    <TsFormTree
      ref="select"
      v-model="catalog"
      :readonly="readonly"
      transfer
      :border="border"
      :validateList="validateList"
      v-bind="catalogConfig"
      @change="
        (val, opt) => {
          $emit('setValue', 'catalog', val, opt.text);
        }
      "
      @change-label="(text, selectedList) => $emit('changeLabel', text, selectedList)"
    ></TsFormTree>
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {
    TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve)
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
      catalogConfig: {
        url: 'api/rest/rdm/catalog/search',
        params: { appId: this.attrConfig.appId },
        valueName: 'id',
        textName: 'name',
        showPath: true
      },
      catalog: (this.issueData && this.issueData.catalog) || (this.valueList && this.valueList.length > 0 && this.valueList[0]) || []
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
    valid() {
      return this.$refs['select'].valid();
    }
  },
  filter: {},
  computed: {
    validateList() {
      if (this.mode === 'input' && this.attrConfig.isRequired) {
        return [{ name: 'required', message: ' ' }];
      }
      return [];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
