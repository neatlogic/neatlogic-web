<template>
  <div class="view-img" :class="changeType?'bg-'+ changeType:''" :data_id="uuid">
    <div class="wrapper" :class="config.align || 'left'">
      <div class="img">
        <div v-if="isError" class="img-loading bg-op text-error">{{ $t('term.knowledge.imageloadfail') }}</div>
        <div v-else-if="loading || !config.url" class="img-loading bg-op"><span class="loading ivu-icon ivu-icon-ios-loading"></span>{{ $t('term.knowledge.imageloadding') }}</div>
        <img
          ref="img"
          :src="imgSrc"
          :title="config.title"
          width="100%"
          @load="handlerLoad"
        />
        <div class="dec-conetent text-icon">
          <div>{{ $t('page.memo') }}：</div>
          <div v-html="config.value"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object,
    changeType: String
  },
  data() {
    return {
      loading: true,
      isError: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$refs.img.addEventListener('onerror', this.handlerError);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handlerLoad() {
      this.loading = false;
    },
    handlerError() {
      this.isError = true;
    }
  },
  filter: {},
  computed: {
    imgSrc() {
      return this.config.url.indexOf(BASEURLPREFIX + '/') != 0 ? BASEURLPREFIX + '/' + this.config.url : this.config.url;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.view-img {
  width:100%;
  padding: 10px 0;
  display: inline-block;
   .left {
    display: flex;
    flex-direction: row;
    .img {
      max-width: 50%;
    }
  }
  .right {
    display: flex;
    flex-direction: row-reverse;
    .img {
      max-width: 50%;
    }
  }
  .center {
    display: flex;
    justify-content: center;
    .img {
      max-width: 80%;
    }
  }
  .wrapper {
    text-align: left;
    .img {
      position: relative;
      padding: 10px;
      border-radius: 2px;
      img{
        max-width: 100%;
      }
    }
  }
  .img-loading{
    display: inline-block;
    position: absolute;
    min-width: 100px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .dec-conetent{
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
  }
}
</style>
