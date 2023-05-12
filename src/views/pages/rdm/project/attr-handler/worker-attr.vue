<template>
  <div>
    <UserSelect
      ref="select"
      :value="userIdList"
      border="border"
      :multiple="true"
      :readonly="readonly"
      :validateList="validateList"
      transfer
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
