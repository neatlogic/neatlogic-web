<template>
  <div class="action-group">
    <span class="action-item" style="padding-right: 0px !important;"><AppIcon :appType="issueData.appType" :appColor="issueData.appColor"></AppIcon></span>
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
        <span class="tsfont-attachment cursor text-grey">
        </span>
        <DropdownMenu slot="list">
          <DropdownItem @click.native="copy('#spnId')">{{ $t('term.rdm.copyissueid') }}
            <span id="spnId" style="display:none">{{ issueData.id }}</span>
          </DropdownItem>
          <DropdownItem @click.native="copy('#spnCommitWord')">{{ $t('term.rdm.copycommitword') }}
            <span id="spnCommitWord" style="display:none">#[{{ issueData.id }}]{{ issueData.name }} {{ url }}</span>
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
    AppIcon: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-icon.vue'], resolve),
    IssueStatus: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-status.vue'], resolve),
    IssueFavorite: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-favorite.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    issueData: { type: Object },
    readonly: { type: Boolean, default: false }
  },
  data() {
    return {
      isEditing: false,
      issueName: null
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
        this.issueData.name = this.issueName;
        this.$api.rdm.issue.saveIssue(this.issueData).then(res => {
          if (res.Status === 'OK') {
            this.isEditing = false;
          }
        });
      } else if (event && event.keyCode === 27) {
        this.isEditing = false;
      }
    }
  },
  filter: {},
  computed: {
    url() {
      return window.location.href;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
