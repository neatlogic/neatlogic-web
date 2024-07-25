<template>
  <div>
    <TsFormItem
      :label="$t('term.process.formtag')"
      :labelPosition="labelPosition"
      :tooltip="$t('term.process.formtagtip')"
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
    labelPosition: {
      type: String,
      default: 'top'
    },
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
      formTag: '',
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
    },
    defaultFormTag(val) {
      if (!this.$utils.isSame(val, this.formTag)) {
        this.formTag = this.$utils.deepClone(val);
      }
    }
  }
};
</script>
<style lang="less">
</style>
