<template>
  <div>
    <TsFormItem :label="$t('page.multipleselection')">
      <TsFormSwitch v-model="propertyLocal.config.isMultiple" :trueValue="true" :falseValue="false"></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('page.group')" required>
      <TsFormSelect
        ref="groupList"
        :value="propertyLocal.config.groupList"
        v-bind="groupConfig"
        @on-change="val => {
          changeGroupList(val);
        }"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('page.inputtip')">
      <TsFormInput v-model="propertyLocal.config.placeholder" :maxlength="50"></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('page.defaultvalue')">
      <UserSelect
        v-model="propertyLocal.config.defaultValue"
        :multiple="propertyLocal.config.isMultiple"
        :groupList="getGroup(propertyLocal.config.groupList)"
        :excludeList="getexcludeList(propertyLocal.config.groupList)"
        :includeList="getincludeList(propertyLocal.config.groupList)"
        transfer
      ></UserSelect>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    propertyLocal: Object
  },
  data() {
    return {
      groupConfig: {
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.group')}),
        url: '/api/rest/groupsearch/list',
        dealDataByUrl: this.dealGroupConfigDataList,
        multiple: true,
        border: 'border',
        validateList: ['required'],
        transfer: true
      }
    };
  },
  beforeCreate() {},
  created() {
    
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
    dealGroupConfigDataList(dataList) {
      return dataList && dataList.filter(data => data.value != 'common');
    },
    changeGroupList(val) {
      this.$set(this.propertyLocal.config, 'groupList', val);
      this.$set(this.propertyLocal.config, 'defaultValue', null);
    },
   
    valid() {
      let isValid = true;
      if (this.$refs.groupList) {
        isValid = this.$refs.groupList.valid();
      }
      return isValid;
    }
  },
  filter: {},
  computed: {
    getGroup() {
      //需求用户选择器选择用户需支持当前登录人、上报人，选择组需支持当前用户所在组
      return (group) => {
        let list = group || [];
        if (group && group.length > 0) {
          if (group.indexOf('user') > -1) {
            //当前登录人、上报人（后台确定要分2个类型获取，不在common做处理）
            // list = this.$utils.concatArr(list, ['common', 'processUserType']);
            list = this.$utils.concatArr(list, ['common']);
          }
          if (group.indexOf('team') > -1) {
            //当前用户所在组
            list = this.$utils.concatArr(list, ['common']);
          }
        }
        return list;
      };
    },
    getincludeList() {
      //需求用户选择器选择用户需支持当前登录人、上报人，选择组需支持当前用户所在组
      return (group) => {
        let list = [];
        if (group && group.length > 0) {
          if (group.indexOf('user') > -1) {
            //当前登录人、上报人（后台确定要分2个类型获取，不在common做处理）
            // list = list.concat(['common#loginuser', 'processUserType#owner']);
            list = list.concat(['common#loginuser']);
          }
          if (group.indexOf('team') > -1) {
            //当前用户所在组
            list = list.concat(['common#loginteam']);
          }
        }
        return list;
      };
    },
    getexcludeList() {
      //需求用户选择器选择用户需支持当前登录人、上报人，选择组需支持当前用户所在组
      return (group) => {
        let list = [];
        if (group && group.length > 0) {
          if (group.indexOf('user') > -1) {
            //过滤掉工单用户除了上报人外的字段（后台确定字段数组接口写死，需前端单独过滤）
            list = this.$utils.concatArr(list, ['processUserType#major', 'processUserType#minor', 'processUserType#agent', 'processUserType#reporter', 'processUserType#worker']);
          }
          if (group.indexOf('common') < 0) {
            //没有选择common
            list = this.$utils.concatArr(list, ['common#alluser']);
          }
        }
        return list;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
