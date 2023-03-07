<template>
  <div class="value-div">
    <div v-if="!isLoading && dataList && dataList.length>0">
      <div v-for="(data ,index) in dataList" :key="index" class="dataList">
        <TsFormItem
          :required="data.isRequired?true : false"
          :label="data.name || data.key"
          :des="data.description"
          class="value-item"
          :labelWidth="100"
          labelPosition="right"
        >
          <Item
            :is="handleType(data.type)"
            ref="item"
            v-model="valueConfig[data.key]"
            class="item"
            :isRequired="data.isRequired"
            :defaultValue="data.defaultValue"
            :config="itemConfig[data.key]"
            :disabled="disabled"
          ></Item>
        </TsFormItem>
      </div>
    </div>
    <div v-else-if="!isLoading" class="text-tip lh-2">{{ $t('page.notarget', {target: $t('page.param')}) }}</div>
    <Loading v-else-if="isLoading"></Loading>
  </div>
</template>
<script>
import Item from './index';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    ...Item
  },
  filters: {},
  props: {
    value: {
      type: Object,
      default: function() {
        return {};
      }
    },
    paramList: Array,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: true,
      dataList: [],
      valueConfig: {}, //所有值对应的集合
      itemConfig: {} //所以组件对应的渲染config集合
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getParamList(); 
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getParamList() {
      this.isLoading = false;
      this.dataList = this.paramList;
      this.initConfig();
    },
    valid() {
      let isValid = true;
      this.$refs.item && this.$refs.item.forEach(item => {
        if (item.valid) {
          isValid = item.valid() ? isValid : false;
        }
      });
      return isValid;
    },
    getValue() {
      return this.valueConfig;
    },
    initConfig() { //先进行初始化，避免每次render调用方法导致子组件从新渲染
      this.itemConfig = {};
      this.valueConfig = {};
      this.dataList instanceof Array && this.dataList.forEach(data => {
        let config = this.$utils.deepClone(Object.assign({}, data.config ? data.config : data));  
        config.validateList = data.isRequired ? ['required'] : [];
        config.desc = data.description;
        if (config && config.type) {
          delete config.type;
        }
        this.$set(this.itemConfig, data.key, config);
        this.$set(this.valueConfig, data.key, this.$utils.isEmptyObj(this.value) ? data.defaultValue : this.value[data.key]);
      });
    }
  },
  computed: {
    handleType() {
      return (value) => {
        let type = value + 'Handler';
        type = Item[type] ? type : 'defaultInput';
        return type;
      };
    }
  },
  watch: {
    paramList: {
      handler() {
        this.getParamList();
      },
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
.value-div{
  .dataList {
    &:not(:last-child) {
        /deep/.value-item{
        padding-bottom: 10px;
      }
    }
  }
  /deep/.value-item{
    .ivu-tooltip-rel{
      margin-left:3px;
    }
    .ivu-tooltip{
      vertical-align: bottom;
    }
  }
  .no-padding-bottom {
    padding-bottom: 0 !important;
  }
  .empty-tip{
    margin: 0px 16px 16px;
    display: block;
  }
}
</style>
