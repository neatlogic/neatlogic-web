<template>
  <div>
    {{ catalogName }}
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
      catalogName: this.issueData && this.issueData.catalogName,
      catalog: (this.issueData && this.issueData.catalog) || (this.valueList && this.valueList.length > 0 && this.valueList[0])
    };
  },
  beforeCreate() {},
  created() {
    if (this.catalogName == null && this.catalog) {
      this.$api.rdm.catalog.getCatalogById(this.catalog).then(res => {
        if (res.Return) {
          this.catalogName = res.Return.name;
        }
      });
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less"></style>
