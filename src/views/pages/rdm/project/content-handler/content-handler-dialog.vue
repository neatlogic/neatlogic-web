<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsCkeditor
            v-model="content"
            :params="finalCkeditorParams"
          ></TsCkeditor>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCkeditor: () => import('@/resources/plugins/TsCkeditor/TsCkeditor.vue')
  },
  props: {
    issueData: { type: Object },
    projectId: { type: Number },
    ckeditorParams: { type: Object },
    title: { type: String, default: '' }
  },
  data() {
    return {
      dialogSetting: {
        title: this.title,
        type: 'slider',
        width: 'large',
        isShow: true,
        okText: this.$t('page.save'),
        cancelText: this.$t('page.cancel')
      },
      content: this.issueData.content
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
    okDialog() {
      this.$api.rdm.issue.saveIssue({
        id: this.issueData.id,
        appId: this.issueData.appId,
        content: this.content
      }).then(res => {
        if (res.Status === 'OK') {
          this.closeDialog(true);
        }
      });
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', {needRefresh: needRefresh, content: this.content});
    }
  },
  filter: {},
  computed: {
    finalProjectId() {
      return this.projectId || (this.issueData && this.issueData.projectId);
    },
    finalCkeditorParams() {
      if (this.ckeditorParams) {
        return this.ckeditorParams;
      }
      const mentionConfig = {};
      if (this.finalProjectId) {
        mentionConfig.extendCondition = { projectId: this.finalProjectId };
      }
      return {
        uploadVideoConfig: { type: 'rdm' },
        mentionConfig
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
::v-deep ol li {
  list-style-type: decimal !important;
}
::v-deep ol {
  padding-left: revert;
}
::v-deep ul li {
  list-style-type: disc !important;
}
::v-deep ul {
  padding-left: revert;
}
</style>
