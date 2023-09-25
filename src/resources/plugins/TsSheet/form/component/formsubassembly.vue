<template>
  <div v-if="subFormData">
    <TsSheet
      ref="sheet"
      mode="subform"
      :value="subFormData"
      :data="actualValue"
      :disabled="mode==='edit'?true:disabled"
      :readonly="readonly"
      @setValue="updateValue"
    ></TsSheet>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: {
    TsSheet: resolve => require(['@/resources/plugins/TsSheet/TsSheet.vue'], resolve)
  },
  extends: base,
  mixins: [validmixin],
  props: {},
  data() {
    return {
      subFormData: null
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
    updateValue(val) {
      if (!this.$utils.isSame(val, this.value)) { 
        this.setValue(val); 
      }
    },
    async validData() {
      const errorList = [];
      const sheet = this.$refs['sheet'];
      let errorData = await sheet.validData();
      if (!this.$utils.isEmpty(errorData)) {
        errorList.push({uuid: this.formItem.uuid, error: this.formItem.label + '校验失败'});
      }
      return errorList;
    }
  },
  filter: {},
  computed: {
    actualValue() {
      if (this.value) {
        if (typeof this.value == 'string') {
          return JSON.parse(this.value);
        } else {
          return this.value;
        }
      }
      return null;
    }
  },
  watch: {
    formItem: {
      handler(val) {
        if (val && val.formData) {
          this.subFormData = val.formData.formConfig;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
