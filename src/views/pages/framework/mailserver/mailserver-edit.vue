<template>
  <div class="mailserver-edit">
    <TsContain>
      <template v-slot:topLeft>
        <span>{{ $t('dialog.title.edittarget',{'target':$t('page.server')}) }}</span>
        <!-- <div class="action-group">
          <template v-if="canBack || !uuid">
            <span class="action-item tsfont-left" @click="goback()">邮件服务器管理</span>
          </template>
          <template v-else>
            <span class="action-item disable tsfont-left">邮件服务器管理</span>
          </template>
          <template v-if="uuid">
            <span class="block-item">
              编辑服务器
            </span>
          </template>
          <template v-else>
            <span class="block-item">
              新建服务器
            </span>
          </template>
        </div> -->
      </template>
      <template v-slot:topRight>
        <div>
          <Button
            type="primary"
            ghost
            class="mr-sm"
            @click="test()"
          >{{ $t('term.framework.emailtest') }}</Button>
          <Button type="primary" @click="submit()">{{ $t('page.save') }}</Button>
        </div>
      </template>
      <div slot="content" class="content border-color">
        <div class="form">
          <TsForm ref="form" :itemList="formData"></TsForm>
          <Button type="primary" @click="submit()">{{ $t('page.save') }}</Button>
        </div>
      </div>
    </TsContain>
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
          label: this.$t('使用SSL'),
          value: '',
          defaultValue: 'false',
          dataList: [{ value: 'true', text: '是'}, { value: 'false', text: '否'}],
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
          name: 'domain',
          label: this.$t('page.domain'),
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
    // this.uuid = this.$route.query.uuid || null;
    // if (this.uuid) {
    //   this.getRowData();
    // }
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
    goback() {
      this.$router.push({
        path: 'mailserver-manage'
      });
    },
    submit() {
      let form = this.$refs.form;
      if (form.valid()) {
        let data = form.getFormValue();
        this.$api.framework.mailserver
          .save(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              // this.goback();
            }
          });
      }
    },
    getRowData() {
      let params = {
        uuid: this.uuid,
        timestamp: new Date().getTime()
      };
      this.$api.framework.mailserver
        .get(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.formData.forEach(item => {
              item.value = res.Return[item.name];
              this.canBack = true;
            });
          }
        });
    },
    getData() {
      const data = {};
      this.$api.framework.mailserver
        .search(data)
        .then(res => {
          if (res.Status == 'OK') {
            const obj = res.Return.tbodyList[0];
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
