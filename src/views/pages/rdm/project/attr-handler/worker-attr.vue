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
      :groupList="['user']"
      :border="border"
      :rangeList="rangeList"
      :includeList="['common#loginuser']"
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
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue')
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
      userIdList: (this.issueData && this.issueData.userIdList) || this.valueList,
      rangeList: [] // 查询指定用户列表
    };
  },
  beforeCreate() {},
  created() {
    this.getProjectById();
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
    },
    getProjectById() {
      if (this.projectId) {
        this.$api.rdm.project.getProjectById(this.projectId).then(res => {
          let {userList = []} = res.Return || {};
          if (userList.length > 0) {
            this.rangeList = userList.map((v) => `user#${v.userId}`);
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    finalUserIdList() {
      let userIdList = [];
      if (this.userIdList && this.userIdList.length > 0) {
        userIdList = this.userIdList.map(str => str.indexOf('#') == -1 ? 'user#' + str : str);
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
