<template>
  <div>
    <TsForm ref="form" :item-list="formConfig"></TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    config: { type: Object }
  },
  data() {
    return {
      formConfig: {
        groupList: {
          type: 'checkbox',
          label: this.$t('term.framework.optionalrange'),
          validateList: ['required'],
          value: this.config.groupList,
          dataList: [
            { value: 'common', text: this.$t('page.public') },
            { value: 'user', text: this.$t('page.user') },
            { value: 'team', text: this.$t('page.group') },
            { value: 'role', text: this.$t('page.role') }
          ],
          onChange: val => {
            this.$set(this.config, 'groupList', val);
          }
        },
        isMultiple: {
          type: 'radio',
          value: this.config.isMultiple,
          dataList: [{value: 1, text: this.$t('page.yes')}, {value: 0, text: this.$t('page.no')}],
          validateList: ['required'],
          label: this.$t('page.multipleselection'),
          onChange: val => {
            this.$set(this.config, 'isMultiple', val);
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
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
      return this.$refs['form'].valid();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
