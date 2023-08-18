<template>
  <div class="controller-group">
    <TsFormTree
      ref="fromCi"
      v-model="item.fromCi"
      v-bind="treeConfig"
      :placeholder="$t('term.cmdb.fromci')"
      @on-change="changeCi(item)"
    ></TsFormTree>
    <TsFormTree
      ref="toCi"
      v-model="item.toCi"
      v-bind="treeConfig"
      :placeholder="$t('term.cmdb.toci')"
      @on-change="changeCi(item)"
    ></TsFormTree>
    <TsFormSelect
      v-if="item.fromCi && item.toCi"
      ref="direction"
      v-model="item.direction"
      :dataList="directionList"
      :validateList="validateList"
      :placeholder="$t('term.cmdb.attrci')"
      transfer
      @on-change="()=>{
        $set(item,'fromAttr','');
        $set(item,'toAttr','');
      }"
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
          text: this.$t('term.cmdb.fromci'),
          value: 'from'
        },
        {
          text: this.$t('term.cmdb.toci'),
          value: 'to'
        }
      ],
      attrConfig: {
        url: '/api/rest/cmdb/ci/listattr',
        validateList: ['required'],
        valueName: 'name',
        textName: 'label',
        placeholder: this.$t('page.attribute'),
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
    changeCi(item) {
      this.$set(item, 'direction', '');
      this.$set(item, 'fromAttr', '');
      this.$set(item, 'toAttr', '');
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
