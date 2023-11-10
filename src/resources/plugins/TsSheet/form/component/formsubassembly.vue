<template>
  <div v-if="subFormData">
    <div v-if="!disabled && !readonly && config.isCanAdd">
      <Button v-if="mode ==='read' || mode==='readSubform'" @click="addFormData">
        <span class="tsfont-plus">{{ label }}</span>
      </Button>
    </div>
    <div>
      <div v-for="(item,index) in formDataList" :key="index" class="sheet-list">
        <Divider v-if="formDataList.length > 1" orientation="start" class="subForm-label"><div class="text-title">{{ label }}</div></Divider>
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
        <div v-if="!disabled && !readonly && config.isCanAdd">
          <div v-if="(mode ==='read'|| mode==='readSubform') && formDataList.length>1" class="tsfont-close-o text-action del-icon" @click="delSheet(index)"></div>
        </div>
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
      subFormData: null,
      label: ''
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
      this.formDataList = [];
      if (this.value) {
        let value = this.$utils.deepClone(this.value);
        if (typeof value === 'string') {
          value = JSON.parse(value);
        }
        if (value instanceof Array && value.length > 0) {
          this.formDataList.push(...value);
        }
      } else { 
        if (!this.formDataList.length) {
          this.addFormData();
        }
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
      this.setValue(this.formDataList); 
    },
    delSheet(index) {
      this.formDataList.splice(index, 1);
      this.setValue(this.formDataList); 
    }
  },
  filter: {},
  computed: {},
  watch: {
    formItem: {
      handler(val) {
        if (val && val.formData) {
          this.subFormData = val.formData.formConfig;
          this.label = val.label;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.sheet-list {
  position: relative;
  .subForm-label {
    border-collapse: separate;
  }
  &:hover {
    .del-icon {
      display: block;
    }
  }
  .del-icon {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
