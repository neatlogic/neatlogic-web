<template>
  <div>
    <div v-if="oldStatusData || statusList.length > 0" class="mb-md">
      <IssueStatus
        v-if="oldStatusData"
        :statusData="oldStatusData"
        :actived="targetStatus === oldStatusData.id"
        @click="
          status => {
            targetStatus = status;
          }
        "
      ></IssueStatus>
      <Divider v-if="oldStatusData && statusList.length > 0" type="vertical" />
      <IssueStatus
        v-for="(status, index) in statusList"
        :key="index"
        :statusData="status"
        :actived="targetStatus === status.id"
        @click="
          status => {
            changeTargetStatus(status);
          }
        "
      ></IssueStatus>
    </div>
    <div v-else class="text-grey">{{ $t('term.rdm.pleasesetstatus') }}</div>
    <div v-if="statusRel" class="mb-md">
      <TsFormItem
        v-for="(attr, index) in requiredAttrList"
        :key="index"
        class="relative"
        :label="attr.label"
        labelPosition="left"
        :required="true"
        :labelWidth="80"
      >
        <AttrHandler
          v-if="attr._isReady"
          ref="attrHandler"
          :attrConfig="attr"
          :issueData="issueData"
        ></AttrHandler>
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
    AttrHandler: resolve => require(['@/views/pages/rdm/project/attr-handler/attr-handler.vue'], resolve)
  },
  props: {
    appId: { type: Number },
    issueData: { type: Object }
  },
  data() {
    return {
      attrList: [],
      statusRel: null,
      statusList: [],
      oldStatusData: null,
      targetStatus: this.issueData.status
    };
  },
  beforeCreate() {},
  created() {
    if (this.issueData.status) {
      this.oldStatusData = {
        id: this.issueData.status,
        label: this.issueData.statusLabel,
        color: this.issueData.statusColor
      };
    }
    this.searchAppAttr();
    this.getStatusByAppId();
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
    //验证所有组件，此方法供外部调用
    valid() {
      let isValid = true;
      if (this.$refs['attrHandler']) {
        this.$refs['attrHandler'].forEach(handler => {
          if (!handler.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    },
    getStatusByAppId() {
      this.$api.rdm.status.getStatusByAppId(this.appId, this.issueData.status).then(res => {
        this.statusList = res.Return;
      });
    },
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
    changeTargetStatus(targetStatusId) {
      this.targetStatus = targetStatusId;
      this.$set(this.issueData, 'status', targetStatusId);
      this.statusRel = null;
      if (this.oldStatusData && this.oldStatusData.id != targetStatusId) {
        this.isTransferReady = false;
        this.$api.rdm.status
          .getStatusRel({
            appId: this.appId,
            fromStatusId: this.oldStatusData.id,
            toStatusId: targetStatusId
          })
          .then(res => {
            this.statusRel = res.Return;
            if (this.statusRel) {
              this.isTransferReady = true;
            } else {
              this.$Notice.error({
                desc: this.$t('messge.rdm.statusrelerror')
              });
            }
          });
      }
    }
  },
  filter: {},
  computed: {
    requiredAttrList() {
      if (this.statusRel && this.statusRel.config && this.statusRel.config.requiredAttrList && this.statusRel.config.requiredAttrList.length > 0 && this.attrList && this.attrList.length > 0) {
        const requiredAttrList = [];
        this.attrList.forEach(attr => {
          if (this.statusRel.config.requiredAttrList.find(ra => ra.attrId === attr.id)) {
            attr.isRequired = 1;
            requiredAttrList.push(attr);
          }
        });
        return requiredAttrList;
      }
      return [];
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
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
