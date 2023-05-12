<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
      <template v-slot>
        <TsForm ref="form" :labelWidth="110" :item-list="formConfig">
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    phase: { type: Object },
    config: {type: Object}
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small',
        title: this.$t('page.advancedsettings')
      },
      formConfig: [
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.phase.configTemplate && this.phase.configTemplate.length > 0) {
        this.phase.configTemplate.forEach(element => {
          const formItem = {
            type: element.type,
            name: element.key,
            label: element.label,
            dataList: element.dataList,
            desc: element.description,
            validateList: element.isRequired ? ['required'] : []
          };
          if (this.config && this.config?.phaseConfig[this.phase.phase]) {
            formItem.value = this.config.phaseConfig[this.phase.phase][formItem.name];
          }
          this.formConfig.push(formItem);
        });
      }
    },
    close() {
      this.$emit('close');
    },
    save() {
      const form = this.$refs['form'];
      if (form && form.valid()) {
        this.$emit('setConfig', this.phase.phase, form.getFormValue());
        this.close();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
