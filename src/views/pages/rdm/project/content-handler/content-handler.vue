<template>
  <div v-if="isReady">
    <!--<div v-if="editMode == 'read' && !readonly" style="text-align: right">
      <span class="cursor text-grey tsfont-edit" @click="editContent">{{ $t('dialog.title.edittarget', { target: $t('page.content') }) }}</span>
    </div>-->
    <component
      :is="issueData.appType + 'handler'"
      v-if="handlers[issueData.appType + 'handler']"
      ref="component"
      :mode="editMode"
      :autoSave="autoSave"
      :issueData="issueData"
    ></component>
    <div v-else>
      <div v-if="editMode === 'edit'">
        <TsCkeditor v-if="autoSave" v-model="issueData.content"></TsCkeditor>
        <TsCkeditor v-else v-model="content"></TsCkeditor>
      </div>
      <div v-else v-html="issueData.content"></div>
    </div>
    <div v-if="editMode === 'edit' && !autoSave" class="mt-md" style="text-align: right">
      <Button class="mr-md" type="primary" @click="saveIssue()">{{ $t('page.confirm') }}</Button>
      <Button @click="cancelEdit()">{{ $t('page.cancel') }}</Button>
    </div>
  </div>
</template>
<script>
import * as handlers from './index.js';

export default {
  name: '',
  components: {
    ...handlers,
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve)
  },
  props: {
    issueData: { type: Object },
    autoSave: { type: Boolean, default: true },
    mode: { type: String, default: 'read' },
    readonly: { type: Boolean, default: false }
  },
  data() {
    return {
      isReady: true, //用于刷新所有数据
      handlers: handlers,
      content: this.issueData.content,
      editMode: this.mode
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
      this.editMode = 'edit';
    },
    cancelEdit() {
      this.editMode = 'read';
      this.isReady = false;
      this.$nextTick(() => {
        this.isReady = true;
      });
      this.$emit('cancel');
    },
    saveIssue() {
      const component = this.$refs['component'];
      if (component && component.save) {
        component.save();
      } else {
        this.$set(this.issueData, 'content', this.content);
      }
      this.$api.rdm.issue.saveIssue(this.issueData).then(res => {
        if (res.Status === 'OK') {
          this.cancelEdit();
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    mode: {
      handler: function(val) {
        this.editMode = val;
      }
    },
    isReady: {
      handler: function(val) {
        if (val) {
          this.content = this.issueData.content;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ ol li {
  list-style-type: decimal !important;
}
/deep/ ol{
  padding-left: revert;
}
/deep/ ul li {
  list-style-type: disc !important;
}
/deep/ ul{
  padding-left: revert;
}
</style>
