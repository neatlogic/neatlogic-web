<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>授权设置</div>
      </template>
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';

export default {
  name: '',
  components: {
    TsForm
  },
  props: { 
    ciId: {
      type: Number
    }
  },
  data() {
    var _this = this;
    return { 
      authList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      formConfig: [
        {
          type: 'userselect',
          name: 'cimanage',
          label: '管理模型',
          transfer: true,
          desc: '拥有此权限则自动拥有关于当前模型的所有权限。',
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cimanage', name);
          }
        },
        {
          type: 'userselect',
          name: 'cientityinsert',
          label: '新增配置项',
          transfer: true,
          desc: '拥有此权限可以新增配置项，如果没有事务管理权限则不能提交生效。',
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cientityinsert', name);
          }
        },
        {
          type: 'userselect',
          name: 'cientityupdate',
          label: '编辑配置项',
          transfer: true,
          desc: '拥有此权限可以编辑配置项，如果没有事务管理权限则不能提交生效。',
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cientityupdate', name);
          }
        },
        {
          type: 'userselect',
          name: 'cientitydelete',
          label: '删除配置项',
          transfer: true,
          desc: '拥有此权限可以删除配置项，如果没有事务管理权限则不能提交生效。',
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cientitydelete', name);
          }
        },
        {
          type: 'userselect',
          name: 'cientityrecover',
          label: '恢复配置项',
          transfer: true,
          desc: '拥有此权限可以恢复已删除的配置项。',
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cientityrecover', name);
          }
        },
        {
          type: 'userselect',
          name: 'cientityquery',
          label: '查看配置项',
          transfer: true,
          desc: '拥有此权限可以查询配置项。',
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cientityquery', name);
          }
        }, {
          type: 'userselect',
          name: 'transactionmanage',
          label: '管理事务',
          transfer: true,
          desc: '拥有此权限可以提交未生效的事务或删除未提交的事务，并且自动拥有新增，修改和删除配置项的权限',
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('transactionmanage', name);
          }
        },
        {
          type: 'userselect',
          name: 'passwordview',
          label: '查看密码字段',
          transfer: true,
          desc: '拥有此权限可以查看当前模型下所有配置项的密码字段。',
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('passwordview', name);
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { this.getAuthData(); },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setData: function(action, newvalue) {
      //删除数组，反过来迭代
      for (let i = this.authList.length - 1; i >= 0; i--) {
        const auth = this.authList[i];
        if (auth.action == action) {
          this.authList.splice(i, 1);
        }
      }
      if (newvalue && newvalue.length > 0) {
        newvalue.forEach(element => {
          this.authList.push({
            authType: element.split('#')[0],
            authUuid: element.split('#')[1],
            action: action
          });
        });
      }
    },
    getAuthData: function() {
      if (this.ciId) {
        this.$api.cmdb.ci.getCiAuthByCiId(this.ciId).then(res => {
          this.authList = res.Return; 
          this.formConfig.forEach(element => {
            element.value = [];
            if (this.authList && this.authList.length > 0) {
              this.authList.forEach(auth => {
                if (element.name == auth.action) {
                  element.value.push(auth.authType + '#' + auth.authUuid);
                }
              });
            } 
          });
        });
      }
    },
    save: function() {
      this.$api.cmdb.ci.saveCiAuth({ciId: this.ciId, authList: this.authList}).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.savesuccess'));
          this.close();
        }
      });
    },
    close: function() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
</style>
