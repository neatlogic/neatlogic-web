<template>
  <div>
    <TsDialog v-bind="dialogConfig">
      <template v-slot>
        <div>
          <i class="tsfont-danger-o text-warning icon-fz"></i>
          <span class="title-fz">{{ $t('dialog.content.saveconfirm') }}</span>
        </div>
        <div class="text-tip content-tip">{{ $t('term.autoexec.nosavetip') }}</div>
      </template>
      <template v-slot:footer>
        <div class="footer-btn-contain">
          <Button @click="close">{{ $t('page.cancel') }}</Button>
          <Button type="primary" @click="test">{{ $t('dialog.title.saveandtarget', {target: $t('page.test')}) }}</Button>
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
    isShow: { type: Boolean, default: false }
  },
  data() {
    return {
      dialogConfig: {
        isShow: true,
        hasHeader: false,
        showCloseIcon: false
      }
    };
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
      this.$emit('saveTest', false);
    },
    test() {
      this.close(); 
      this.$emit('saveTest', true);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.icon-fz {
  font-size: 20px;
}
.title-fz {
  font-size: 16px;
  font-weight: bold;
  padding-left: 12px;
}
.content-tip {
  padding-left: 32px;
}
</style>
