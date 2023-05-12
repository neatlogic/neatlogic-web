<template>
  <TsDialog
    :title="title"
    type="modal"
    :isShow="isShow"
    :hasFooter="false"
    maskClose
    @on-close="close"
  >
    <template v-slot>
      <div
        v-imgViewer
        class="content"
        v-html="content"
      >
      </div>
    </template>
  </TsDialog>
</template>

<script>
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: 'NoticePreview',
  directives: { imgViewer },
  props: {
    isShow: {type: Boolean, default: false},
    notice: {type: Object, default: () => {}}
  },
  data() {
    return {
      title: '',
      content: ''
    };
  },
  mounted() {
    if (!this.$utils.isEmpty(this.notice)) {
      this.getNoticeDetail(this.notice);
    }
  },
  methods: {
    async getNoticeDetail(notice) {
      const res = await this.$api.framework.notice.get(notice.id);
      this.title = res.Return.title;
      this.content = res.Return.content;
    },
    close() {
      this.$emit('update:notice', {});
      this.$emit('update:isShow', false);
    }
  }
};
</script>

<style lang="less">
</style>
