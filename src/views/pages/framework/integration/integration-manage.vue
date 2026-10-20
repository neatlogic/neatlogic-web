<template>
  <div>
    <TsContain border="border">
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="addIntegration()">{{ $t('page.config') }}</span>
          <span class="action-item tsfont-upload" @click="uploadAction()">{{ $t('page.import') }}</span>
          <span
            v-if="!isExportIntegration"
            :class="{ 'text-disabled': !selectList || selectList.length == 0 }"
            class="action-item tsfont-download"
            @click="exportList()"
          >{{ $t('page.export') }}</span>
          <span v-else class="action-item">
            <Icon type="ios-loading" size="16" class="loading"></Icon>
          </span>
          <span v-auth="['ADMIN']" class="action-item"><AuditConfig auditName="INTEGRATION-AUDIT"></AuditConfig></span>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher v-model="searchValue" v-bind="searchConfig" @change="changeSearch"></CombineSearcher>
      </template>
      <div slot="content" ref="maintable">
        <TsTable
          v-if="integrationData"
          :theadList="theadList"
          v-bind="integrationData"
          @getSelected="getSelected"
          @changeCurrent="updatePage"
          @changePageSize="updatePagesize"
        >
          <template slot="isActive" slot-scope="{ row }">
            <span v-if="row.isActive" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template slot="name" slot-scope="{ row }">
            <span class="text-href" @click.stop="editIntegration(row.uuid)">{{ row.name }}</span>
            <span
              v-clipboard="getIntegrationLink(row.uuid)"
              v-clipboard:success="clipboardSuc"
              :title="$t('term.framework.clicktocopyuuid')"
              class="text-primary tsfont-copy"
              @click.stop
            ></span>
          </template>
          <template slot="referenceCount" slot-scope="{ row }">
            <ReferenceSelect
              v-if="row.referenceCount"
              :isTable="true"
              calleeType="integration"
              :uuid="row.uuid"
              :referenceCount="row.referenceCount"
            ></ReferenceSelect>
            <span v-else>-</span>
          </template>
          <template slot="executeAuthorityVoList" slot-scope="{ row }">
            <div v-if="row.executeAuthorityVoList && row.executeAuthorityVoList.length">
              <Tag v-for="(item, index) in getVisibleAuthorityList(row.executeAuthorityVoList)" :key="`${item.uuid}-${index}`">
                <i :class="getAuthorityIcon(item)" class="mr-xs"></i>
                <span>{{ item.name }}</span>
              </Tag>
              <Poptip v-if="row.executeAuthorityVoList.length > authorityShowNum" transfer placement="bottom-start">
                <span class="tsfont-option-horizontal text-tip-active authority-more"></span>
                <div slot="content">
                  <ul>
                    <li
                      v-for="(item, index) in getHiddenAuthorityList(row.executeAuthorityVoList)"
                      :key="`${item.uuid}-hidden-${index}`"
                      class="pb-xs"
                    >
                      <Tag>
                        <i :class="getAuthorityIcon(item)" class="mr-xs"></i>
                        <span>{{ item.name }}</span>
                      </Tag>
                    </li>
                  </ul>
                </div>
              </Poptip>
            </div>
            <span v-else>-</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li @click.stop>
                  <TsFormSwitch
                    v-model="row.isActive"
                    :true-value="1"
                    :false-value="0"
                    :disabled="row.referenceCount > 0 ? true : false"
                    showStatus
                    @on-change="toggleIntegrationActive(row)"
                  ></TsFormSwitch>
                </li>
                <li class="tsfont-edit icon" @click.stop="editIntegration(row.uuid)">{{ $t('page.edit') }}</li>
                <li v-if="row.hasHelp == 1" class="tsfont-question-o" @click="integrationHelpUuid = row.uuid">{{ $t('page.help') }}</li>
                <li class="tsfont-formstaticlist" @click="integrationAuditUuid = row.uuid">{{ $t('term.process.callrecord') }}</li>
                <li class="tsfont-user" @click="openIntegrationAuth(row)">{{ $t('page.executeauthority') }}</li>
                <li class="tsfont-download" @click="exportRow(row)">{{ $t('page.export') }}</li>
                <li class="tsfont-trash-o" :class="{ 'text-disabled': row.referenceCount > 0 }" @click="delIntegration(row)">{{ $t('page.delete') }}</li>
                <li class="tsfont-copy" @click="copyIntegration(row.uuid)">{{ $t('page.copy') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <IntegrationHelp :uuid="integrationHelpUuid" @close="integrationHelpUuid = null"></IntegrationHelp>
    <IntegrationEdit
      v-if="isIntegrationDialogShow"
      :isCopy="isCopy"
      :uuid="integrationUuid"
      @close="closeIntegrationDialog"
    ></IntegrationEdit>
    <IntegrationAudit v-if="integrationAuditUuid" :uuid="integrationAuditUuid" @close="integrationAuditUuid = null"></IntegrationAudit>
    <IntegrationAuthDialog
      v-if="integrationAuthConfig"
      :integration="integrationAuthConfig"
      @close="closeIntegrationAuthDialog"
    ></IntegrationAuthDialog>
    <UploadDialog
      ref="uploadDialog"
      :actionUrl="actionUrl"
      :formatList="formatList"
      :isValid="true"
      @on-success="searchIntegration()"
    />
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
import clipboard from '@/resources/directives/clipboard.js';
export default {
  name: '',
  directives: { clipboard },
  components: {
    TsContain: () => import('@/resources/components/TsContain/TsContain.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    IntegrationEdit: () => import('./integration-edit.vue'),
    IntegrationHelp: () => import('./integration-help.vue'),
    IntegrationAudit: () => import('./integration-audit.vue'),
    IntegrationAuthDialog: () => import('./integration-auth-dialog.vue'),
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    UploadDialog: () => import('@/resources/components/UploadDialog/UploadDialog.vue'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue')
  },
  mixins: [download],
  props: {},
  data() {
    return {
      integrationHelpUuid: null,
      isIntegrationDialogShow: false,
      integrationUuid: null,
      integrationAuditUuid: null,
      // 搜索条件独立于分页，避免组合搜索清理未知字段时丢失页码和每页条数。
      searchValue: {},
      searchConfig: {
        labelPosition: 'left',
        searchMode: 'auto',
        searchList: [{
          type: 'select',
          name: 'handler',
          label: this.$t('page.component'),
          multiple: false,
          search: true,
          clearable: true,
          url: '/api/rest/integration/handler/list',
          textName: 'name',
          valueName: 'handler',
          transfer: true
        }]
      },
      searchParam: { currentPage: 1, pageSize: 20 },
      theadList: [
        {
          key: 'selection',
          multiple: true
        },
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.isactive'),
          key: 'isActive'
        },
        {
          title: this.$t('page.method'),
          key: 'method'
        },
        {
          title: this.$t('page.targetaddress'),
          key: 'url'
        },
        {
          title: this.$t('page.executeauthority'),
          key: 'executeAuthorityVoList'
        },
        {
          title: this.$t('page.component'),
          key: 'handlerName'
        },
        {
          title: this.$t('page.referencecount'),
          key: 'referenceCount'
        },
        {
          title: '',
          key: 'action',
          align: 'right'
        }
      ],
      integrationData: null,
      actionUrl: BASEURLPREFIX + '/api/binary/integration/import', //导入地址
      formatList: ['pak'], //导入文件格式
      exportType: '', //导出类型
      selectList: [],
      isCopy: false,
      isExportIntegration: false,
      integrationAuthConfig: null,
      authorityShowNum: 3
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.integrationUuid = this.$route.query.integrationUuid || null;
    this.isIntegrationDialogShow = !!this.$route.query.isIntegrationDialogShow;
    this.isCopy = false;
    this.searchIntegration();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    clipboardSuc() {
      this.$Message.success(this.$t('term.framework.successcopyintegrationuuid'));
    },
    getIntegrationLink(uuid) {
      const protocal = window.location.protocol;
      const host = window.location.host;
      //return protocal + '//' + host + BASEURLPREFIX + '/api/rest/integration/run/' + uuid;
      return uuid;
    },
    change() {
      this.selectList = [];
    },
    toggleIntegrationActive: function(integration) {
      this.$api.framework.integration.toggleIntegrationActive({ uuid: integration.uuid, isActive: integration.isActive }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    closeIntegrationDialog: function(needRefresh) {
      this.isIntegrationDialogShow = false;
      this.integrationUuid = null;
      this.isCopy = false;
      if (needRefresh) {
        this.searchIntegration();
      }
    },
    closeIntegrationAuditDialog: function() {
      this.integrationAuditUuid = null;
    },
    closeIntegrationHelpDialog: function() {
      this.integrationHelpUuid = null;
    },
    addIntegration: function() {
      this.integrationUuid = null;
      this.isIntegrationDialogShow = true;
      this.isCopy = false;
    },
    changeSearch(value) {
      // 每次替换已提交条件，移除标签或清空后不能继续携带旧组件、旧关键字。
      const conditions = {};
      ['keyword', 'handler'].forEach(key => {
        if (value && typeof value[key] === 'string' && value[key] !== '') conditions[key] = value[key];
      });
      this.searchValue = conditions;
      this.updatePage(1);
    },
    updatePagesize(pageSize) {
      this.searchParam.currentPage = 1;
      this.searchParam.pageSize = pageSize || 20;
      this.searchIntegration();
    },
    updatePage(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.searchIntegration();
    },
    searchIntegration() {
      // 查询仅从事件入口触发，不再通过深度监听重复请求；刷新保留当前筛选和分页。
      const params = { ...this.searchParam, ...this.searchValue };
      this.$api.framework.integration.searchIntegration(params).then(res => {
        if (res.Status == 'OK') {
          this.integrationData = res.Return;
        }
      });
    },
    editIntegration: function(uuid) {
      this.integrationUuid = uuid;
      this.isCopy = false;
      this.isIntegrationDialogShow = true;
    },
    getIntegrationHelp: function(uuid) {
      this.integrationHelpUuid = uuid;
    },
    delIntegration: function(row) {
      if (row.referenceCount > 0) {
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: row.name }),
        btnType: 'error',
        'on-ok': vnode => {
          let param = {
            uuid: row.uuid
          };
          this.$api.framework.integration.deleteIntegration(param).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.searchIntegration();
            }
          });
        },
        'on-cancel': vnode => {}
      });
    },
    uploadAction() {
      this.$refs.uploadDialog.showDialog();
    },
    exportRow(row) {
      this.exportType = 'batch';
      let param = {
        url: 'api/binary/integration/export',
        params: {
          uuidList: [row.uuid]
        }
      };
      this.download(param);
    },
    getSelected(indexList, itemList) {
      if (itemList.length > 0) {
        itemList = itemList.map(item => {
          return item.uuid;
        });
        this.selectList = itemList;
      } else {
        this.selectList = [];
      }
    },
    exportList() {
      if (!this.selectList || this.selectList.length == 0) {
        return;
      }
      let param = {
        url: 'api/binary/integration/export',
        params: {
          uuidList: this.selectList
        },
        changeStatus: status => {
          if (status == 'start') {
            this.isExportIntegration = true;
          } else if (status == 'success' || status == 'error') {
            this.isExportIntegration = false;
          }
        }
      };
      this.download(param);
      this.selectList = [];
    },
    copyIntegration(uuid) {
      this.integrationUuid = uuid;
      this.isCopy = true;
      this.isIntegrationDialogShow = true;
    },
    getAuthorityIcon(item) {
      const iconMap = {
        common: 'tsfont-common',
        user: 'tsfont-user',
        team: 'tsfont-team',
        role: 'tsfont-role'
      };
      return iconMap[item && item.initType] || 'tsfont-user';
    },
    getVisibleAuthorityList(list) {
      return list.slice(0, this.authorityShowNum);
    },
    getHiddenAuthorityList(list) {
      return list.slice(this.authorityShowNum);
    },
    openIntegrationAuth(row) {
      this.$api.framework.integration.getIntegrationByUuid({ uuid: row.uuid }).then(res => {
        if (res.Status == 'OK') {
          this.integrationAuthConfig = {
            uuid: row.uuid,
            name: row.name,
            authorityList: res.Return.executeAuthorityList || []
          };
        }
      });
    },
    closeIntegrationAuthDialog(needRefresh) {
      this.integrationAuthConfig = null;
      if (needRefresh) {
        this.searchIntegration();
      }
    }
  },
  filter: {},
  computed: {}
};
</script>
<style lang="less">
.authority-more {
  padding: 0 8px;
}
</style>
