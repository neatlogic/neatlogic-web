<template>
  <div class="padding">
    <TsForm ref="reportForm" :item-list="reportInstanceFormConfig">
      <template v-slot:config>
        测试
      </template>
    </TsForm>
    -----
    <TsForm
      ref="form"
      v-model="settingConfig"
      :item-list="settingForm"
      type="type"
      label-position="right"
    >
      <template v-slot:account>
        <TsFormSelect
          ref="formSelect"
          v-model="settingConfig.accountList"
          v-bind="settingForm.account"
          @first="first"
        >
        </TsFormSelect>
      </template>
    </TsForm>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsForm from '@/resources/plugins/TsForm/TsForm';
export default {
  name: '',
  components: {
    TsForm, TsFormSelect
  },
  props: {},
  data() {
    return {
      // dealDataByUrl: [],
      settingConfig: {
        accountList: []
      },
      settingForm: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        account: {
          type: 'slot',
          name: 'account',
          label: '名称',
          transfer: true,
          multiple: true,
          firstText: '添加帐号',
          firstLi: true,
          dynamicUrl: 'api/rest/resourcecenter/account/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAccountNodeList,
          validateList: ['required'],
          onChange: function(val, textlist, list) {

          }
        }
      },
      reportInstanceFormConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          label: '名称',
          maxlength: 50,
          validateList: ['required']
        },
        reportId: {
          type: 'select',
          label: '选择',
          validateList: ['required'],
          valueName: 'id',
          textName: 'name',
          dynamicUrl: '',
          iconArr: [{icon: '', text: '测试', value: 1}],
          rootName: 'tbodyList'
        }, 
        authList: {
          type: 'userselect',
          label: '授权',
          groupList: ['user', 'team', 'role']
        },
        config: {
          type: 'slot',
          label: 'config'
        }
      }
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
    first() {
      console.log('点击');
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
