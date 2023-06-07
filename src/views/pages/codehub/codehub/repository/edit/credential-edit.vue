<template>
  <div>
    <TsForm ref="editform" :itemList="formConfig" :labelWidth="90">
      <template slot="repoType">
        <TsFormInput
          :value="setTypeText(editConfig.repoType, typeDataList)"
          width="75%"
          disabled
          @on-change="updateConfig"
        />
      </template>
      <template slot="repoCredential">
        <TsFormInput
          v-model.trim="editConfig.repoCredential"
          width="75%"
          :validateList="validateList"
          :type="editConfig.credType =='password'?'password':'text'"
        ></TsFormInput>
      </template>
      <template slot="repoCredential-label">
        {{ editConfig.credType =='password'?$t('page.password'):'token' }}
      </template>
    </TsForm>
    <div class="edit-btn">
      <Button type="primary" :disabled="saving" @click="saveEdit">{{ $t('page.save') }}</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    credentialData: {
      type: Object,
      default: () => {
        return {};
      } 
    }
  },
  data() {
    return {
      typeDataList: [
        {
          text: 'GITLAB',
          value: 'gitlab'
        },
        {
          text: 'SVN',
          value: 'svn'
        }
      ],
      editConfig: {
        repoType: 'gitlab',
        credType: 'password',
        repoUsername: null,
        repoCredential: null
      },
      formConfig: [{
        type: 'slot',
        label: this.$t('term.deploy.warehousetype'),
        width: '75%',
        name: 'repoType',
        dataList: [{
          text: 'GITLAB',
          value: 'gitlab'
        }, {
          text: 'SVN',
          value: 'svn'          
        }]     
      },
      {
        type: 'radio',
        label: this.$t('term.codehub.vouchertype'),
        name: 'credType',
        width: '75%',
        isHidden: true,
        value: 'password',
        dataList: [{
          text: this.$t('page.password'),
          value: 'password'
        }, {
          text: 'token',
          value: 'token'          
        }],
        onChange: (val) => {
          this.editConfig.credType = val;
          this.updateTypeConfig(val);
        }
      },
      {
        type: 'text',
        label: this.$t('page.username'),
        width: '75%',
        name: 'repoUsername',
        isHidden: true,
        validateList: ['required'],
        onChange: (val) => {
          this.editConfig.repoUsername = val;
        }
      },
      {
        type: 'slot',
        label: this.$t('page.password'),
        width: '75%',
        isHidden: true,
        name: 'repoCredential',
        validateList: ['required']
      }],
      validateList: ['required'],
      saving: false//保存中时不可以再调保存的接口
    };
  },
  beforeCreate() {},
  created() {
    this.initData();
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
    initData() {
      if (!this.$utils.isEmpty(this.credentialData)) {
        Object.assign(this.editConfig, {
          repoType: this.credentialData.repoType || 'gitlab',
          credType: this.credentialData.credType || 'password',
          repoUsername: this.credentialData.repoUsername || null,
          repoCredential: this.credentialData.repoCredential || null          
        });
      }
    },
    saveEdit() {
      if (this.$refs.editform.valid()) {
        let param = {
          repoType: this.editConfig.repoType,
          credType: this.editConfig.credType,
          repoUsername: null,
          repoCredential: this.editConfig.repoCredential        
        };
        if (this.editConfig.credType == 'password') {
          Object.assign(param, {
            repoUsername: this.editConfig.repoUsername
          });
        }
        this.saving = true;
        this.$api.codehub.credential.save(param).then((res) => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          }
        }).finally(() => {
          this.saving = false;
        });
      }
    },
    updateConfig(type) {
      //根据仓库类型更新下面的选项值（svn的通过用户名密码认证，gitlab的可以通过用户名密码认证，也可以通过token）
      this.setFormValue('credType', 'password');
      this.setFormValue('repoUsername', '');
      this.$set(this.editConfig, 'repoCredential', '');
    },
    updateTypeConfig(type) {
      this.setFormValue('repoUsername');
      this.setFormValue('repoCredential');
    },
    updateConfigByStatus(type) {
      //根据仓库类型更新下面的选项是否可见（svn的通过用户名密码认证，gitlab的可以通过用户名密码认证，也可以通过token）
      this.hideFormItem(['repoUsername', 'repoCredential'], false);
      if (type == 'svn') {
        this.hideFormItem('credType', true);
      } else {
        this.hideFormItem('credType', false);
      }
    },
    updateTypeConfigByStatus(type) {
      this.setFormValue('credType', type);
      if (type == 'token') {
        this.hideFormItem('repoUsername', true);
      } else {
        this.hideFormItem('repoUsername', false);
      }
    },
    hideFormItem(key, isHide) {
      //设置表单的行是否显示,第一个参数可以为字符串或者数组
      this.formConfig.forEach((form) => {
        if (typeof key == 'string') {
          if (form.name === key) {
            this.$set(form, 'isHidden', isHide);
          }
        } else {
          if (key.includes(form.name)) {
            this.$set(form, 'isHidden', isHide);
          }          
        }
      });
    },
    setFormValue(key, value) {
      //设置表单的值,不传值默认置空
      this.formConfig.forEach((form) => {
        if (form.name === key) {
          this.$set(form, 'value', value || '');
        }
      });
      this.$set(this.editConfig, key, value || '');
    }

  },
  filter: {},
  computed: {
    setTypeText() {
      return function(type, list) {
        let str = '';
        list.forEach(t => {
          if (t.value == type) {
            str = t.text;
          }
        });
        return str;
      };
    }
  },
  watch: {
    'editConfig.repoType': {
      handler(val) {
        this.updateConfigByStatus(val);
      },
      immediate: true
    },
    'editConfig.credType': {
      handler(val) {
        this.updateTypeConfigByStatus(val);
      },
      immediate: true
    },
    'editConfig.repoUsername': {
      handler(val) {
        this.setFormValue('repoUsername', val);
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
/deep/.ivu-form-item-label{
  span{
      width: 60px;
      display: inline-block;
      text-align-last: justify;
      text-align: justify;
      text-justify: distribute-all-lines;    
  }
}
.edit-btn{
  width: 75%;
  text-align: right;
  margin-left: 25px;
  margin-top: 16px;
}
</style>
