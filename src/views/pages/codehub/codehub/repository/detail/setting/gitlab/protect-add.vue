<template>
  <TsDialog
    v-bind="setting"
    @on-close="close"
    @on-ok="saveEdit"
  >
    <div>
      <TsForm
        ref="form"
        v-model="formValue"
        :itemList="formConfig"
        :labelWidth="180"
      >
      </TsForm>
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  filters: {},
  props: {
    id: Number
  },
  data() {
    return {
      formValue: {},
      setting: {
        title: this.$t('term.codehub.addprotectbranch'),
        maskClose: false,
        width: 'small',
        isShow: true
      },
      formConfig: [
        {
          type: 'select',
          label: this.$t('page.branch'),
          name: 'name',
          validateList: ['required'],
          dynamicUrl: '/api/rest/codehub/repository/gitlab/searchBranches',
          params: {
            repositoryId: this.id
          },
          rootName: 'list',
          textName: 'name',
          valueName: 'name',
          allowCreate: true,
          transfer: true
        }, {
          type: 'select',
          label: 'developers_can_merge',
          name: 'developers_can_merge',
          validateList: ['required'],
          dataList: [{
            value: true,
            text: this.$t('page.yes')
          }, {
            value: false,
            text: this.$t('page.no')       
          }],
          transfer: true       
        }, {
          type: 'select',
          label: 'developers_can_push',
          name: 'developers_can_push',
          validateList: ['required'],
          dataList: [{
            value: true,
            text: this.$t('page.yes')
          }, {
            value: false,
            text: this.$t('page.no')          
          }],
          transfer: true               
        }
      ]
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
    saveEdit() {
      if (this.$refs.form.valid()) { 
        let param = {
          ...this.formValue,
          repositoryId: this.id,
          method: 'protectBranch'
        };
        this.$api.codehub.repositorydetail.saveGitProtect(param).then(res => {
          if (res && res.Status == 'OK') {
            this.$emit('close', true);
          }
        });
      }
    },
    close() {
      this.$emit('close');
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less'>
</style>
