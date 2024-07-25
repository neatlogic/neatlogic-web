<template>
  <div>
    <TsFormItem
      label="表单标签"
      labelPosition="top"
      tooltip="当标签为空时：表单组件为主场景的所有表单组件；当标签不为空时：表单组件为所选标签配置的表单组件。"
    >
      <TsFormSelect
        v-model="formTag"
        :dataList="formTagList"
        border="border"
        transfer
        @on-change="(val)=>$emit('updateFormTag', val)"
      ></TsFormSelect>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    formUuid: {
      type: String,
      default: ''
    },
    defaultFormTag: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      formTag: this.defaultFormTag,
      formTagList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getFormTagList();
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
    getFormTagList() {
      this.formTagList = [];
      if (this.formUuid) {
        this.$api.framework.form.getFormTagList({formUuid: this.formUuid}).then(res => {
          if (res.Return) {
            let tbodyList = res.Return.tbodyList || [];
            if (!this.$utils.isEmpty(tbodyList)) {
              this.formTagList = tbodyList.map(item => {
                return {
                  text: item,
                  value: item
                };
              });
            }
            if (this.formTag && !this.formTagList.find(item => item.value === this.formTag)) {
              this.formTag = '';
              this.$emit('updateFormTag', this.formTag);
            }
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    formUuid(val) {
      this.getFormTagList();
    }
  }
};
</script>
<style lang="less">
</style>
