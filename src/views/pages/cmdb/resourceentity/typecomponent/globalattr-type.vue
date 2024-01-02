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
      v-bind="globalAttrConfig"
      :validateList="validateList"
      :placeholder="$t('page.attribute')"
      transfer
    ></TsFormSelect>
    <TsFormSelect
      ref="toAttr"
      v-model="item.toAttr"
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
        // params: {
        //   rootCiName: this.mainCi
        // },
        transfer: true,
        showPath: true,
        validateList: ['required']
      },
      globalAttrConfig: {
        url: 'api/rest/cmdb/globalattr/search',
        rootName: 'tbodyList',
        valueName: 'name',
        textName: 'label',
        params: {},
        transfer: true,
        showPath: true,
        validateList: ['required'],
        isSquare: false
      },
      validateList: ['required'],
      dataList: [
        {
          'value': 'id',
          'text': 'ID'
        },
        {
          'value': 'value',
          'text': this.$t('page.name')
        },
        {
          'value': 'sort',
          'text': this.$t('page.sort')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.item.fromCi = this.mainCi;
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
