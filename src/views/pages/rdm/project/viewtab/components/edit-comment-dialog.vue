<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-ok="save"
    @on-close="close"
  >
    <template v-slot>
      <div>
        <TsCkeditor ref="editor" v-model="comment.content" :validateList="['required']"></TsCkeditor>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve)
  },
  props: {
    comment: {type: Object}
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        title: this.$t('dialog.title.edittarget', {'target': this.$t('page.comment')}),
        isShow: true,
        maskClose: false
      }
    };
  },
  beforeCreate() {},
  created() {
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
    save() {
      const editor = this.$refs['editor'];
      if (editor && editor.valid()) {
        this.$api.rdm.issue.saveComment(this.comment).then(res => {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
