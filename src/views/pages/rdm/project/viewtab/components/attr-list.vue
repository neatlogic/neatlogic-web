<template>
  <div>
    <TsFormItem
      v-for="(attr, index) in attrList"
      :key="index"
      class="relative"
      :label="attr.label"
      labelPosition="top"
      :labelWidth="120"
    >
      <div v-if="!issueData.isEnd">
        <AttrHandler
          v-if="attr._isReady"
          ref="attrHandler"
          border="none"
          :projectId="projectId"
          :readonly="editingField != 'attr_' + attr.id"
          :attrConfig="attr"
          :issueData="issueDataLocal"
          @click.native="activeController('attr_' + attr.id)"
        ></AttrHandler>
        <div v-if="editingField == 'attr_' + attr.id" class="controller-btn">
          <span v-if="!isEditing" class="tsfont-check text-primary mr-xs" @click="confirmUpdate('attr_' + attr.id)"></span>
          <span v-if="!isEditing" class="tsfont-close text-primary" @click="cancelUpdate('attr_' + attr.id)"></span>
          <Icon
            v-if="isEditing"
            type="ios-loading"
            size="16"
            class="loading"
          ></Icon>
        </div>
      </div>
      <div v-else><AttrViewer v-if="attr._isReady" :attrConfig="attr" :issueData="issueDataLocal"></AttrViewer></div>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    AttrViewer: resolve => require(['@/views/pages/rdm/project/attr-viewer/attr-viewer.vue'], resolve),
    AttrHandler: resolve => require(['@/views/pages/rdm/project/attr-handler/attr-handler.vue'], resolve)
  },
  props: {
    projectId: { type: Number },
    appId: { type: Number },
    issueData: { type: Object }
  },
  data() {
    return {
      issueDataLocal: null,
      attrList: [],
      editingField: null,
      isEditing: false,
      catalogConfig: {
        url: 'api/rest/rdm/catalog/search',
        params: { appId: this.appId },
        valueName: 'id',
        textName: 'name',
        showPath: true
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchAppAttr();
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
    searchAppAttr() {
      if (this.appId) {
        this.$api.rdm.app.searchAppAttr({ appId: this.appId, isActive: 1 }).then(res => {
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
    activeController(field) {
      if (this.editingField && this.editingField != field) {
        this.cancelUpdate(this.editingField);
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
    confirmUpdate(field) {
      this.isEditing = true;
      this.$api.rdm.issue.saveIssue(this.issueDataLocal).then(res => {
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
  computed: {},
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
