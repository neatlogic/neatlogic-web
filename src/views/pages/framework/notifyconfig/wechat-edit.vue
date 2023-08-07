<template>
  <div class="wechat-edit">
    <div class="text-right">
      <Button
        type="primary"
        ghost
        class="mr-sm"
        @click="test()"
      >{{ $t('page.test') }}</Button>
      <Button type="primary" @click="submit()">{{ $t('page.save') }}</Button>
    </div>
    <div slot="content">
      <div class="form">
        <TsForm ref="form" :itemList="formData"></TsForm>
        <Button type="primary" @click="submit()">{{ $t('page.save') }}</Button>
      </div>
    </div>
    <TsDialog
      :isShow="isShow"
      :title="$t('page.test')"
      :maskClose="true"
      :okBtnDisable="disabledTest"
      @on-close="close"
      @on-cancel="close"
      @on-ok="testSend()"
    >
      <TsForm ref="testForm" v-model="testVal" :itemList="testForm"></TsForm>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  props: {},
  data() {
    return {
      formData: [
        {
          type: 'text',
          name: 'corpId',
          value: null,
          defaultValue: null,
          label: '企业ID',
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'corpSecret',
          value: null,
          defaultValue: null,
          label: '企业密钥',
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'agentId',
          value: null,
          defaultValue: null,
          label: '代理ID',
          validateList: ['required']
        }
      ],
      isShow: false,
      testForm: [
        {
          type: 'text',
          name: 'toUser',
          label: 'toUser',
          validateList: ['required']
        }
      ],
      testVal: {
        toUser: ''
      },
      disabledTest: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactvated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    submit() {
      let form = this.$refs.form;
      if (form.valid()) {
        let data = form.getFormValue();
        this.$api.framework.wechat.save(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          }
        });
      }
    },
    getData() {
      this.$api.framework.wechat.get().then(res => {
        if (res.Status == 'OK') {
          const obj = res.Return;
          if (obj) {
            this.formData.forEach(item => {
              item.value = obj[item.name];
            });
          }
        }
      }); 
    },
    test() {
      this.isShow = true;
    },
    testSend() {
      let form = this.$refs.testForm;
      if (form.valid()) {
        let params = this.testVal;
        this.disabledTest = true;
        this.$api.framework.wechat.test(params).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.refreshsuccess'));
          }
          this.disabledTest = false;
        });
      }
    },
    close() {
      this.isShow = false;
      this.disabledTest = false;
      this.$set(this.testVal, 'toUser', '');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
.wechat-edit {
  .form {
    width: 60%;
    margin: 0 auto;
    button {
      margin-left: 120px;
    }
  }
  .content {
    padding: 16px 24px;
  }
}
</style>
