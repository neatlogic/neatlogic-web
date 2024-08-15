<template>
  <div v-if="catalogName">
    {{ catalogName }}
  </div>
  <div v-else class="text-grey">-</div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {},
  extends: AttrBase,
  props: {},
  data() {
    return {
      issueCatalogName: ''
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
  methods: {},
  filter: {},
  computed: {
    catalogName() {
      return (this.issueData && this.issueData.catalogName) || this.issueCatalogName;
    },
    catalog() {
      return (this.issueData && this.issueData.catalog) || (this.valueList && this.valueList.length > 0 && this.valueList[0]);
    },
    needAjax() {
      return (this.catalogName == null) && this.catalog;
    }
  },
  watch: {
    needAjax: {
      handler(val) {
        if (val) {
          this.$api.rdm.catalog.getCatalogById(this.catalog).then(res => {
            if (res.Return) {
              this.issueCatalogName = res.Return.name;
            }
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
