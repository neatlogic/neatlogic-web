<template>
  <div v-if="licenseData && (licenseData.isWillExpired || licenseData.isExpired) && isShow" class="license-container">
    <!---->
    <div style="position: relative;" class="pr-nm">
      <div v-if="licenseData.isWillExpired" class="cursor h1 text-grey" @click="toLicenseManage">许可将于{{ licenseData.expiredTime }}过期</div>
      <div v-if="licenseData.isExpired" class="cursor h1 text-grey" @click="toLicenseManage">许可已过期，系统将于{{ licenseData.stopServiceTime }}停止服务</div>
      <span class="tsfont-close cursor" style="position:absolute;right:0px;top:-3px" @click="isShow = false"></span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      licenseData: null,
      isShow: true
    };
  },
  beforeCreate() {},
  created() {
    this.checkTenant();
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
    toLicenseManage() {
      window.location.href = HOME + '/framework.html#/license-manage';
    },
    checkTenant() {
      this.$api.common.checkTenant().then(res => {
        this.licenseData = res.license;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.license-container {
  z-index: 9999;
  position: fixed;
  bottom: 20px;
  right: 20px;
  opacity: 0.7;
}
</style>
