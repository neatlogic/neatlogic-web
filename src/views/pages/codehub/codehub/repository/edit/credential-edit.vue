<template>
  <div class="edit-container">
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
        {{ editConfig.credType =='password'?'密码':'token' }}
      </template>
    </TsForm>
    <div class="edit-btn"><Button type="primary" :disabled="saving" @click="saveEdit">保存</Button></div>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormInput
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    item: {
      type: [Boolean, Object],
      default: false      
    },
    typeDataList: {
      type: Array
    }
  },
  data() {
    let _this = this;
    return {
      vaildConfig: ['required'],
      setting: {
        title: _this.item ? '编辑凭证' : '新增凭证',
        maskClose: false,
        width: 'medium',
        height: '250px'
      },
      editConfig: {
        repoType: 'gitlab',
        credType: 'password',
        repoUsername: null,
        repoCredential: null
      },
      formConfig: [{
        type: 'slot',
        label: '仓库类型',
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
        label: '凭证类型',
        name: 'credType',
        width: '75%',
        isHidden: true,
        value: 'password',
        dataList: [{
          text: '密码',
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
        label: '用户名',
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
        label: '密码',
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
  created() {},
  beforeMount() {},
  mounted() {

  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
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
          this.saving = false;
          if (res && res.Status == 'OK') {
            this.$Message.success('保存成功');
            this.$emit('close', true);
          }
        }).catch((e) => {
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
      handler: function(val) {
        this.updateConfigByStatus(val);
      },
      immediate: true
    },
    'editConfig.credType': {
      handler: function(val) {
        this.updateTypeConfigByStatus(val);
      },
      immediate: true
    },
    'editConfig.repoUsername': {
      handler: function(val) {
        this.setFormValue('repoUsername', val);
      },
      immediate: true
    },
    item: {
      handler: function(val) {
        if (val) {
          Object.assign(this.editConfig, {
            repoType: val.repoType || 'gitlab',
            credType: val.credType || 'password',
            repoUsername: val.repoUsername || null,
            repoCredential: val.repoCredential || null          
          });
        }
      },
      immediate: true,
      deep: true   
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
}
</style>
