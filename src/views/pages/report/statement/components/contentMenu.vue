<template>
  <div v-show="visible" class="contentmenu" :style="styleObj">
    <div class="contentmenu__item" @click="deleteLayer">
      <i class="iconfont iconguanbi"></i> {{ $t('term.report.deletelayer') }}
    </div>
    <div class="contentmenu__item" @click="copyLayer">
      <i class="iconfont iconfuzhi1"></i> {{ $t('term.report.copylayer') }}
    </div>
    <div class="contentmenu__item" @click="istopLayer">
      <i class="iconfont iconjinlingyingcaiwangtubiao01"></i> {{ $t('term.report.istoplayer') }}
    </div>
    <div class="contentmenu__item" @click="setlowLayer">
      <i class="iconfont iconleft-copy"></i> {{ $t('term.report.setlowlayer') }}
    </div>
    <div class="contentmenu__item" @click="moveupLayer">
      <i class="iconfont iconjinlingyingcaiwangtubiao01"></i> {{ $t('term.report.moveuplayer') }}
    </div>
    <div class="contentmenu__item" @click="movedownLayer">
      <i class="iconfont iconleft-copy"></i> {{ $t('term.report.movedownlayer') }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    styleObj: Object,
    visible: Boolean
  },
  data() {
    return {};
  },
  methods: {
    closeMenu() {
      this.$emit('update:visible', false);
    },
    deleteLayer() {
      this.$confirm(this.$t('dialog.content.deleteconfirm', {target:this.$t('term.report.selectedlayer')}), this.$t('page.tip'), {
        confirmButtonText: this.$t('button.confirm'),
        cancelButtonText: this.$t('button.cancel'),
        type: 'warning'
      })
        .then(() => {
          this.$emit('deletelayer');
          this.$message({
            type: 'success',
            message: `${this.$t('message.content.deletesuccess')}！`
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('message.content.deleteCancel')
          });
        });
    },
    copyLayer() {
      this.$emit('copylayer');
    },
    istopLayer() {
      this.$emit('istopLayer');
    },
    setlowLayer() {
      this.$emit('setlowLayer');
    },
    moveupLayer() {
      this.$emit('moveupLayer');
    },
    movedownLayer() {
      this.$emit('movedownLayer');
    }
  },
  watch: {
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu);
      } else {
        document.body.removeEventListener('click', this.closeMenu);
      }
    }
  }
};
</script>
<style  scoped>
/*.contentmenu {
  width: 160px;
  position: fixed;
  z-index: 99999;
  list-style: none;
  -webkit-box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 0;
  background: #27343e;
  color: #bcc9d4;
  .contentmenu__item {
    z-index: 10000;
    list-style: none;
    padding: 8px 12px;
    cursor: pointer;
    position: relative;
    font-size: 12px;
  }
  .iconfont {
    font-size: 12px;
  }
}*/
</style>
