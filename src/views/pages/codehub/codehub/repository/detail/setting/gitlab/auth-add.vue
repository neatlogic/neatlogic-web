<template>
  <TsDialog
    v-if="isShow"
    v-bind="setting"
    :isShow="isShow"
    @on-close="close"
  >
    <div>
      <TsForm ref="editform" :itemList="formConfig">
        <template slot="memberType">
          <div v-if="editConfig" class="text-tip">{{ editConfig.name }}</div>
          <TsFormSelect v-else-if="authType && authType=='group'" v-model="groupVal" v-bind="groupConfig"></TsFormSelect>
          <TsFormSelect v-else v-model="memberVal" v-bind="memberConfig"></TsFormSelect>
        </template>
        <!-- membertype -->
      </TsForm>
    </div>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">取消</Button>
        <Button type="primary" :disabled="isSubmit" @click="saveEdit">确定</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormSelect
  },
  filters: {},
  props: {
    isShow: Boolean,
    uuid: String,
    accList: Array,
    editConfig: [Object, String]
  },
  data() {
    let _this = this;
    return {
      split: 0.3,
      setting: {
        title: _this.editConfig ? '编辑授权' : '添加授权',
        maskClose: false,
        width: 'medium'
      },
      isSubmit: false, //是否提交中，需要禁用调提交按钮
      formConfig: [
        {
          type: 'radio',
          label: '类型',
          name: 'authType',
          validateList: ['required'],
          value: 'member',
          dataList: [{
            text: '用户',
            value: 'member'
          }, {
            text: '组',
            value: 'group'
          }],
          onChange(val) {
            _this.changeType(val);
          }
        }, {
          type: 'slot',
          label: '用户名/组名',
          name: 'memberType',
          validateList: ['required']         
        }, {
          type: 'select',
          label: '权限',
          name: 'auth',
          value: 10,
          validateList: ['required'],
          width: '300px',
          transfer: true,
          dataList: _this.accList.filter(a => { return a.value != 50; }),
          clearable: false,
          onChange(val) {
            _this.changeAuth(val);
          }       
        }, {
          type: 'date',
          label: '截止日期',
          name: 'endTime',
          width: '300px',
          format: 'yyyy-MM-dd',
          transfer: true,
          onChange(val) {
            _this.endTime = val;
          } 
        }
      ],
      authType: 'member',
      authValue: 10,
      groupVal: [],
      memberVal: [],
      endTime: '',
      groupConfig: {
        width: '300px',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/codehub/repository/gitlab/searchGroups',
        textName: 'name',
        valueName: 'id',
        params: {
          'repositoryUuid': _this.uuid,
          'perPage': 10
        },
        keyword: 'search',
        rootName: 'list',
        clearable: false,
        multiple: true,
        search: true,
        requireFirstLoad: true  
      },
      memberConfig: {
        width: '300px',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/codehub/repository/gitlab/searchUsers',
        textName: 'name',
        valueName: 'id',
        params: {
          'repositoryUuid': _this.uuid,
          'perPage': 10
        },
        keyword: 'search',
        rootName: 'list',
        clearable: false,
        multiple: true,
        search: true,
        requireFirstLoad: true     
      }
    };
  },
  beforeCreate() {},
  created() {

  },
  beforeMount() {},
  mounted() {
    if (this.editConfig && typeof this.editConfig == 'object') {
      if (this.editConfig.authType == 'group') {
        this.formConfig.forEach(f => {
          if (f.name == 'authType') {
            this.$set(f, 'value', this.editConfig.authType);
            this.$set(f, 'readonly', true);
          } else if (f.name == 'auth') {
            this.$set(f, 'value', this.editConfig['group_access_level']);
          } else if (f.name == 'endTime') {
            this.$set(f, 'value', this.editConfig['expires_at']);
          }
        });
        this.authType = this.editConfig.authType;
        this.authValue = this.editConfig['group_access_level'];
        this.endTime = this.editConfig['expires_at'];
        this.groupVal = [this.editConfig['id']];
      } else {
        this.formConfig.forEach(f => {
          if (f.name == 'authType') {
            this.$set(f, 'value', this.editConfig.authType);
            this.$set(f, 'readonly', true);
          } else if (f.name == 'auth') {
            this.$set(f, 'value', this.editConfig['access_level']);
          } else if (f.name == 'endTime') {
            this.$set(f, 'value', this.editConfig['expires_at']);
          }
        });
        this.authType = this.editConfig.authType;
        this.authValue = this.editConfig['access_level'];
        this.endTime = this.editConfig['expires_at'];
        this.memberVal = [this.editConfig['id']];
      }
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    saveEdit() {
      let param = {
        repositoryUuid: this.uuid
      };
      if (this.authType == 'member') {
        Object.assign(param, {
          'user_id': this.memberVal.join(','),
          'access_level': this.authValue,
          'expires_at': this.endTime
        });
        this.isSubmit = true;
        this.$api.codehub.repositorydetail.saveGitAuth('member', param).then(res => {
          if (res && res.Status == 'OK') {
            this.$emit('close', true);
          }
        }).finally(res => {
          this.isSubmit = false;
        });
      } else {
        Object.assign(param, {
          'group_id': this.groupVal.join(','),
          'group_access': this.authValue,
          'expires_at': this.endTime
        });  
        this.isSubmit = true;
        this.$api.codehub.repositorydetail.saveGitAuth('group', param).then(res => {
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
    changeType(val) {
      this.authType = val;
      this.groupVal = [];
      this.memberVal = [];
      this.authValue = 10;
      this.setFormVal('auth', 10);
      this.setFormVal('endTime', '');
    },
    changeAuth(val) {
      this.authValue = val;
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
  computed: {
  },
  watch: {}

};

</script>
<style lang='less'>

</style>
