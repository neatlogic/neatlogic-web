<template>
  <div class="del-box bg-mongolia">
    <div class="main">
      <div class="title overflow" :title="delName">{{ delName }}</div>
      <div class="btn-list">
        <span class="btn-style" @click="close">
          {{ $t('page.cancel') }}
        </span>
        <Button type="error" :size="buttonSize" @click="delData">
          {{ $t('page.confirm') }}
        </Button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    delName: {
      type: String,
      default: ''
    },
    buttonSize: {
      type: String,
      default: 'default'
    }
  },
  data() {
    return {};
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
    close() {
      this.$emit('on-close');
    },
    delData() {
      this.$emit('on-del');
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.del-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 8px 16px;
  z-index: 9;
  .main {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    color: @default-op;
  }
  .title {
    margin-bottom: 8px;
  }
  .btn-list {
    text-align: right;
    .btn-style {
      padding: 8px 16px;
      margin-left: 8px;
      cursor: pointer;
    }
  }
}
</style>
