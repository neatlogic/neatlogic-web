<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/version-center-manage')">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>{{ title }}</template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <Poptip
              v-if="!hasAuth"
              width="400"
              trigger="hover"
              placement="top"
              :content="$t('term.deploy.notversionproductauth')"
            >
              <TsFormSwitch
                v-model="isFreeze"
                :trueValue="1"
                :falseValue="0"
                :disabled="!hasAuth"
              ></TsFormSwitch>
            </Poptip>
            <TsFormSwitch
              v-else
              v-model="isFreeze"
              :showStatus="true"
              :trueValue="1"
              :falseValue="0"
              :trueText="$t('term.deploy.sealplate')"
              :falseText="$t('term.deploy.sealplate')"
              @on-change="isFreeze => switchLockVersion(versionId, isFreeze)"
            ></TsFormSwitch>
          </div>
          <div class="action-item">
            <span class="tsfont-file-single" @click="openProjectDirectoryDialog(versionId)">
              {{ $t('term.deploy.projectdirectory') }}
            </span>
          </div>
          <div class="action-item">
            <span class="tsfont-trash-o" @click="deleteVersion(versionId, versionName, true)">{{ $t('page.delete') }}</span>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <Tabs v-model="tabValue" :animated="false" class="block-tabs">
          <TabPane :label="$t('term.deploy.publishstatus')" name="deployStatus">
            <DeployStatusOverview v-if="tabValue == 'deployStatus'" :envId="envId" :versionId="versionId"></DeployStatusOverview>
          </TabPane>
          <TabPane :label="$t('page.unittest')" name="unitTest">
            <UnitTestOverview v-if="tabValue == 'unitTest'" :versionId="versionId"></UnitTestOverview>
          </TabPane>
          <TabPane :label="$t('page.codescan')" name="codeScan">
            <CodeScanOverview v-if="tabValue == 'codeScan'" :versionId="versionId"></CodeScanOverview>
          </TabPane>
          <TabPane v-if="isShowCodeChange" :label="$t('term.deploy.codechange')" name="codeChange">
            <CodeChangeOverview v-if="tabValue == 'codeChange'" :id="mrId"></CodeChangeOverview>
          </TabPane>
          <TabPane v-if="isShowCveTab && versionId" :label="$t('term.deploy.cveloophole')" name="cveLoophole">
            <CveLoopholeManage :versionId="versionId" @hideTab="(hideTab) => isShowCveTab = hideTab"></CveLoopholeManage>
          </TabPane>
          <TabPane :label="$t('term.rdm.relativerequest')" name="relatedIssues">
            <RelatedIssuesManage v-if="versionId && tabValue == 'relatedIssues'" :versionId="versionId"></RelatedIssuesManage>
          </TabPane>
        </Tabs>
      </template>
    </TsContain>
    <ProjectDirectoryDialog
      v-if="isShowProjectDirectoryDialog"
      :params="projectDirectoryParams"
      :hasAllAuth="hasAuth"
      @close="isShowProjectDirectoryDialog = false"
    ></ProjectDirectoryDialog>
  </div>
</template>
<script>
import versionCenterMixin from './versionCenterMixin.js';
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    ProjectDirectoryDialog: resolve => require(['./project-directory-dialog'], resolve), // 工程目录
    DeployStatusOverview: resolve => require(['./detail/deploy-status-overview'], resolve),
    UnitTestOverview: resolve => require(['./detail/unit-test-overview'], resolve), // 单元测试
    CodeScanOverview: resolve => require(['./detail/code-scan-overview'], resolve), // 代码扫描
    CodeChangeOverview: resolve => require(['./detail/code-change-overview'], resolve), // 代码变更
    CveLoopholeManage: resolve => require(['./detail/cve-loophole-manage'], resolve), // cve漏洞
    RelatedIssuesManage: resolve => require(['./detail/related-issues-manage'], resolve) // 关联需求
  },
  mixins: [versionCenterMixin],
  props: {},
  data() {
    return {
      tabValue: 'deployStatus',
      title: '',
      mrId: null,
      envId: null,
      versionId: null,
      isFreeze: 0, // 封版
      versionName: '', // 版本名称
      hasAuth: false,
      isShowCodeChange: false, // 是否显示代码变更的tab，无数据时，不显示这个tab
      isShowCveTab: true
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query || {};
    if (query && !this.$utils.isEmptyObj(query)) {
      this.title = query.title;
      query.envId && (this.envId = parseInt(query.envId));
      this.versionId = parseInt(query.versionId);
      this.versionName = query.versionName;
      this.isFreeze = parseInt(query.isFreeze);
      this.hasAuth = Boolean(query.hasAuth);
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
