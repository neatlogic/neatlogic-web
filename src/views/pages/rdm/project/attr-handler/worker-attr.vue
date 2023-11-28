<template>
  <div>
    <UserSelect
      ref="select"
      :readonly="readonly"
      :value="finalUserIdList"
      :validateList="validateList"
      :multiple="true"
      :transfer="true"
      :extendCondition="{ projectId: projectId }"
      :groupList="groupList"
      :border="border"
      :includeList="['common#loginuser']"
      :excludeList="['common#alluser']"
      @change="
        (val, opt) => {
          setValue('userIdList', val, opt);
        }
      "
      @change-label="(label, selectedList) => $emit('changeLabel', label, selectedList)"
    ></UserSelect>
  </div>
</template>
<script>
import { AttrBase } from '@/views/pages/rdm/project/attr-handler/base-privateattr.js';

export default {
  name: '',
  components: {
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve)
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
    },
    setValue(attr, val, opt) {
      let text;
      if (opt) {
        if (opt instanceof Array) {
          text = opt.map(d => d.text);
        } else if (typeof opt === 'object') {
          text = opt.text;
        }
      }
      if (val) {
        //输入模式需要去掉前缀，搜索模式不需要，因为搜索模式多了common这个分组，去掉前缀没法区分
        if (this.mode === 'input') {
          if (val instanceof Array) {
            val = val.map(str => str.substring(str.indexOf('#') + 1));
          } else {
            val = val.substring(val.indexOf('#') + 1);
          }
        }
      }
      this.$emit('setValue', attr, val, text);
    }
  },
  filter: {},
  computed: {
    groupList() {
      const groupList = [];
      if (this.projectId) {
        if (this.mode === 'search') {
          groupList.push('common');
        }
        groupList.push('rdm.project');
      } else {
        groupList.push('user');
      }
      return groupList;
    },
    finalUserIdList() {
      let userIdList = [];
      if (this.userIdList && this.userIdList.length > 0) {
        userIdList = this.userIdList.map(str => str.indexOf('#') == -1 ? 'rdm.project#' + str : str);
      }
      return userIdList;
    },
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
