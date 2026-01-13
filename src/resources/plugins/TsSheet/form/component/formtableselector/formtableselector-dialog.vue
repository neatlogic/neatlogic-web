<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
    @on-ok="save()"
  >
    <template v-slot>
      <div>
        <DataList
          ref="dataList"
          :formData="formData"
          :formItem="formItem"
          :formDataForWatch="formDataForWatch"
          :value="value"
          :mode="mode"
          :filter="filter"
          :externalData="externalData"
          :extendConfigList="extendConfigList"
          :formItemList="formItemList"
          @change="getSelectedData"
        ></DataList>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    DataList: () => import('./formtableselector-datalist.vue')
  },
  props: {
    mode: { type: String, default: 'edit' }, //表单的模式edit或read或condition,edut模式才会显示异常、联动等辅助图标
    value: { type: [Object, Array, String, Number] }, //当前表单组件的值
    formItem: { type: Object },
    filter: {type: Array},
    formItemList: { type: Array },
    formData: { type: Object },
    formDataForWatch: { type: Object },
    extendConfigList: { // 标签扩展配置列表
      type: Array,
      default: () => []
    },
    externalData: {
      // 外部数据，非表单数据，例如工单上报人数据等
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('page.data'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      selectedItemList: []
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      if (!this.$utils.isEmpty(this.value)) {
        this.selectedItemList = this.value;
      }
    },
    getSelectedData(itemList) {
      this.selectedItemList = itemList;
    },
    close() {
      this.$emit('close');
    },
    async save() {
      this.$emit('close', this.selectedItemList);
      // let errorList = await this.$refs.dataList.validData();
      // if (this.$utils.isEmpty(errorList)) {
      //   this.$emit('close', this.selectedItemList);
      // }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
