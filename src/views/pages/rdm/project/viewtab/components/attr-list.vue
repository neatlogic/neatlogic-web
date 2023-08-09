<template>
  <div class="pb-nm">
    <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
    <div v-else>
      <TsFormItem
        v-for="(attr, index) in finalAttrList"
        :key="index"
        class="relative"
        :label="attr.label"
        labelPosition="top"
        :labelWidth="120"
      >
        <div v-if="attr.id != 0">
          <div v-if="!issueData.isEnd && (projectData.isOwner || projectData.isMember || projectData.isLeader)">
            <AttrHandler
              v-if="attr._isReady"
              ref="attrHandler"
              v-click-outside="
                (el, binding, vnode) => {
                  handleClickOutside(attr.id);
                }
              "
              border="none"
              :projectId="projectId"
              :readonly="editingField != 'attr_' + attr.id"
              :attrConfig="attr"
              :issueData="issueDataLocal"
              @click.native.stop="activeController('attr_' + attr.id)"
            ></AttrHandler>
            <div v-if="editingField == 'attr_' + attr.id" class="controller-btn">
              <!--<span v-if="!isEditing" class="tsfont-check text-primary mr-xs" @click="confirmUpdate('attr_' + attr.id)"></span>
              <span v-if="!isEditing" class="tsfont-close text-primary" @click="cancelUpdate('attr_' + attr.id)"></span>
              -->
              <Icon
                v-if="isEditing"
                type="ios-loading"
                size="16"
                class="loading"
              ></Icon>
            </div>
          </div>
          <div v-else><AttrViewer v-if="attr._isReady" :attrConfig="attr" :issueData="issueDataLocal"></AttrViewer></div>
        </div>
        <div v-else>
          <div v-if="attr.type === '_name'" class="overflow">
            {{ issueData.name }}
          </div>
          <IssueStatus v-else-if="attr.type === '_status'" :issueData="issueData"></IssueStatus>
          <span v-else-if="attr.type === '_createuser'"><UserCard :uuid="issueData.createUser"></UserCard></span>
          <span v-else-if="attr.type === '_createdate'">{{ issueData.createDate | formatDate('yyyy-mm-dd') }}</span>
        </div>
      </TsFormItem>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    IssueStatus: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-status.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    AttrViewer: resolve => require(['@/views/pages/rdm/project/attr-viewer/attr-viewer.vue'], resolve),
    AttrHandler: resolve => require(['@/views/pages/rdm/project/attr-handler/attr-handler.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  directives: {
    clickOutside: {
      bind: function(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
          event.stopPropagation();
          // 检查点击事件是否在元素内部发生，如果在外部，则调用传入的函数
          if (!(el == event.target || el.contains(event.target))) {
            binding.value(event, vnode);
          }
        };
        let parent = vnode.context;
        //由于TsDialog阻止了事件冒泡，为了兼容所有场景需要在每个parent中绑定事件，确保无论点哪都能触发事件。
        while (parent) {
          parent.$el.addEventListener('click', el.clickOutsideEvent);
          parent = parent.$parent;
        }
      },
      unbind: function(el, binding, vnode) {
        let parent = vnode.context;
        while (parent) {
          parent.$el.removeEventListener('click', el.clickOutsideEvent);
          parent = parent.$parent;
        }
      }
    }
  },
  props: {
    projectId: { type: Number },
    appId: { type: Number },
    issueData: { type: Object }
  },
  data() {
    return {
      isLoading: true,
      projectData: {},
      issueDataLocal: null,
      attrList: [],
      editingField: null,
      isEditing: false
    };
  },
  beforeCreate() {},
  async created() {
    this.getProjectById();
    await this.searchAppAttr();
    await this.getAppSetting();
    this.isLoading = false;
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
    handleClickOutside(attrId) {
      if (attrId && this.editingField === 'attr_' + attrId) {
        this.confirmUpdate(this.editingField);
      }
    },
    async getAppSetting() {
      if (this.appId) {
        await this.$api.rdm.app.getAppUserSetting(this.appId).then(res => {
          this.appSetting = res.Return;
          if (this.appSetting && this.appSetting?.config?.attrList && this.appSetting.config.attrList.length > 0 && this.attrList && this.attrList.length > 0) {
            this.appSetting.config.attrList.forEach(attrconf => {
              const attr = this.attrList.find(d => (d.id ? d.id === attrconf.attrId : d.type === attrconf.attrType));
              if (attr) {
                this.$set(attr, 'sort', attrconf.sort);
                this.$set(attr, 'showType', attrconf.showType || 'all');
              }
            });
          }
          this.attrList.forEach(attr => {
            if (!attr.showType) {
              this.$set(attr, 'showType', 'all');
            }
          });
          this.attrList.sort((a, b) => {
            return (a.sort || 0) - (b.sort || 0);
          });
        });
      }
    },
    getProjectById() {
      this.$api.rdm.project.getProjectById(this.projectId).then(res => {
        this.projectData = res.Return;
      });
    },
    async searchAppAttr() {
      if (this.appId) {
        await this.$api.rdm.app.searchAppAttr({ appId: this.appId, isActive: 1, needSystemAttr: 1 }).then(res => {
          this.attrList = res.Return;
          this.attrList.forEach(attr => {
            this.$set(attr, '_isReady', true);
          });
        });
      }
    },
    refreshAttr(attrId) {
      const attr = this.attrList.find(d => d.id === attrId);
      if (attr) {
        this.$set(attr, '_isReady', false);
        this.$nextTick(() => {
          this.$set(attr, '_isReady', true);
        });
      }
    },
    async activeController(field) {
      if (this.editingField && this.editingField != field) {
        await this.confirmUpdate(this.editingField);
      }
      this.editingField = field;
    },
    cancelUpdate(field) {
      this.editingField = null;
      this.issueDataLocal = this.$utils.deepClone(this.issueData);
      if (field && field.startsWith('attr_')) {
        const attrId = parseInt(field.replace('attr_', ''));
        this.refreshAttr(attrId);
      }
    },
    async confirmUpdate(field) {
      this.isEditing = true;
      await this.$api.rdm.issue.saveIssue(this.issueDataLocal).then(res => {
        this.isEditing = false;
        this.editingField = null;
        if (field && field.startsWith('attr_')) {
          const attrId = parseInt(field.replace('attr_', ''));
          this.refreshAttr(attrId);
        }
      });
    }
  },
  filter: {},
  computed: {
    finalAttrList() {
      if (this.attrList) {
        return this.attrList.filter(d => ['all', 'detail'].includes(d.showType));
      }
      return [];
    }
  },
  watch: {
    issueData: {
      handler: function(val) {
        this.issueDataLocal = this.$utils.deepClone(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/views/pages/rdm/public/common.less';
.relative {
  position: relative;
  .controller-btn {
    position: absolute;
    right: 0px;
    bottom: -25px;
    cursor: pointer;
  }
}
</style>
