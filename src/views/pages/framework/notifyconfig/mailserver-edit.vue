<template>
  <div class="mailserver-edit">
    <div class="text-right">
      <Button
        type="primary"
        ghost
        class="mr-sm"
        @click="test()"
      >{{ $t('term.framework.emailtest') }}</Button>
      <Button type="primary" @click="submit()">{{ $t('page.save') }}</Button>
    </div>
    <div slot="content" class="content border-color">
      <div class="form">
        <TsForm ref="form" :itemList="formData"></TsForm>
        <Button type="primary" @click="submit()">{{ $t('page.save') }}</Button>
      </div>
    </div>
    <TsDialog
      v-if="isShow"
      v-bind="setting"
      :isShow="isShow"
      :okBtnDisable="disabledTest"
      @on-close="close"
      @on-cancel="close"
      @on-ok="testSend()"
    >
      <TsForm ref="testform" v-model="testVal" :itemList="testForm"></TsForm>
    </TsDialog>    
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  props: [],
  data() {
    return {
      canBack: false,
      uuid: null,
      formData: [
        {
          type: 'text',
          name: 'uuid',
          value: null,
          defaultValue: null,
          isHidden: true,
          label: this.$t('page.primarykey')
        },
        {
          type: 'text',
          name: 'name',
          value: '',
          defaultValue: '',
          maxlength: 30,
          label: this.$t('page.name'),
          validateList: ['required', 'name-special']
        },
        {
          name: 'host',
          type: 'text',
          label: this.$t('term.framework.smtphost'),
          validateList: ['required']
        },
        {
          type: 'radio',
          name: 'sslEnable',
          label: this.$t('term.framework.smptsslenable'),
          value: '',
          defaultValue: 'false',
          dataList: [{ value: 'true', text: this.$t('page.yes')}, { value: 'false', text: this.$t('page.no')}],
          validateList: ['required']
        },
        {
          type: 'number',
          name: 'port',
          label: this.$t('term.framework.smptport'),
          value: '',
          defaultValue: '25',
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'fromAddress',
          label: this.$t('page.emailaddress'),
          value: '',
          defaultValue: '',
          validateList: ['required', 'mail']
        },
        {
          type: 'text',
          name: 'userName',
          label: this.$t('page.username'),
          value: '',
          defaultValue: '',
          validateList: ['required']
        },
        {
          type: 'password',
          name: 'password',
          label: this.$t('page.password'),
          value: '',
          defaultValue: '',
          validateList: [
            { name: 'required', message: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.password')}) }
            // {
            //   name: 'passcode',
            //   message: '请输入长度在8~20之间的字符串，至少有字母、数字、特殊字符其中2种组合'
            // }
          ]
        },
        {
          type: 'text',
          name: 'homeUrl',
          label: this.$t('page.homeurl'),
          value: '',
          defaultValue: ''
        }
      ],
      isShow: false,
      setting: {
        maskClose: true,
        title: this.$t('term.framework.emailtest')
      },
      testForm: [
        {
          type: 'text',
          name: 'emailAddress',
          label: this.$t('page.emailaddress'),
          validateList: ['required', 'mail']
        }
      ],
      testVal: {emailAddress: ''},
      disabledTest: false
    };
  },

  beforeCreate() {},

  created() {
    this.getData();
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
    submit() {
      let form = this.$refs.form;
      if (form.valid()) {
        let data = form.getFormValue();
        this.$api.framework.mailserver
          .save(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
            }
          });
      }
    },
    getData() {
      this.$api.framework.mailserver
        .get()
        .then(res => {
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
      let form = this.$refs.testform;
      if (form.valid()) {
        let data = this.testVal;
        this.disabledTest = true;
        this.$api.framework.mailserver
          .test(data)
          .then(res => {
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
      this.$set(this.testVal, 'emailAddress', '');
    }
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>
<style lang='less' scoped>
.mailserver-edit {
  .form {
    width: 40%;
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
