<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div class="bg-op padding radius-md">
          <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
          <TsCodemirror
            v-if="logContent"
            v-model="logContent"
            codeMode="xml"
            :isReadOnly="true"
          ></TsCodemirror>
          <NoData v-else></NoData>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 日志详情
  components: {
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve)
  },
  props: {
    filePath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isLoading: true,
      logContent: '',
      dialogSetting: {
        isShow: true,
        hasFooter: false,
        type: 'modal',
        width: 'medium',
        title: this.$t('page.logdetails')
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchLog();
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
    searchLog() {
      if (this.filePath) {
        this.isLoading = true;
        this.$api.framework.file.getFileContentByPath({filePath: this.filePath}).then(res => {
          if (res && res.Status == 'OK') {
            this.logContent = res.Return ? res.Return.content : '';
          }
        }).finally(() => {
          this.isLoading = false;
        });
      } else {
        this.isLoading = false;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
