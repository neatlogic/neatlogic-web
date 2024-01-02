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
      :isSquare="false"
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
          'text': this.$t('page.type') + 'ID'
        },
        {
          'value': '_typeName',
          'text': this.$t('term.codehub.typename')
        },
        {
          'value': '_typeLabel',
          'text': this.$t('page.type') + 'Label'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.item.fromCi = this.mainCi;
    if (this.item.field == 'id') {
      this.item.fromAttr = '_id';
    } else if (this.item.field == 'name') {
      this.item.fromAttr = '_name';
    } else if (this.item.field == 'type_id') {
      this.item.fromAttr = '_typeId';
    } else if (this.item.field == 'type_name') {
      this.item.fromAttr = '_typeName';
    } else if (this.item.field == 'type_label') {
      this.item.fromAttr = '_typeLabel';
    } else if (this.item.field == 'fcu') {
      this.item.fromAttr = '_fcu';
    } else if (this.item.field == 'fcd') {
      this.item.fromAttr = '_fcd';
    } else if (this.item.field == 'lcu') {
      this.item.fromAttr = '_lcu';
    } else if (this.item.field == 'lcd') {
      this.item.fromAttr = '_lcd';
    } else if (this.item.field == 'inspect_status') {
      this.item.fromAttr = '_inspectStatus';
    } else if (this.item.field == 'inspect_time') {
      this.item.fromAttr = '_inspectTime';
    } else if (this.item.field == 'monitor_status') {
      this.item.fromAttr = '_monitorStatus';
    } else if (this.item.field == 'monitor_time') {
      this.item.fromAttr = '_monitorTime';
    }
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
