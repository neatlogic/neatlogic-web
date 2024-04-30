<template>
  <div>
    <TsFormItem :label="$t('page.multipleselection')" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isMultiple"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('page.group')" labelPosition="top" required>
      <TsFormSelect
        :value="config.groupList"
        v-bind="groupConfig"
        :disabled="disabled"
        @on-change="val => {
          setConfig('groupList', val);
        }"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('page.defaultvalue')" labelPosition="top">
      <UserSelect
        :value="config.defaultValue"
        :multiple="config.isMultiple"
        :groupList="getGroup(config.groupList)"
        :excludeList="getexcludeList(config.groupList)"
        :includeList="getincludeList(config.groupList)"
        :disabled="disabled"
        @on-change="val => {
          setConfig('defaultValue', val);
        }"
      ></UserSelect>
    </TsFormItem>
    <TsFormItem :label="$t('page.inputtip')" labelPosition="top">
      <TsFormInput
        :value="config.placeholder"
        :maxlength="50"
        :disabled="disabled"
        @on-change="val => {
          setConfig('placeholder', val);
        }"
      ></TsFormInput>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      groupConfig: {
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.group')}),
        url: 'api/rest/groupsearch/list',
        dealDataByUrl: this.dealGroupConfigDataList,
        multiple: true,
        border: 'border',
        validateList: ['required']
      },
      validateList: ['required']
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
    }
  },
  filter: {},
  computed: {
    getGroup() {
      //需求用户选择器选择用户需支持当前登录人、上报人，选择组需支持当前用户所在组
      return function(group) {
        let list = group || [];
        if (group && group.length > 0) {
          if (group.indexOf('user') > -1) {
            //当前登录人、上报人（后台确定要分2个类型获取，不在common做处理）
            list = this.$utils.concatArr(list, ['common', 'processUserType']);
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
      return function(group) {
        let list = [];
        if (group && group.length > 0) { 
          if (group.indexOf('user') > -1) {
            //当前登录人、上报人（后台确定要分2个类型获取，不在common做处理）
            list = list.concat(['common#loginuser', 'processUserType#owner']); 
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
      return function(group) {
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
