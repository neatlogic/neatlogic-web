<template>
  <div>
    <div>
      <div style="width:50%">
        <TsForm ref="form" :itemList="formData"></TsForm>
        <div class="mt-md" style="text-align: right">
          <Button
            type="primary"
            ghost
            class="mr-md"
            @click="test()"
          >{{ $t('page.test') }}</Button>
          <Button type="primary" @click="submit()">{{ $t('page.save') }}</Button>
        </div>
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue')
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
          label: this.$t('term.framework.corpid'),
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'corpSecret',
          value: null,
          defaultValue: null,
          label: this.$t('term.framework.corpsecret'),
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'agentId',
          value: null,
          defaultValue: null,
          label: this.$t('term.framework.agentid'),
          validateList: ['required']
        }
      ],
      isShow: false,
      testForm: [
        {
          type: 'text',
          name: 'toUser',
          label: this.$t('page.user'),
          desc: this.$t('message.framework.editwechattouser'),
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
      let form = this.$refs.form;
      if (form.valid()) {
        this.isShow = true;
      }
    },
    testSend() {
      let form = this.$refs.form;
      let params = form.getFormValue();
      let testForm = this.$refs.testForm;
      if (testForm.valid()) {
        this.$set(params, 'toUser', this.testVal.toUser);
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
