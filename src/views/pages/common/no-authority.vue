<template>
  <div class="error">
    <div class="error-message">
      <div class="text-center">
        <div class="background-img"></div>
      </div>
      <p class="h2">{{ des }}</p>
      <div class="pt-sm"><Button type="primary" @click="gotoDefault">{{ $t('page.returntohomepage') }}</Button></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error',
  data() {
    return {
      des: this.$t('page.pagenotvalid')
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query && this.$route.query.des) {
      this.des = this.$route.query.des;
      document.title = this.des;
    }
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
    gotoDefault() {
      this.$router.push({
        path: '/'
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
.error {
  height: calc(100vh - 120px);
  .error-message {
    text-align: center;
    // display: flex;
    // justify-content: center;
    // align-items: center;
    // flex-direction: column;
    position: relative;
    top: 30%;
    .h2{
      font-size: 13px;
    }
    .text-center{
      position: relative;
      height: 160px;
    }
    img {
      max-height: 30vh;
    }
  }
  .background-img{
    width: 100%;
    height: 100%;
    &::before{
      content: '';
      height: 90%;
      width: 100%;
      top: 0;
      left: 0;
      position: absolute;
      background: url('~img-module/img/common/noauthority-default.png') no-repeat center;
      background-size: auto 100%;
    }
    .theme-dark & {
      &::before{
        background-image: url('~img-module/img/common/noauthority-dark.png');
      }
    }
  }
}
</style>
