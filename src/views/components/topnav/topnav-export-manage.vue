<template>
  <div class="topnav-message">
    <div class="bell-container">
      <i class="tsfont-download message-bell" @click="openUserExportFileManage()"></i>
      <sup v-if="unreadCount" class="badge text-danger"></sup>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {

  },
  props: {},
  data() {
    return {
      unreadCount: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getUserExportFileUnReadCount();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getUserExportFileUnReadCount() {
      this.$api.framework.userexportfile.getUserExportFileUnReadCount({}).then(res => {
        if (res.Status == 'OK') {
          this.unreadCount = res.Return.unreadCount;
          // let unreadCount = res.Return.unreadCount;
          // this.$store.commit('setUnreadCount', unreadCount);
        }
      });
    },
    openUserExportFileManage() {
      window.open(HOME + '/framework.html#/user-export-file-manage', '_blank');
    }
  },
  filter: {},
  computed: {
    // unreadCount() {
    //   return this.$store?.state?.unreadCount;
    // }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
  @import (reference) '~assets/css/variable.less';
.topnav-message {
  .bell-container {
    position: relative;
    cursor: pointer;
  }
  .badge {
    position: absolute;
    right: 4px;
    top: 1px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}
</style>

