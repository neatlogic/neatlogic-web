<template>
  <div class="sider-container" :style="{ height: height + 'px'}">
    <div class="right-sider bg-op">
      <div v-if="config" class="main">
        <Alert :type="!config.rejectReason ? 'warning' : 'error'">
          <span v-if="!config.rejectReason">
            <span style="display: inline-block;">
              <UserCard v-bind="config.lcuVo"></UserCard>
            </span>
            <span>{{ $t('page.newtarget', {target: $t('term.knowledge.sharefile')}) }}</span>
            <span class="title overflow">{{ config.title }}</span>
            <span style="padding-right: 8px">】，{{ $t('term.knowledge.waitto') }}</span>
            <span v-if="config.reviewerVoList" class="user-group">
              <span v-for="(user, index) in config.reviewerVoList.slice(0, 2)" :key="index" class="user-list">
                <UserCard v-bind="user"></UserCard>
              </span>
            </span>
            <span v-if="config.reviewerVoList && config.reviewerVoList.length > 2">
              <Poptip transfer placement="bottom-start">
                <span class="tsfont-option-horizontal text-tip-active" style="padding: 0 8px;"></span>
                <div slot="content">
                  <ul>
                    <li
                      v-for="(muser, mindex) in config.reviewerVoList.slice(2, config.reviewerVoList.length)"
                      :key="mindex"
                      class="text-action"
                      style="padding-bottom: 8px"
                    >
                      <UserCard v-bind="muser"></UserCard>
                    </li>
                  </ul>
                </div>
              </Poptip>
            </span>
            <span>{{ $t('term.knowledge.approve') }}</span>
          </span>
          <span v-else>
            <span style="display: inline-block;">
              <UserCard v-bind="config.reviewerVo"></UserCard>
            </span>
            <span>{{ $t('term.knowledge.rejected') }}</span>
            <span class="rejectReason overflow" :title="config.rejectReason">{{ config.rejectReason }}</span>
          </span>
        </Alert>
        <KnowledgeEditor
          ref="knowledgeDocumentEditor"
          class="add-document-editor"
          :document-config="config"
          :readonly="true"
          :can-edit-title="false"
          :can-edit-content="false"
          :can-edit-tag="false"
          :show-header="true"
          :show-debug-button="false"
        ></KnowledgeEditor>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    KnowledgeEditor: () => import('@/views/pages/knowledge/category/knowledgeeditor/index.vue')
  },
  filters: {},
  props: {
    config: { type: Object, default: null }
  },
  data() {
    return {
      height: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let _this = this;
    if (this.$el) {
      this.initHeight();
      window.addEventListener('resize', _this.initHeight);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    let _this = this;
    window.removeEventListener('resize', _this.initHeight);
  },
  destroyed() {},
  methods: {
    initHeight() {
      this.height = window.innerHeight - this.$el.getBoundingClientRect().top - 4 - 16;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.sider-container {
  position: relative;
   .title {
    display: inline-block;
    max-width: 300px;
  }
  .rejectReason{
    display: inline-block;
    max-width: 600px;
  }
  .right-sider {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    border-radius: 10px;
    .main {
      height: 100%;
      overflow: auto;
      padding: 16px;
    }
  }
  .text-vertical {
    vertical-align: bottom;
  }
  .user-group{
    display: inline-block;
    .user-list {
      display: inline-block;
      &:not(:last-child) {
        &:after {
          content:'，';
        }
      }
    }
  }
  ::v-deep .add-document-editor {
    .editor-main {
      height: calc(100% - 54px);
      min-height: 320px;
    }
  }
}
</style>
