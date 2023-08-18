<template>
  <div class="controller-group">
    <TsFormTree
      ref="fromCi"
      v-model="item.fromCi"
      v-bind="treeConfig"
      :placeholder="$t('term.cmdb.attrci')"
      @on-change="()=>{
        $set(item,'fromAttr','');
      }"
    ></TsFormTree>
    <TsFormSelect
      ref="fromAttr"
      v-model="item.fromAttr"
      :dataList="dataList"
      :validateList="validateList"
      :placeholder="$t('page.attribute')"
      transfer
    ></TsFormSelect>
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
      dataList: [
        {
          'value': '_id',
          'text': 'ID'
        },
        {
          'value': '_uuid',
          'text': 'UUID'
        },
        {
          'value': '_name',
          'text': this.$t('page.name')
        },
        {
          'value': '_fcu',
          'text': '创建人'
        },
        {
          'value': '_fcd',
          'text': '创建日期'
        },
        {
          'value': '_lcu',
          'text': '修改人'
        },
        {
          'value': '_lcd',
          'text': '修改日期'
        },
        {
          'value': '_inspectStatus',
          'text': '巡检状态'
        },
        {
          'value': '_inspectTime',
          'text': '巡检时间'
        },
        {
          'value': '_monitorStatus',
          'text': '监控状态'
        },
        {
          'value': '_monitorTime',
          'text': '监控时间'
        },
        {
          'value': '_typeId',
          'text': '模型ID'
        },
        {
          'value': '_typeName',
          'text': '模型标识'
        },
        {
          'value': '_typeLabel',
          'text': '模型名称'
        }
      ]
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
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
