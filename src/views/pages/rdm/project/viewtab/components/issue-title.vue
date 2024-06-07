<template>
  <div class="action-group">
    <span class="action-item" style="padding-right: 0px !important"><AppIcon :appType="issueData.appType" :appColor="issueData.appColor"></AppIcon></span>
    <span class="action-item" @click="editTitle()">
      <strong v-if="!isEditing" class="fz16">[{{ issueData.id }}]{{ issueData.name }}</strong>
      <TsFormInput
        v-else
        ref="input"
        v-model="issueName"
        :validateList="[{ name: 'required', message: ' ' }]"
        border="border"
        :maxlength="50"
        :width="350"
        @on-keydown="saveIssue"
        @on-blur="saveIssue()"
      ></TsFormInput>
    </span>
    <span v-if="issueData.status && issueData.statusLabel" class="action-item"><IssueStatus :issueData="issueData"></IssueStatus></span>
    <span class="action-item"><IssueFavorite :issueId="issueData.id"></IssueFavorite></span>
    <span class="action-item">
      <Dropdown>
        <span class="tsfont-attachment cursor text-grey"></span>
        <DropdownMenu slot="list">
          <DropdownItem @click.native="copy('#spnId' + issueData.id)">
            {{ $t('term.rdm.copyissueid') }}
            <span :id="'spnId' + issueData.id" style="display: none">{{ issueData.id }}</span>
          </DropdownItem>
          <DropdownItem @click.native="copy('#spnCommitWord' + issueData.id)">
            {{ $t('term.rdm.copycommitword') }}
            <span :id="'spnCommitWord' + issueData.id" style="display: none">#[{{ issueData.id }}]{{ issueData.name }} {{ url }}</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppIcon: () => import('@/views/pages/rdm/project/viewtab/components/app-icon.vue'),
    IssueStatus: () => import('@/views/pages/rdm/project/viewtab/components/issue-status.vue'),
    IssueFavorite: () => import('@/views/pages/rdm/project/viewtab/components/issue-favorite.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    issueData: { type: Object },
    readonly: { type: Boolean, default: false }
  },
  data() {
    return {
      isEditing: false,
      issueName: null,
      isSaving: false
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
    copy(id) {
      this.$utils.copyText(id);
    },
    editTitle() {
      if (!this.readonly) {
        this.isEditing = true;
        this.issueName = this.issueData.name;
        setTimeout(() => {
          this.$refs['input'].focus();
        }, 300);
      }
    },
    saveIssue(event) {
      if ((!event || event.keyCode === 13) && this.$refs['input'].valid()) {
        if (!this.isSaving) {
          this.isSaving = true;
          this.$api.rdm.issue.saveIssue(this.issueData).then(res => {
            if (res.Status === 'OK') {
              this.isEditing = false;
              this.issueData.name = this.issueName;
            }
          }).finally(() => {
            this.isSaving = false;
          });
        }
      } else if (event && event.keyCode === 27) {
        this.isEditing = false;
      }
    }
  },
  filter: {},
  computed: {
    url() {
      return window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/' + TENANT + '/rdm.html#/' + this.issueData.appType + '-detail/' + this.issueData.projectId + '/' + this.issueData.appId + '/' + this.issueData.id;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
