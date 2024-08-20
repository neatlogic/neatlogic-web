<template>
  <div v-if="userIdList && userIdList.length > 0">
    <UserCard
      v-for="(user, index) in userIdList"
      :key="index"
      :uuid="user"
      class="pr-sm"
      :iconSize="20"
    ></UserCard>
  </div>
  <div v-else class="text-grey">-</div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
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
  methods: {},
  filter: {},
  computed: {
    userIdList() {
      return (this.issueData && this.issueData.userIdList) || this.valueList;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
