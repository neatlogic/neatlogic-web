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
    ></TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
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
    }
  },
  data() {
    return {
      formData: {},
      itemList: [],
      loadingShow: true
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
      this.itemList = this.formConfig || [];
      this.formData = {};
      if (!this.$utils.isEmpty(this.value)) {
        Object.assign(this.formData, this.value);
      }
      this.getPrevNodes();
      this.loadingShow = false;
    },
    valid() {
      let form = this.$refs.form;
      let isValid = true;
      if (form && !form.valid()) {
        isValid = false;
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
          this.itemList = itemList.map((v) => ({
            ...v,
            readonly: this.readonly,
            border: 'border',
            transfer: true
          }));
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
