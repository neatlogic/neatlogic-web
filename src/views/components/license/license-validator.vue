<template>
  <div v-if="licenseInvalidTips && isShow" class="license-container">
    <!---->
    <div v-if="licenseInvalidTips&&licenseInvalidTips.length > 0" style="position: relative;" class="pr-nm">
      <div class="cursor h1 text-grey" @click="toLicenseManage">{{ $t('page.license') }}</div>
      <div v-for="(tip,index) in licenseInvalidTips" :key="index">
        <div v-if="tip.type === 'error'" class="cursor h3 text-error" @click="toLicenseManage">{{ $t('page.exception') }}：{{ tip.msg }}</div>
        <div v-else-if="tip.type === 'warn'" class="cursor h3 text-warning" @click="toLicenseManage">{{ $t('page.warning') }}：{{ tip.msg }}</div>
        <div v-else class="cursor h3 text-info" @click="toLicenseManage">{{ $t('page.tip') }}：{{ tip.msg }}</div>
      </div>
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
      licenseInvalidTips: null,
      isShow: true,
      timer: null
    };
  },
  beforeCreate() {},
  created() {
    this.checkLicense();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.timer) {
      this.timer.clear();
    }
  },
  destroyed() {
  },
  methods: {
    toLicenseManage() {
      window.location.href = HOME + '/framework.html#/license-manage';
    },
    checkLicense() {
      this.timer = this.$utils.setInterval(async() => {
        await this.$api.common.getLicenseInvalidMsg().then(res => {
          this.licenseInvalidTips = res.Return;
          if (this.licenseInvalidTips && this.licenseInvalidTips.length > 0) {
            this.licenseInvalidTips = this.licenseInvalidTips.filter(item => item.moduleGroupVos.some(m => m.group === MODULEID));
          }
          if (this.licenseInvalidTips && this.licenseInvalidTips.length > 0) {
            this.isShow = true;
          }
        });
      }, 1800000);//30分钟执行一次
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
