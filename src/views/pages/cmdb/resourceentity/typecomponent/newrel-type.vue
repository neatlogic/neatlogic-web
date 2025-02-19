<template>
  <div class="controller-group">
    <TsFormTree
      ref="fromCi"
      v-model="item.uuid"
      v-bind="getTreeConfig(list)"
      :placeholder="$t('page.model')"
      @on-change="(val, selectItem)=>{
        changeCi(selectItem, item);
      }"
    ></TsFormTree>
    <template v-if="item.ciName">
      <TsFormSelect
        ref="fromAttr"
        v-model="item.attr"
        v-bind="getAttrConfig(item.ciName)"
        :placeholder="$t('page.attribute')"
      ></TsFormSelect>
    </template>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree')
  },
  props: {
    item: Object,
    mainCi: String,
    ciList: Array
  },
  data() {
    return {
      list: []
    };
  },
  beforeCreate() {},
  created() {
    if (!this.item.fromCi) {
      this.item.fromCi = this.mainCi;
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
    changeCi(selectObj, item) {
      this.$set(item, 'ciName', selectObj.ciName || '');
      this.$set(item, 'ciLabel', selectObj.ciLabel || '');
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
    getTreeConfig() {
      return (list) => {
        return {
          dataList: list || [],
          valueName: 'uuid',
          textName: 'ciLabel',
          transfer: true,
          showPath: true,
          validateList: ['required']
        };
      };
    },
    getAttrConfig() {
      return (val) => {
        return {
          url: '/api/rest/cmdb/ci/listattr/forview',
          validateList: ['required'],
          valueName: 'name',
          textName: 'label',
          params: {
            ciName: val
          },
          transfer: true
        };
      };
    }
  },
  watch: {
    ciList: {
      handler(val) {
        this.list = this.$utils.deepClone(val) || [];
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
