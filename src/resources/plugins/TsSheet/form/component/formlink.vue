<template>
  <div>
    <a
      class="text-href"
      :href="config.value ? config.value : 'javascript:void(0);'"
      :target="config.target || '_self'"
    >{{ config.text || $t('page.hyperlink') }}</a>
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
        errorList.push({ field: 'text', error: this.$t('page.hyperlink') + '：' + this.$t('form.validate.required', {'target': this.$t('page.displaytext')}) });
      } 
      if (this.$utils.isEmpty(this.config.value)) {
        errorList.push({ field: 'value', error: this.$t('page.hyperlink') + '：' + this.$t('form.validate.required', {'target': this.$t('term.framework.jumpaddress')}) });
      } else if (this.config.value) {
        let regx = /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+$/;
        if (!regx.test(this.config.value)) {
          errorList.push({ field: 'value', error: this.$t('page.hyperlink') + '：' + this.$t('message.pleaseentertruetarget', {'target': this.$t('term.framework.jumpaddress')}) });
        }
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
