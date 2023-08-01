<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig"></TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
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
        title: this.$t('dialog.title.authsetting'),
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      formConfig: [
        {
          type: 'userselect',
          name: 'cimanage',
          label: this.$t('term.cmdb.cimanage'),
          transfer: true,
          desc: this.$t('message.cmdb.cimanage'),
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cimanage', name);
          }
        },
        {
          type: 'userselect',
          name: 'cientityinsert',
          label: this.$t('term.cmdb.addcientity'),
          transfer: true,
          desc: this.$t('message.cmdb.newcientity'),
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cientityinsert', name);
          }
        },
        {
          type: 'userselect',
          name: 'cientityupdate',
          label: this.$t('term.cmdb.editcientity'),
          transfer: true,
          desc: this.$t('message.cmdb.editcientity'),
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cientityupdate', name);
          }
        },
        {
          type: 'userselect',
          name: 'cientitydelete',
          label: this.$t('term.cmdb.deletecientity'),
          transfer: true,
          desc: this.$t('message.cmdb.deletecientity'),
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cientitydelete', name);
          }
        },
        {
          type: 'userselect',
          name: 'cientityrecover',
          label: this.$t('term.cmdb.recovercientity'),
          transfer: true,
          desc: this.$t('message.cmdb.recovercientity'),
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cientityrecover', name);
          }
        },
        {
          type: 'userselect',
          name: 'cientityquery',
          label: this.$t('term.cmdb.viewcientity'),
          transfer: true,
          desc: this.$t('message.cmdb.viewcientity'),
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('cientityquery', name);
          }
        },
        {
          type: 'userselect',
          name: 'transactionmanage',
          label: this.$t('term.cmdb.transactionmanage'),
          transfer: true,
          desc: this.$t('message.cmdb.transactionmanage'),
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.setData('transactionmanage', name);
          }
        },
        {
          type: 'userselect',
          name: 'passwordview',
          label: this.$t('term.cmdb.viewpassword'),
          transfer: true,
          desc: this.$t('message.cmdb.viewpassword'),
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
  mounted() {
    this.getAuthData();
  },
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
      this.$api.cmdb.ci.saveCiAuth({ ciId: this.ciId, authList: this.authList }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
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
  watch: {}
};
</script>
<style lang="less"></style>
