<template>
  <div>
    <div v-if="!isEditing">
      <div v-if="!readonly" style="text-align: right">
        <span class="cursor text-grey tsfont-edit" @click="editContent">{{ $t('dialog.title.edittarget', { target: $t('page.content') }) }}</span>
      </div>
      <div v-html="issueData.content"></div>
    </div>
    <div v-else>
      <ContentHandler :issueData="issueData" @cancel="cancelEdit" @save="saveContent"></ContentHandler>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ContentHandler: resolve => require(['@/views/pages/rdm/project/content-handler/content-handler.vue'], resolve)
  },
  props: {
    issueData: { type: Object },
    mode: { type: String, default: 'read' },
    readonly: { type: Boolean, default: false }
  },
  data() {
    return {
      isEditing: this.mode === 'edit'
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
    editContent() {
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    saveContent(issueData) {
      this.$api.rdm.issue.saveIssue(issueData).then(res => {
        this.isEditing = false;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
