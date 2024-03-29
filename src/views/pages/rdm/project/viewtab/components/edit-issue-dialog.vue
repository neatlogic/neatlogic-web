<template>
  <TsDialog v-bind="dialogConfig" @on-ok="saveIssue" @on-close="close">
    <template v-slot>
      <div>
        <div class="mb-md">
          <TsRow :gutter="20">
            <Col span="18">
              <TsFormItem :label="$t('page.title')" labelPosition="top" :required="true">
                <TsFormInput
                  ref="issueName"
                  v-model="issueData.name"
                  border="border"
                  :maxlength="50"
                  :validateList="[{ name: 'required', message: ' ' }]"
                ></TsFormInput>
              </TsFormItem>
            </Col>
            <Col span="6">
              <TsFormItem :label="$t('page.status')" labelPosition="top">
                <Dropdown :transfer="true" placement="bottom-start">
                  <a href="javascript:void(0)">
                    <span v-if="issueData.status" :style="issueData.statusColor ? 'color:' + issueData.statusColor : ''">
                      <strong>{{ issueData.statusLabel }}</strong>
                    </span>
                    <span v-else>{{ $t('form.placeholder.pleaseselect', { target: $t('page.status') }) }}</span>
                    <Icon type="ios-arrow-down"></Icon>
                  </a>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(status, index) in statusList" :key="index" @click.native="selectStatus(status)">
                      <span :style="status.color ? 'color:' + status.color : ''">
                        <strong>{{ status.label }}</strong>
                      </span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TsFormItem>
            </Col>
          </TsRow>
        </div>
        <Divider v-if="attrList && attrList.length > 0" />
        <div v-if="attrList && attrList.length > 0" class="grid">
          <div v-for="(attr, index) in attrList" :key="index">
            <TsFormItem :label="attr.label" labelPosition="top" :required="!!attr.isRequired">
              <AttrHandler
                ref="attrHandler"
                :projectId="app.projectId"
                :attrConfig="attr"
                :issueData="issueData"
              ></AttrHandler>
            </TsFormItem>
          </div>
        </div>
        <Divider />
        <ContentHandler :issueData="issueData" mode="edit"></ContentHandler>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    ContentHandler: resolve => require(['@/views/pages/rdm/project/content-handler/content-handler.vue'], resolve),
    AttrHandler: resolve => require(['@/views/pages/rdm/project/attr-handler/attr-handler.vue'], resolve)
  },
  props: {
    parentId: { type: Number },
    fromId: { type: Number },
    toId: { type: Number },
    relType: {
      type: String,
      validator: function(value) {
        return ['extend', 'relative', 'repeat'].includes(value);
      }
    },
    id: { type: Number },
    app: { type: Object },
    catalogId: { type: Number },
    iteration: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.app.name }) : this.$t('dialog.title.addtarget', { target: this.app.name }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      issueData: {
        appId: this.app.id,
        appType: this.app.type,
        catalog: this.catalogId,
        iteration: this.iteration,
        attrList: []
      },
      catalogData: {},
      statusList: [],
      attrList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getIssueById();
    this.getStatusByAppId();
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
    selectStatus(status) {
      this.$set(this.issueData, 'status', status.id);
      this.$set(this.issueData, 'statusName', status.name);
      this.$set(this.issueData, 'statusColor', status.color);
      this.$set(this.issueData, 'statusLabel', status.label);
    },
    getIssueById() {
      if (this.id) {
        this.$api.rdm.issue.getIssueById(this.id).then(res => {
          this.issueData = res.Return;
        });
      }
    },
    getStatusByAppId() {
      this.$api.rdm.status.getStatusByAppId(this.app.id, { status: 0 }).then(res => {
        this.statusList = res.Return;
        if (this.startStatus && !this.id) {
          this.$set(this.issueData, 'status', this.startStatus.id);
          this.$set(this.issueData, 'statusName', this.startStatus.name);
          this.$set(this.issueData, 'statusColor', this.startStatus.color);
          this.$set(this.issueData, 'statusLabel', this.startStatus.label);
        }
      });
    },
    searchAppAttr() {
      if (this.app.id) {
        this.$api.rdm.app.searchAppAttr({ appId: this.app.id, isActive: 1 }).then(res => {
          this.attrList = res.Return;
        });
      }
    },
    saveIssue() {
      let isValid = true;
      if (!this.$refs['issueName'].valid()) {
        isValid = false;
      }
      const attrList = this.$refs['attrHandler'];
      if (attrList && attrList.length > 0) {
        attrList.forEach(attr => {
          if (!attr.valid()) {
            isValid = false;
          }
        });
      }
      if (isValid) {
        if (this.fromId) {
          this.issueData.fromId = this.fromId;
          this.issueData.relType = this.relType;
        } else if (this.toId) {
          this.issueData.toId = this.toId;
          this.issueData.relType = this.relType;
        } else if (this.parentId) {
          this.issueData.parentId = this.parentId;
        }
        this.$api.rdm.issue.saveIssue(this.issueData).then(res => {
          if (res.Status === 'OK') {
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {
    startStatus() {
      return this.statusList.find(d => d.isStart);
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 20px;
}
</style>
