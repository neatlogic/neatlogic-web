<template>
  <div>
    <TsDialog
      :title="$t('term.inspect.clearfile')"
      type="modal"
      :isShow="true"
      :okText="$t('page.clearup')"
      btnType="error"
      @on-ok="okClear"
      @on-close="close"
    >
      <template v-slot>
        <div class="path-main">
          <span>{{ $t('term.inspect.clearfile') }}</span>
          <span class="path-text overflow">{{ reversePath(pathConfig.path) }}</span>
          <span>]</span> 
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    pathConfig: Object
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
    okClear() {
      this.$api.inspect.configfile.clearResourceFile({resourceId: this.pathConfig.resourceId, pathId: this.pathConfig.id}).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Notice.success({
            title: this.$t('message.clearupsuccess')
          });
          this.$emit('close', true);
        }
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    reversePath() {
      return path => {
        return path.split('').reverse().join('');
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.path-main {
  display: flex;
  .path-text {
    max-width: 460px;
    direction: rtl;
    unicode-bidi: bidi-override;
  }
}
</style>
