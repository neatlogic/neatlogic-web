<template>
  <div>
    <a
      class="text-href"
      :href="config.value ? config.value : 'javascript:void(0);'"
      :target="config.target || '_self'"
    >{{ config.text || '超链接' }}</a>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: {
  },
  extends: base,
  mixins: [validmixin],
  props: {},
  data() {
    return {};
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
    validConfig() {
      const errorList = this.validDataForAllItem();
      if (this.$utils.isEmpty(this.config.text)) {
        errorList.push({ field: 'text', error: '超链接：显示文字不可以为空' });
      } 
      if (this.$utils.isEmpty(this.config.value)) {
        errorList.push({ field: 'value', error: '超链接：跳转地址不可以为空' });
      } 
      return errorList;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
