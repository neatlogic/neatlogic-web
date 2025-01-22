<template>
  <div>
    <Loading :loadingShow="loadingShow"></Loading>
    <TsForm
      v-if="!loadingShow && itemList.length > 0"
      ref="form"
      v-model="formData"
      :labelWidth="79"
      labelPosition="left"
      :item-list="itemList"
    >
      <template v-for="(item, index) in currentFormitemList" v-slot:[item.name]>
        <TsFormSelect
          :key="index"
          ref="item"
          v-bind="item"
          v-model="formData[item.name]"
          :dataList="allFormitemList"
          :firstSelect="false"
          textName="label"
          valueName="uuid"
          border="border"
          transfer
        ></TsFormSelect>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    formConfig: {
      type: Array,
      default: () => ([])
    },
    value: {
      type: Object,
      default: () => ({})
    },
    prevNodes: {
      type: Array,
      default: () => ([])
    },
    readonly: {
      type: Boolean,
      default: false
    },
    allFormitemList: { // 所有表单组件列表，用于下拉选择
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {},
      itemList: [],
      loadingShow: true,
      currentFormitemList: []
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
      this.formData = {};
      this.initItem();
      if (!this.$utils.isEmpty(this.value)) {
        Object.assign(this.formData, this.value);
      }
      this.getPrevNodes();
      this.loadingShow = false;
    },
    initItem() {
      this.itemList = this.$utils.deepClone(this.formConfig) || [];
      this.currentFormitemList = [];
      if (this.itemList.length > 0) {
        this.itemList.forEach(v => {
          if (v.type === 'formselect') {
            // 如果是formselect，则不渲染，而是在插槽中渲染，下拉列表为流程设置选中的表单组件
            this.currentFormitemList.push(v);
            v.type = 'slot';
          }
          v.readonly = this.readonly;
          v.border = 'border';
          v.transfer = true;
        });
      }
    },
    valid() {
      let form = this.$refs.form;
      let isValid = true;
      if (form && !form.valid()) {
        isValid = false;
      }
      let itemList = this.$refs.item;
      if (itemList) {
        itemList.forEach(v => {
          if (v && v.valid && !v.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    },
    saveData() {
      return this.formData;
    },
    getPrevNodes() { // 获取前置节点
      if (this.$utils.isEmpty(this.itemList) || this.$utils.isEmpty(this.prevNodes)) {
        return;
      }
      this.itemList.forEach((v) => {
        if (!this.$utils.isEmpty(v) && !this.$utils.isEmpty(v['name'])) {
          if (v['name'] === 'preStepList' && !this.$utils.isEmpty(this.prevNodes)) {
            v.dataList = this.prevNodes.map(c => {
              return {
                text: c.name,
                value: c.uuid
              };
            });
          }
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    formConfig: {
      handler(list) {
        let itemList = list || [];
        if (!this.$utils.isEmpty(itemList)) {
          this.initItem();
        } else {
          this.itemList = [];
        }
        this.getPrevNodes();
        this.loadingShow = false;
      },
      deep: true
    },
    value: {
      handler(val) {
        this.formData = {};
        this.formData = Object.assign(this.formData, val || {});
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
