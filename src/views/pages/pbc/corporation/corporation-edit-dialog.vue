<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsForm ref="form" v-model="corporationData" :item-list="formConfig"></TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.save') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {id: {type: Number}},
  data() {
    return {
      dialogConfig: {
        title: this.id ? this.$t('term.pbc.editorganization') : this.$t('term.pbc.addorganization'),
        type: 'modal',
        width: 'medium',
        maskClose: false,
        isShow: true
      },
      corporationData: {},
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'facilityOwnerAgency',
          label: this.$t('term.pbc.financialorganizationcode'),
          placeholder: this.$t('term.pbc.codedescribe'),
          maxlength: 14,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'loginUrl',
          label: this.$t('term.pbc.loginurl'),
          validateList: ['required', 'url']
        },
        {
          type: 'text',
          name: 'reportUrl',
          label: this.$t('term.pbc.reporturl'),
          validateList: ['required', 'url']
        },
        {
          type: 'text',
          name: 'validUrl',
          label: this.$t('term.pbc.validurl'),
          validateList: ['required', 'url']
        },
        {
          type: 'text',
          name: 'selectDataUrl',
          label: this.$t('term.pbc.selectdataurl'),
          validateList: ['required', 'url']
        },
        {
          type: 'text',
          name: 'validResultUrl',
          label: this.$t('term.pbc.validresulturl'),
          validateList: ['required', 'url']
        },
        /*{
          type: 'text',
          name: 'importUrl',
          label: '入库申请地址',
          validateList: ['required', 'url']
        },*/
        {
          type: 'text',
          name: 'authType',
          label: this.$t('term.pbc.authtype'),
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'clientId',
          label: this.$t('term.pbc.clientid'),
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'clientSecret',
          label: this.$t('term.pbc.clientpassword'),
          validateList: ['required']
        }
        /*{
          type: 'number',
          name: 'pollCount',
          label: '轮询次数',
          validateList: ['required']
        },
        {
          type: 'number',
          name: 'pollInterval',
          label: '轮询间隔',
          desc: '单位：分钟',
          validateList: ['required']
        }*/
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.id) {
      this.getCorporation();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    getCorporation() {
      this.$api.pbc.corporation.getCorporation(this.id).then(res => {
        this.corporationData = res.Return.config;
        this.$set(this.corporationData, 'name', res.Return.name);
        this.$set(this.corporationData, 'id', res.Return.id);
      });
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.corporationData = form.getFormValue();
        this.$api.pbc.corporation.saveCorporation(this.corporationData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
