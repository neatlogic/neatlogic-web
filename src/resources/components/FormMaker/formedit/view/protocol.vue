
<template>
  <div class="protocol">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <TsFormSelect 
      v-if="setting" 
      v-model="currentValue" 
      v-bind="getConfig" 
      :width="setting.config.width || null" 
      :disabled="isReadonly || false" 
      :value="currentValue"
      :placeholder="setting.config.placeholder"
      @on-change="updatethis(currentValue)"
      @change-label="changeLabel"
    ></TsFormSelect>
    <Select v-else placeholder="请选择"></Select>
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import viewmixin from './viewmixin.js';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {
  },
  mixins: [viewmixin],
  props: {
    value: [Number, String]
  },
  data() {
    let _this = this;
    return {
      protocolConfig: {
        dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
        multiple: false,
        rootName: 'tbodyList',
        search: true,
        clearable: true,
        transfer: true,
        dealDataByUrl: _this.dealDataByUrl || null
      },
      currentValue: ''
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
      this.$set(this, 'currentValue', val);
    },
    getValue(val) {
      return this.currentValue;
    },
    validateValue() {
      let isVaild = true;
      isVaild = this.$children[0].valid();
      return isVaild;
    },
    dealDataByUrl(nodeList) { // 处理默认值的数据结构
      return this.dealDataFilter(nodeList);
    },
    dealDataFilter(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];           
      nodeList.forEach(v => {
        let text = '';
        if (v.port) {
          text = v.name + '(' + v.port + ')';
        } else {
          text = v.name;
        }
        columlist.push(
          {text: text, value: v.id}
        );
      });
      return columlist;
    }
  },
  computed: {
    getConfig() {
      let config = this.protocolConfig;
      config.validateList = this.setting.config.isRequired ? ['required'] : [];
      config.readonlyClass = '';
      return config;
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          this.currentValue = val;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.protocol{
  position: relative;
}
</style>
