<template>
  <div class="controller-group">
    <TsFormTree
      ref="fromCi"
      v-model="item.fromCi"
      v-bind="treeConfig"
      placeholder="上游模型"
    ></TsFormTree>
    <TsFormTree
      ref="toCi"
      v-model="item.toCi"
      v-bind="treeConfig"
      placeholder="上游模型"
    ></TsFormTree>
    <TsFormSelect
      v-if="item.fromCi && item.toCi"
      ref="direction"
      v-model="item.direction"
      :dataList="directionList"
      :validateList="validateList"
      placeholder="字段所在模型"
      transfer
    ></TsFormSelect>
    <template v-if="item.direction">
      <TsFormSelect
        v-if="item.direction === 'to'"
        ref="toAttr"
        v-model="item.toAttr"
        v-bind="attrConfig"
        :params="getParams(item.toCi)"
      ></TsFormSelect>
      <TsFormSelect
        v-else
        ref="fromAttr"
        v-model="item.fromAttr"
        v-bind="attrConfig"
        :params="getParams(item.fromCi)"
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
      validateList: ['required'],
      directionList: [
        {
          text: '上游模型',
          value: 'from'
        },
        {
          text: '下游模型',
          value: 'to'
        }
      ],
      attrConfig: {
        url: '/api/rest/cmdb/ci/listattr',
        validateList: ['required'],
        valueName: 'name',
        textName: 'label',
        placeholder: '属性',
        transfer: true
      }
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
