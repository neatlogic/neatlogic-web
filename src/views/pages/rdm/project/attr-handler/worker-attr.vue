<template>
  <div>
    <TsFormSelect
      v-if="projectId"
      ref="select"
      :readonly="readonly"
      :value="userIdList"
      :validateList="validateList"
      :multiple="true"
      transfer
      url="/api/rest/rdm/project/user/list"
      valueName="userId"
      textName="userName"
      :params="{ projectId: projectId, userType: 'member' }"
      border="border"
      @change="
        (val, opt) => {
          $emit('setValue', 'userIdList', val);
        }
      "
    ></TsFormSelect>
    <UserSelect
      v-else
      :value="userIdList"
      :validateList="validateList"
      :multiple="true"
      :transfer="true"
      :groupList="['user']"
      @change="
        (val, opt) => {
          $emit('setValue', 'userIdList', val);
        }
      "
    ></UserSelect>
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
      userIdList: (this.issueData && this.issueData.userIdList) || this.valueList
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    valid() {
      return this.$refs['select'].valid();
    }
  },
  filter: {},
  computed: {
    validateList() {
      if (this.mode === 'input' && this.attrConfig.isRequired) {
        return [{ name: 'required', message: ' ' }];
      }
      return [];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
