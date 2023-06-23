<template>
  <component
    :is="appData.type + 'Editor'"
    v-if="appData"
    ref="editor"
    :appData="appData"
  ></component>
</template>
<script>
import * as editor from './index.js';

export default {
  name: '',
  components: {
    ...editor
  },
  props: {
    projectId: { type: Number },
    appId: { type: Number }
  },
  data() {
    return {
      appData: null
    };
  },
  beforeCreate() {},
  created() {
    this.getAppById();
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
    getAppById() {
      this.$api.rdm.app.getAppById(this.appId).then(res => {
        this.appData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
