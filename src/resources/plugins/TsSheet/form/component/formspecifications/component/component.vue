<template>
  <div>
    <component
      :is="componentName"
      ref="form"
      v-model="currentValue"
      v-bind="componentConfig"
      :dealDataByUrl="handleDealDataByUrl"
      @change="(val, item, list) => $emit('change', val, item, list)"
      @on-focus="$emit('on-focus')"
    ></component>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      //默认值
      type: [String, Number, Array, Object]
    }, //默认值
    type: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => {}
    },
    allFormValue: {
      // 表格的所有值
      type: Array,
      default: () => []
    },
    rowKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
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
    validData() {
      return this.$refs.form ? this.$refs.form.valid() : true;
    },
    handleDealDataByUrl(nodeList) {
      // 禁用已经选中的值
      let columnListValue = [];
      this.allFormValue && this.allFormValue.forEach((item) => {
        for (let key in item) {
          if (key == this.rowKey && !this.$utils.isEmpty(item[key]) && key == 'configurationName') {
            columnListValue.push(item[key]);
          }
        }
      });
      nodeList.forEach((item) => {
        this.$set(item, '_disabled', false);
        if (columnListValue.includes(item.value)) {
          this.$set(item, '_disabled', true);
        }
      });
      return nodeList;
    }
   
  },
  filter: {},
  computed: {
    componentName() {
      if (this.config && this.config.type == 'text') {
        return 'TsFormInput';
      } else if (this.config && this.config.type == 'select') {
        return 'TsFormSelect';
      } else {
        return 'TsFormInput';
      }
    },
    componentConfig() {
      let config = this.$utils.deepClone(this.config) || {};
      delete config.type;
      return config;
    }
  },
  watch: {
    value: {
      handler(val) {
        this.currentValue = val;
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
