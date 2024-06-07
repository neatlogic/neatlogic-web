<template>
  <div>
    <TsForm
      v-model="formValue"
      :item-list="formConfig"
      :class="type"
    >
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {item: Object, type: String},
  data() {
    return {
      formValue: {
        checkboxName: ['name'],
        radioName: 'name'
      },
      formConfig: {
        checkboxName: {
          type: 'checkbox',
          label: this.$t('page.multipleselection') + '(' + this.$t('page.disable') + ')',
          labelWidth: 160,
          disabled: true,
          dataList: [
            {
              text: 'name',
              value: 'name'
            }
          ]
        },
        radioName: {
          type: 'radio',
          label: this.$t('page.singleoption') + '(' + this.$t('page.disable') + ')',
          labelWidth: 160,
          disabled: true,
          dataList: [
            {
              text: 'name',
              value: 'name'
            }
          ]
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init(this.item.value);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init(val) {
      if (this.type === 'light') {
        document.body.style.setProperty('--light-form-disabled', val);
      } else {
        document.body.style.setProperty('--dark-form-disabled', val);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    'item.value': {
      handler(val) {
        this.init(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.dark{
   /deep/ .ivu-checkbox-disabled,.ivu-checkbox-wrapper-disabled {
    &.ivu-checkbox-checked {
      .ivu-checkbox-inner {
        background-color: var(--dark-form-disabled, #0D4E5D);
        border-color: var(--dark-form-disabled, #0D4E5D);
      }
    }
  }
  /deep/ .ivu-radio-disabled,.ivu-radio-wrapper-disabled {
      &.ivu-radio-checked {
        .ivu-radio-inner {
          background-color: var(--dark-form-disabled, #0D4E5D);
          border-color: var(--dark-form-disabled, #0D4E5D);
        }
      }
    }
}
.light{
  /deep/ .ivu-checkbox-disabled,.ivu-checkbox-wrapper-disabled {
    &.ivu-checkbox-checked {
      .ivu-checkbox-inner {
        background-color: var(--light-form-disabled, #96BEF8);
        border-color: var(--light-form-disabled, #96BEF8);
      }
    }
  }
   /deep/ .ivu-radio-disabled,.ivu-radio-wrapper-disabled {
      &.ivu-radio-checked {
        .ivu-radio-inner {
          background-color: var(--light-form-disabled, #96BEF8) !important;
          border-color: var(--light-form-disabled, #96BEF8) !important;
        }
      }
    }
}
</style>
