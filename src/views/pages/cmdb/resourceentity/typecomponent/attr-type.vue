<template>
  <div class="controller-group">
    <TsFormTree
      ref="fromCi"
      v-model="item.fromCi"
      v-bind="treeConfig"
      placeholder="字段所在模型"
      @on-change="changeFromCi()"
    ></TsFormTree>
    <template v-if="item.fromCi">
      <TsFormSelect
        ref="fromAttr"
        v-model="item.fromAttr"
        v-bind="attrConfig"
        placeholder="属性"
        :params="getParams(item.fromCi)"
        @on-change="(val, config, selectItem)=>{changeFromAttr(selectItem, item)}"
      ></TsFormSelect>
      <TsFormSelect
        v-if="item.toCi"
        ref="toAttr"
        v-model="item.toAttr"
        v-bind="attrConfig"
        placeholder="映射属性"
        :params="getParams(item.toCi)"
        transfer
      ></TsFormSelect>
    </template>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve)
  },
  props: {
    item: Object
  },
  data() {
    return {
      treeConfig: {
        url: 'api/rest/cmdb/ci/listtree',
        valueName: 'name',
        textName: 'label',
        transfer: true,
        showPath: true,
        validateList: ['required']
      },
      attrConfig: {
        url: '/api/rest/cmdb/ci/listattr',
        validateList: ['required'],
        valueName: 'name',
        textName: 'label',
        transfer: true
      },
      validateList: ['required']
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
    changeFromCi() {
      this.$set(item, 'fromAttr', '');
      this.$set(item, 'toCi', '');
    },
    changeFromAttr(config, item) {
      if (config && config.targetCiName) {
        this.$set(item, 'toCi', config.targetCiName);
      } else {
        this.$set(item, 'toCi', '');
      }
    },
    setConfig(val, attr) {
      this.$emit('change', val, attr);
    },
    valid() {
      let isValid = true;
      let list = this.$refs;
      Object.keys(list).forEach(key => {
        if (this.$refs[key] && !this.$refs[key].valid()) {
          isValid = false;
        }
      });
      return isValid;
    }
  },
  filter: {},
  computed: {
    getParams() {
      return (val) => {
        return {
          ciName: val
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
