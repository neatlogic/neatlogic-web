<template>
  <div>
    <TsFormItem :label="$t('page.tag')" :labelPosition="labelPosition" required>
      <div class="radius-sm padding-md" :class="validClass('tagKey')">
        <TsFormSelect
          ref="tagKey"
          v-model="config.tagKey"
          :dataList="tagList"
          transfer
          :validateList="validateList"
        ></TsFormSelect>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.framework.tablecomponent')" :labelPosition="labelPosition" required>
      <div class="radius-sm padding-md" :class="validClass('tableKey')">
        <TsFormSelect
          ref="tableKey"
          v-model="config.tableKey"
          :dataList="getTableList(config.tagKey)"
          valueName="key"
          textName="label"
          :disabled="disabled"
          :validateList="validateList"
        ></TsFormSelect>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.fieldmapping')" :labelPosition="labelPosition" required>
      <div class="radius-sm padding-md" :class="validClass('mapping')">
        <TsRow :gutter="10">
          <Col span="12">
            <label class="text-grey require-label">{{ $t('page.value') }}</label>
            <div class="formsetting-text">
              <TsFormSelect
                ref="mappingValue"
                v-model="config.mapping.value"
                :dataList="getTableThList(config.tagKey, config.tableKey)"
                :transfer="true"
                :disabled="disabled"
                :validateList="validateList"
                @on-change="changeMappingValue()"
              ></TsFormSelect>
            </div>
          </Col>
          <Col span="12">
            <label class="text-grey require-label">{{ $t('page.displaytext') }}</label>
            <div class="formsetting-text">
              <TsFormSelect
                ref="mappingText"
                v-model="config.mapping.text"
                :dataList="getTableThList(config.tagKey, config.tableKey)"
                :transfer="true"
                :disabled="disabled"
                :validateList="validateList"
                @on-change="changeMappingValue()"
              ></TsFormSelect>
            </div>
          </Col>
        </TsRow>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    labelPosition: {
      type: String,
      default: 'top' 
    },
    config: { type: Object},
    disabled: {
      type: Boolean,
      default: false 
    },
    extendConfigList: {
      type: Array,
      default: () => [] 
    },
    error: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      validateList: [{ name: 'required', message: ' ' }]
    };
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
    changeMappingValue() {
      this.$set(this.config, 'defaultValue', null);
    },
    valid() {
      let isValid = true;
      let refs = this.$refs;
      for (let key in refs) {
        if (refs.hasOwnProperty(key)) {
          let ref = refs[key];
          if (ref && ref.valid) {
            let valid = ref.valid();
            if (!valid) {
              isValid = false;
            }
          }
        }
      }
      return isValid;
    },
    //判断属性是否有异常
    hasError(attrName) {
      if (this.error && this.error.length > 0) {
        if (this.error.find(d => d.field === attrName)) {
          return true;
        }
      }
      return false;
    },
    //验证后的样式
    validClass(attrName) {
      const c = { 'bg-error-grey': this.hasError(attrName), 'bg-op': !this.hasError(attrName) };
      return c;
    }
  },
  filter: {},
  computed: {
    tagList() {
      if (!this.$utils.isEmpty(this.extendConfigList)) {
        const list = this.extendConfigList.map(i => {
          return {
            value: i.tag,
            text: i.tag
          };
        });
        return list;
      }
      return [];
    },
    getTableList() {
      return (val) => {
        let list = [];
        if (val) {
          let findItem = this.extendConfigList.find(item => item.tag == val);
          if (findItem) {
            list = findItem.attributeList.filter(item => item.config && item.config.dataConfig);
          }
        }
        return list;
      };
    },
    getTableThList() {
      return (tagKey, tableKey) => {
        let tableList = this.getTableList(tagKey);
        if (tableKey) {
          let findItem = tableList.find(item => item.key == tableKey);
          if (findItem && findItem.config && findItem.config.dataConfig) {
            return findItem.config.dataConfig.map(item => {
              return {
                text: item.label,
                value: item.uuid
              };
            }); 
          }
        } 
        return [];
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
