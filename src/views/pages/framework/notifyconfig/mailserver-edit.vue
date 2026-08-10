<template>
  <div>
    <TsDialog v-bind="editDialogSetting" @on-close="close">
      <div>
        <TsForm ref="form" :itemList="formData"></TsForm>
      </div>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button
          type="primary"
          ghost
          class="mr-md"
          @click="test()"
        >{{ $t('page.test') }}</Button>
        <Button type="primary" @click="submit()">{{ $t('page.save') }}</Button>
      </template>
    </TsDialog>
    <TsDialog
      v-if="isShow"
      v-bind="setting"
      :isShow="isShow"
      @on-close="closeTest"
      @on-cancel="closeTest"
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue')
  },
  props: {
    id: {
      type: Number
    }
  },
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
          dataList: [
            { value: 'true', text: this.$t('page.yes') },
            { value: 'false', text: this.$t('page.no') }
          ],
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
          defaultValue: ''
        },
        {
          type: 'password',
          name: 'password',
          label: this.$t('page.password'),
          value: '',
          defaultValue: ''
        },
        {
          type: 'text',
          name: 'homeUrl',
          label: this.$t('page.homeurl'),
          value: '',
          defaultValue: ''
        }
      ],
      editDialogSetting: {
        type: 'modal',
        isShow: true,
        width: 'small',
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('page.mailserver') }) : this.$t('dialog.title.addtarget', { target: this.$t('page.mailserver') })
      },
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
      testVal: { emailAddress: '' },
      disabledTest: false
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.getData();
    }
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
        data.id = this.id;
        this.$api.framework.mailserver.save(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    getData() {
      this.$api.framework.mailserver.get({ id: this.id }).then(res => {
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
      let data = form.getFormValue();
      let testForm = this.$refs.testform;
      if (testForm.valid()) {
        this.$set(data, 'emailAddress', this.testVal.emailAddress);
        this.disabledTest = true;
        this.$api.framework.mailserver.test(data)
          .then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('page.sendsucceed'));
            }
          })
          .finally(() => {
            this.isShow = false;
            this.disabledTest = false;
          });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    closeTest() {
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
<style lang="less" scoped>
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
