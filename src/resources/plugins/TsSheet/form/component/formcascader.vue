<template>
  <div v-if="errorList.length === 0">
    <div v-if="readonly" :class="readonlyTextHighlightClass">{{ getText(value) }}</div>
    <TsFormCascader
      v-else
      ref="formitem"
      v-bind="setting"
      :validateList="validateList"
      :readonly="readonly"
      :value="value"
      :disabled="disabled"
      transfer
      border="border"
      @change="
        val => {
          setValue(val);
        }
      "
    ></TsFormCascader>
  </div>
  <div v-else class="text-grey">
    <ul>
      <li v-for="(error,index) in errorList" :key="index">{{ error }}</li>
    </ul>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsFormCascader from '@/resources/plugins/TsForm/TsFormCascader.vue';
export default {
  name: '',
  components: {
    TsFormCascader
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: {type: Boolean, default: false},
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {
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
    validConfig() {
      return this.validConfigForListItem();
    }
  },
  filter: {},
  computed: {
    errorList() {
      const errorList = [];
      this.validConfig().forEach(error => {
        if (!errorList.includes(error.error)) {
          errorList.push(error.error);
        }
      });
      return errorList;
    },
    setting() {
      const setting = {};
      if (this.config.dataSource === 'matrix') {
        //
      } else {
        setting.dataList = this.config.dataList;
      }
      setting.placeholder = this.config.placeholder;
      return setting;
    },
    actualValue() {
      if (this.value) {
        if (!this.config.isMultiple && this.value instanceof Array && this.value.length > 0) {
          return this.value[0];
        } else {
          return this.value;
        }
      } 
      return null;
    },
    getText() {
      return val => {
        if (val) {
          if (this.value instanceof Array) {
            return val.join('/');
          } else {
            return val;
          }
        }
        return '';
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
