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
    item: Object,
    mainCi: String
  },
  data() {
    return {
      treeConfig: {
        url: 'api/rest/cmdb/ci/listtree',
        valueName: 'name',
        textName: 'label',
        params: {
          rootCiName: this.mainCi
        },
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
          'text': this.$t('page.creator')
        },
        {
          'value': '_fcd',
          'text': this.$t('page.createdate')
        },
        {
          'value': '_lcu',
          'text': this.$t('page.fcu')
        },
        {
          'value': '_lcd',
          'text': this.$t('page.lcu')
        },
        {
          'value': '_inspectStatus',
          'text': this.$t('term.autoexec.inspectstatus')
        },
        {
          'value': '_inspectTime',
          'text': this.$t('term.cmdb.inspectime')
        },
        {
          'value': '_monitorStatus',
          'text': this.$t('term.inspect.monitoringstate')
        },
        {
          'value': '_monitorTime',
          'text': this.$t('term.cmdb.monitortime')
        },
        {
          'value': '_typeId',
          'text': this.$t('page.model') + 'ID'
        },
        {
          'value': '_typeName',
          'text': this.$t('term.cmdb.modelkey')
        },
        {
          'value': '_typeLabel',
          'text': this.$t('term.cmdb.modelname')
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
