<template>
  <TsDialog
    :isShow.sync="showDialog"
    v-bind="dialogConfig"
  >
    <div>
      <div>
        <i class="tsfont-danger-o text-warning icon-fz"></i>
        <span v-if="type == 'delete' && tipText" class="title-fz">{{ $t('dialog.content.deleteconfirm', {target: $t('term.autoexec.customtool')}) }}</span>
        <span v-if="type == 'delete' && !tipText" class="title-fz">{{ $t('dialog.content.deleteconfirm', {target: $t('page.versions')}) }}</span>
        <span v-else-if="type == 'compare' || type=='test'" class="title-fz">{{ $t('dialog.content.saveconfirm') }}</span>
      </div>
      <div v-if="tipText" class="text-tip content-tip">{{ tipText }}</div>
    </div>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button @click="close">{{ $t('page.cancel') }}</Button>
        <Button v-if="type == 'delete'" type="error" @click="delData">{{ $t('page.confirm') }}</Button>
        <Button v-else-if="type == 'compare'" type="primary" @click="saveCompare">{{ $t('dialog.title.saveandtarget', {target: $t('page.compare')}) }}</Button>
        <Button v-else-if="type == 'test'" type="primary" @click="test">{{ $t('dialog.title.saveandtarget', {target: $t('page.test')}) }}</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    isShow: { type: Boolean, default: false },
    id: { type: [String, Number], default: null }, //工具ID
    versionId: { type: [String, Number], default: null }, //版本id
    type: { //类型：delete 、compare
      type: String,
      default: null
    },
    tipText: { //提示信息
      type: String,
      default: null
    }
  },
  data() {
    return {
      showDialog: false,
      dialogConfig: {
        // isShow: true,
        hasHeader: false,
        showCloseIcon: false
      },
      versionStatus: 'passed'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$route.query.status && (this.versionStatus = this.$route.query.status);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('update:isShow', false);
    },
    saveCompare() {
      this.close();
      this.$emit('saveData', 'compare');
    },
    delData() {
      let param = {
        versionId: this.versionId
      };
      this.$api.autoexec.script.deleteScript(param).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          this.$router.push({ 
            path: '/script-manage',
            query: {
              status: this.versionStatus
            }
          });
        }
      });
    },
    test() {
      this.close(); 
      this.$emit('saveData', 'test');
    }
  },
  computed: {},
  watch: {
    isShow: {
      handler(val) {
        this.showDialog = val;
      },
      immediate: true
    }
  }
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
