<template>
  <div v-if="subFormData">
    <Button v-if="mode ==='read'" @click="addFormData">添加</Button>
    <div>
      <div v-for="(item,index) in formDataList" :key="index">
        <TsSheet
          ref="sheet"
          :mode="mode==='edit'||mode==='editSubform'?'editSubform':'readSubform'"
          :value="subFormData"
          :data="item"
          :disabled="disabled"
          :readonly="readonly"
          isFormSubassembly
          @setValue="(val)=>{updateValue(val, item, index)}"
        ></TsSheet>
      </div>
    </div>
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
      formDataList: [],
      subFormData: null
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      if (this.value && this.value instanceof Array && this.value.length > 0) {
        const value = this.$utils.deepClone(this.value);
        if (value.length > 0) {
          this.formDataList.push(...value);
          if (!this.$utils.isSame(this.value, value)) {
            //如果值发生变化，则重新设置值
            this.setValue(value);
          }
        }
      } else { 
        //默认展示行
        this.addFormData();
      }
    },
    updateValue(val, item, index) {
      if (!this.$utils.isSame(val, item)) { 
        this.formDataList.splice(index, 1, val);
        this.setValue(this.formDataList); 
      }
    },
    async validData() {
      const errorList = [];
      const sheet = this.$refs['sheet'];
      let isValid = true;
      Array.from(sheet).forEach(async s => {
        let errorData = await s.validData();
        if (!this.$utils.isEmpty(errorData)) {
          isValid = false;
        }
      });
      if (!isValid) {
        errorList.push({uuid: this.formItem.uuid, error: this.formItem.label + '校验失败'});
      }
      return errorList;
    },
    addFormData() {
      this.formDataList.push({});
    }
  },
  filter: {},
  computed: {},
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
