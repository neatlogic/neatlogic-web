<template>
  <TsDialog
    v-bind="setting"
    @on-close="close"
    @on-ok="saveEdit"
  >
    <div>
      <TsForm ref="editform" :itemList="formConfig" :labelWidth="180">
      </TsForm>
    </div>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :disabled="isSubmit" @click="saveEdit">{{ $t('page.confirm') }}</Button>
      </div>
    </template>
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
      split: 0.3,
      setting: {
        title: this.$t('term.codehub.addprotectbranch'),
        maskClose: false,
        width: 'small',
        isShow: true
      },
      isSubmit: false, //是否提交中，需要禁用调提交按钮
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
      if (this.$refs.editform.valid()) { 
        let param = this.$refs.editform.getFormValue(); 
        Object.assign(param, {
          repositoryId: this.id,
          method: 'protectBranch'
        });   
        this.isSubmit = true;
        this.$api.codehub.repositorydetail.saveGitProtect(param).then(res => {
          if (res && res.Status == 'OK') {
            this.$emit('close', true);
          }
        }).finally(res => {
          this.isSubmit = false;
        });
      }
    },
    close() {
      this.$emit('close');
    },
    setFormVal(key, val) {
      this.formConfig.forEach(f => {
        if (f.name == key) {
          Object.assign(f, {
            value: val
          });
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less'>
</style>
