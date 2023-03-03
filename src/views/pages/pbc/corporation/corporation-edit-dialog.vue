<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsForm ref="form" v-model="corporationData" :item-list="formConfig"></TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="save()">保存</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {id: {type: Number}},
  data() {
    return {
      dialogConfig: {
        title: this.id ? '编辑机构' : '添加机构',
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
          label: '名称',
          maxlength: 50,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'facilityOwnerAgency',
          label: '金融机构编码',
          placeholder: '参照中国人民银行发布的《金融机构编码规范》中定义的14位编码',
          maxlength: 14,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'loginUrl',
          label: '认证地址',
          validateList: ['required', 'url']
        },
        {
          type: 'text',
          name: 'reportUrl',
          label: '上报数据地址',
          validateList: ['required', 'url']
        },
        {
          type: 'text',
          name: 'validUrl',
          label: '申请检核地址',
          validateList: ['required', 'url']
        },
        {
          type: 'text',
          name: 'validResultUrl',
          label: '查询检核结果地址',
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
          label: '认证类型',
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'clientId',
          label: '客户端id',
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'clientSecret',
          label: '客户端密码',
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
            this.$Message.success(this.$t('message.content.savesuccess'));
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
