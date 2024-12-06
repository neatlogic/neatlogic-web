<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="close()"
      @on-ok="save()"
    >
      <template v-slot>
        <div>
          <Alert type="warning" show-icon>{{ $t('page.uniquenotedit') }}</Alert>
          <TsFormItem :label="$t('page.uniquekey')" required>
            <TsFormInput
              ref="itemKey"
              v-model="value"
              v-bind="formItemConfig"
            ></TsFormInput>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    formItemList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.$t('page.setting')
      },
      value: '',
      formItemConfig: {
        validateList: [
          'required',
          {
            name: 'regex',
            trigger: 'change',
            pattern: /^[A-Za-z\d_]+$/,
            message: this.$t('message.plugin.enName')
          },
          {
            name: 'custom',
            trigger: 'change',
            message: this.$t('message.cannotrepeat', {'target': this.$t('page.uniquekey')}),
            validator: (rule, val) => {
              if (!this.$utils.isEmpty(this.formItemList)) {
                return !this.formItemList.find(item => item.key === val);
              }
              return true;
            }
          }
        ],
        border: 'border'
      }
    };
  },
  beforeCreate() {},
  created() {
    
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
    close() {
      this.$emit('close');
    },
    save() {
      if (this.$refs.itemKey.valid()) {
        this.$emit('close', this.value);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
