<template>
  <TsForm :item-list="formConfig"></TsForm>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';

export default {
  name: 'CiAuthSettingForm',
  components: {
    TsForm
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    scope: {
      type: String,
      default: 'ci'
    }
  },
  data() {
    return {
      allFormConfig: [],
      formConfig: []
    };
  },
  created() {
    this.allFormConfig = this.createFormConfig();
    this.refreshFormConfig();
  },
  methods: {
    createFormConfig() {
      return [
        this.createUserSelectConfig('cimanage', this.$t('term.cmdb.cimanage'), this.$t('message.cmdb.cimanage'), ['ci', 'vci']),
        this.createUserSelectConfig('cientityinsert', this.$t('term.cmdb.addcientity'), this.$t('message.cmdb.newcientity'), ['ci']),
        this.createUserSelectConfig('cientityupdate', this.$t('term.cmdb.editcientity'), this.$t('message.cmdb.editcientity'), ['ci']),
        this.createUserSelectConfig('cientitydelete', this.$t('term.cmdb.deletecientity'), this.$t('message.cmdb.deletecientity'), ['ci']),
        this.createUserSelectConfig('cientityrecover', this.$t('term.cmdb.recovercientity'), this.$t('message.cmdb.recovercientity'), ['ci']),
        this.createUserSelectConfig('cientityquery', this.$t('term.cmdb.viewcientity'), this.$t('message.cmdb.viewcientity'), ['ci', 'vci']),
        this.createUserSelectConfig('transactionmanage', this.$t('term.cmdb.transactionmanage'), this.$t('message.cmdb.transactionmanage'), ['ci']),
        this.createUserSelectConfig('passwordview', this.$t('term.cmdb.viewpassword'), this.$t('message.cmdb.viewpassword'), ['ci'])
      ];
    },
    createUserSelectConfig(action, label, desc, scopeList) {
      return {
        type: 'userselect',
        name: action,
        label: label,
        transfer: true,
        _scope: scopeList,
        desc: desc,
        groupList: ['common', 'user', 'team', 'role'],
        onChange: value => {
          this.setAuthData(action, value);
        }
      };
    },
    refreshFormConfig() {
      if (this.scope === 'vci') {
        this.formConfig = this.allFormConfig.filter(item => item._scope.includes('vci'));
      } else {
        this.formConfig = this.allFormConfig;
      }
      this.setFormValue();
    },
    setFormValue() {
      const authList = this.value || [];
      this.allFormConfig.forEach(item => {
        const valueList = [];
        authList.forEach(auth => {
          if (item.name === auth.action) {
            valueList.push(auth.authType + '#' + auth.authUuid);
          }
        });
        this.$set(item, 'value', valueList);
      });
    },
    setAuthData(action, valueList) {
      const authList = (this.value || []).filter(auth => auth.action !== action);
      if (valueList && valueList.length > 0) {
        valueList.forEach(value => {
          const valueArray = value.split('#');
          authList.push({
            authType: valueArray[0],
            authUuid: valueArray[1],
            action: action
          });
        });
      }
      this.$emit('input', authList);
    }
  },
  watch: {
    value: {
      handler() {
        this.setFormValue();
      },
      deep: true
    },
    scope() {
      this.refreshFormConfig();
    }
  }
};
</script>
