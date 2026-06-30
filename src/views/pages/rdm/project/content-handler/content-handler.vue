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
      :projectId="finalProjectId"
      :ckeditorParams="finalCkeditorParams"
    ></component>
    <div v-else>
      <div v-if="editMode === 'edit'">
        <TsCkeditor
          v-if="autoSave"
          v-model="issueData.content"
          :params="finalCkeditorParams"
        ></TsCkeditor>
        <TsCkeditor
          v-else
          v-model="content"
          :params="finalCkeditorParams"
        ></TsCkeditor>
      </div>
      <TsCkeditor
        v-else
        :readonly="true"
        :value="issueData.content"
      ></TsCkeditor>
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
  directives: {},
  components: {
    ...handlers,
    TsCkeditor: () => import('@/resources/plugins/TsCkeditor/TsCkeditor.vue')
  },
  props: {
    issueData: { type: Object },
    projectId: { type: Number },
    ckeditorParams: { type: Object },
    autoSave: { type: Boolean, default: true },
    mode: { type: String, default: 'read' },
    readonly: { type: Boolean, default: false },
    saveHandler: { type: Function }
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
    async saveIssue() {
      const oldContent = this.issueData.content;
      const component = this.$refs['component'];
      if (component && component.save) {
        component.save();
      } else {
        this.$set(this.issueData, 'content', this.content);
      }
      const saveData = this.getSaveData();
      if (this.saveHandler) {
        const isSaved = await this.saveHandler(saveData);
        if (isSaved === false) {
          this.$set(this.issueData, 'content', oldContent);
          return;
        }
        this.cancelEdit();
        return;
      }
      this.$api.rdm.issue.saveIssue(saveData).then(res => {
        if (res.Status === 'OK') {
          this.cancelEdit();
        }
      });
    },
    getSaveData() {
      return {
        id: this.issueData.id,
        appId: this.issueData.appId,
        content: this.issueData.content
      };
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
