<template>
  <div>
    <Loading
      v-if="loadingShow"
      :loadingShow="loadingShow"
    ></Loading>
    <TsForm
      v-else
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
    this.itemList = this.formConfig || [];
    this.formData = {};
    this.itemList.forEach((v) => {
      if (!this.$utils.isEmpty(v) && !this.$utils.isEmpty(v['name'])) {
        this.formData[v['name']] = null;
      }
    });
    if (!this.$utils.isEmpty(this.value)) {
      this.formData = Object.assign(this.formData, this.value);
    }
    this.loadingShow = false;
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
            border: 'border'
          }));
        } else {
          this.itemList = [];
        }
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
