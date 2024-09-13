<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsCkeditor v-model="content"></TsCkeditor>
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
      this.$api.rdm.issue.saveIssue({...this.issueData, content: this.content}).then(res => {
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
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
/deep/ ol li {
  list-style-type: decimal !important;
}
/deep/ ol {
  padding-left: revert;
}
/deep/ ul li {
  list-style-type: disc !important;
}
/deep/ ul {
  padding-left: revert;
}
</style>
