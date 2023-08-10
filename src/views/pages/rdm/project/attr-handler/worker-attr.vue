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
      :groupList="projectId?['rdm.project']:['user']"
      @change="
        (val, opt) => {
          setValue('userIdList', val, opt);
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
        if (val instanceof Array) {
          val = val.map(str => str.substring(str.indexOf('#') + 1));
        } else {
          val = val.substring(val.indexOf('#') + 1);
        }
      }
      this.$emit('setValue', attr, val, text);
    }
  },
  filter: {},
  computed: {
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
