<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsCodemirror
            v-model="codeMirrorContent"
            codeMode="xml"
          ></TsCodemirror>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    filePath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogSetting: {
        title: this.title,
        type: 'slider',
        width: 'medium',
        isShow: true,
        hasFooter: false
      },
      codeMirrorContent: '',
      loadingShow: true
    };
  },
  beforeCreate() {},
  created() {
    if (this.filePath) {
      this.searchParam(this.filePath);
    } else {
      this.loadingShow = false;
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
    closeDialog() {
      this.$emit('close');
    },
    searchParam(filePath) {
      this.loadingShow = true;
      this.$api.deploy.webhook.getIntegrationAuditDetail({filePath: filePath}).then((res) => {
        if (res && res.Status == 'OK') {
          this.codeMirrorContent = res.Return ? res.Return.result : '';
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
