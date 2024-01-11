<template>
  <div class="action-manage">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template slot="topLeft">
        <div class="action-group">
          <span
            class="action-item tsfont-plus"
            :class="{ 'text-disabled': !hasAuth }"
            :title="!hasAuth ? $t('page.notauthrelationadmin') : ''"
            @click="addAction"
          >{{ $t('term.autoexec.combinationtool') }}</span>
          <span
            class="action-item tsfont-import"
            :class="{ 'text-disabled': !hasAuth }"
            :title="!hasAuth ? $t('page.notauthrelationadmin') : ''"
            @click="uploadAction()"
          >{{ $t('page.import') }}</span>
          <span
            v-if="hasAuth"
            v-download="downloadUrl"
            v-download:prevent="preventDownload"
            class="action-item tsfont-export"
          >{{ $t('page.export') }}</span>
          <span v-else class="action-item tsfont-export text-disabled" :title="$t('page.notauthrelationadmin')">{{ $t('page.export') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="searchAction(1)"></CombineSearcher>
      </template>
      <div slot="content" ref="maintable">
        <Tabs
          v-model="versionStatus"
          class="block-tabs"
          :animated="false"
          @on-click="changeTabValue"
        >
          <TabPane
            v-for="tab in statusList"
            :key="tab.name"
            :label="renderCount(tab)"
            :name="tab.name"
          >
            <div class="padding">
              <TsTable
                v-if="tableData"
                v-model="selectList"
                v-bind="tableData"
                selectedRemain
                keyName="id"
                multiple
                @getSelected="getSelected"
                @changeCurrent="getPageData"
                @changePageSize="changePageSize"
              >
                <template v-slot:isActive="{ row }">
                  <div v-if="row.isActive == 1" class="text-success">{{ $t('page.enable') }}</div>
                  <div v-else class="text-grey">{{ $t('page.disable') }}</div>
                </template>
                <template slot="name" slot-scope="{ row }">
                  <span class="text-href" @click.stop="toEdit(row)">{{ row.name }}</span>
                </template>
                <template slot="description" slot-scope="{ row }">
                  <div class="overflow" style="max-width:400px">{{ row.description }}</div>
                </template>
                <template v-if="versionStatus == 'passed'" slot="action" slot-scope="{ row }">
                  <div class="tstable-action">
                    <ul class="tstable-action-ul">
                      <li :class="{ disable: !row.editable }" :title="!row.editable ? $t('page.notauthrelationadmin') : ''" @click.stop>
                        <TsFormSwitch
                          v-model="row.isActive"
                          :true-value="1"
                          :false-value="0"
                          :disabled="!row.editable ? true : false"
                          showStatus
                          @on-change="toggleAction(row)"
                        ></TsFormSwitch>
                      </li>
                      <li
                        class="icon tsfont-plus"
                        :class="{ disable: !row.executable || !row.isActive }"
                        :title="!row.isActive ? $t('page.notauthrelationadmin') : !row.executable ? $t('page.notauthrelationadmin') : ''"
                        @click.stop="toExecute(row)"
                      >{{ $t('term.autoexec.job') }}</li>
                      <li
                        class="icon tsfont-copy"
                        :title="!hasAuth ? $t('page.notauthrelationadmin') : ''"
                        :class="{ disable: !hasAuth }"
                        @click.stop="copyAction(row)"
                      >{{ $t('page.copy') }}</li>
                      <li :title="!row.isActive ? $t('page.notauthrelationadmin') : !row.executable ? $t('page.notauthrelationadmin') : ''">
                        <!-- 执行作业 -->
                        <TimeJobClickText :id="row.id" :isShow="true" :disable="!row.executable || !row.isActive"></TimeJobClickText>
                      </li>
                      <li class="icon tsfont-change" @click.stop="openRecord(row)">{{ $t('term.autoexec.executionrecord') }}</li>
                      <li
                        class="icon tsfont-trash-o"
                        :title="!row.deletable ? $t('page.notauthrelationadmin') : row.referenceCount > 0 ? $t('page.citetarget', {target: ''}) : ''"
                        :class="{ disable: !row.deletable }"
                        @click.stop="deleteRow(row)"
                      >{{ $t('page.delete') }}</li>
                    </ul>
                  </div>
                </template>
              </TsTable>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </TsContain>
    <TsDialog
      type="modal"
      :isShow.sync="actionFormDialog"
      @on-ok="okAddAction"
      @on-close="closeAction"
    >
      <template v-slot:header>
        <div v-if="isCopy">{{ $t('page.copy') }}{{ $t('term.autoexec.combinationtool') }}</div>
        <div v-else>{{ $t('page.newtarget', {target: $t('term.autoexec.combinationtool')}) }}</div>
      </template>
      <TsForm
        ref="addActionForm"
        v-model="addActionConfig"
        :item-list="addActionForm"
        type="type"
      >
        <template v-slot:notifyPolicy>
          <div class="bg-op radius-sm">
            <NoticeSetting
              ref="noticeSetting"
              layoutType="flexBetween"
              :config="invokeNotifyPolicyConfig"
            ></NoticeSetting>
          </div>
        </template>
      </TsForm>
    </TsDialog>
    <!-- 执行记录 -->
    <RecordList
      v-if="isShowRecord"
      :id="id"
      :isShowRecord="isShowRecord"
      @close="isShowRecord = false"
    ></RecordList>
    <SingleUploadDialog v-if="showUploadDialog" :uploadTooltip="uploadTooltip" @close="closeUploadDialog"></SingleUploadDialog>
  </div>
</template>
<script>
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';
import download from '@/resources/directives/download.js';
import TimeJobClickText from './job/time-job-click-text.vue'; // 添加定时作业
export default {
  name: 'ActionManage',
  components: {
    TimeJobClickText,
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CombineSearcher,
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    RecordList: resolve => require(['./action/record-list'], resolve),
    NoticeSetting: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/notice-setting.vue'], resolve),
    SingleUploadDialog: resolve => require(['./action/single-upload-dialog.vue'], resolve)
  },
  directives: { download },
  filters: {},
  props: {},
  data() {
    let _this = this;
    return {
      loadingShow: false,
      searchParam: {currentPage: 1}, //页码，条数
      id: null,
      theadList: null,
      // theadList: [
      //   { key: 'selection' },
      //   // { title: '唯一标识', key: 'uk'},
      //   { title: this.$t('page.name'), key: 'name' },
      //   { title: this.$t('page.type'), key: 'typeName' },
      //   { title: this.$t('page.status'), key: 'isActive' },
      //   { title: this.$t('page.description'), key: 'description', width: 400 },
      //   { title: ' ', key: 'action', align: 'right', width: 10 }
      // ],
      tableData: null,
      isCopy: false,
      actionFormDialog: false,
      statusList: [
        {
          name: 'passed',
          label: this.$t('page.passed'),
          count: 0
        },
        {
          name: 'draft',
          label: this.$t('page.draft'),
          count: 0
        },
        {
          name: 'submitted',
          label: this.$t('page.submitted'),
          count: 0
        },
        {
          name: 'rejected',
          label: this.$t('page.rejected'),
          count: 0
        }
      ],
      versionStatus: 'passed',
      addActionForm: {
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          validateList: ['required', 'name-special', { name: 'searchUrl', url: 'api/rest/autoexec/combop/basic/info/save', key: 'name' }]
        },
        opType: {
          type: 'radio',
          label: this.$t('page.actiontype'),
          value: '',
          dataList: [],
          validateList: ['required']
        },
        typeId: {
          type: 'select',
          name: 'typeId',
          value: '',
          dataList: [],
          label: this.$t('term.autoexec.toolclassification'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          validateList: ['required'],
          search: true,
          dynamicUrl: '/api/rest/autoexec/type/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getToolClassificationList,
          transfer: true,
          onChangelabel: (text) => {
            _this.typeName = text;
          }
        },
        viewAuthorityList: {
          type: 'userselect',
          name: 'viewAuthorityList',
          label: this.$t('page.viewauthority'),
          transfer: true,
          multiple: true,
          groupList: ['common', 'user', 'team', 'role'],
          width: '100%',
          validateList: ['required']
        },
        editAuthorityList: {
          type: 'userselect',
          name: 'editAuthorityList',
          label: this.$t('page.editauthority'),
          transfer: true,
          multiple: true,
          groupList: ['common', 'user', 'team', 'role'],
          width: '100%',
          validateList: ['required']
        },
        executeAuthorityList: {
          type: 'userselect',
          name: 'executeAuthorityList',
          label: this.$t('page.executeauthority'),
          transfer: true,
          multiple: true,
          groupList: ['common', 'user', 'team', 'role'],
          width: '100%',
          validateList: ['required']
        },
        notifyPolicy: {
          type: 'slot',
          name: 'notifyPolicy',
          label: this.$t('page.notificationstrategy')
        },
        description: {
          type: 'textarea',
          name: 'description',
          value: '',
          maxlength: 500,
          label: this.$t('page.description')
        }
      },
      invokeNotifyPolicyConfig: {
        policyId: '',
        policyName: '',
        policyPath: '',
        handler: 'neatlogic.module.autoexec.notify.handler.AutoexecCombopNotifyPolicyHandler',
        paramMappingList: []
      },
      addActionConfig: null,
      // addActionConfig: {
      //   name: '',
      //   typeId: '',
      //   viewAuthorityList: '',
      //   editAuthorityList: '',
      //   executeAuthorityList: '',
      //   config: {},
      //   description: ''
      // },
      typeName: '',
      isShowRecord: false, //展示执行记录
      searchVal: {}, //搜索下拉插件的值
      searchConfig: {
        placeholder: this.$t('term.autoexec.combinationtool') + this.$t('page.name'),
        searchList: [
          {
            type: 'select',
            name: 'typeId',
            value: '',
            dataList: [],
            label: this.$t('term.autoexec.toolclassification'),
            search: true,
            dynamicUrl: '/api/rest/autoexec/type/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getToolClassificationList,
            transfer: true,
            labelPosition: 'top'
          },
          {
            type: 'select',
            name: 'isActive',
            label: this.$t('page.status'),
            transfer: true,
            labelPosition: 'top',
            dataList: [
              {
                text: this.$t('page.enable'),
                value: 1
              },
              {
                text: this.$t('page.disable'),
                value: 0
              }
            ]
          }
        ]
      },
      selectList: [],
      showUploadDialog: false,
      uploadTooltip: this.$t('term.autoexec.uploadTooltip')
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.typeId) {
      let typeId = parseInt(this.$route.query.typeId);
      this.$set(this.searchVal, 'typeId', typeId);
    }
    this.searchAction();
    this.getOpType();
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
    restoreHistory(historyData) {
      this.searchParam = historyData['searchParam'];
      this.searchVal = historyData['searchVal'];
    },
    searchAction(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      let data = Object.assign({}, this.searchParam, this.searchVal);
      this.$addHistoryData('searchParam', this.searchParam);
      this.$addHistoryData('searchVal', this.searchVal);
      this.$set(data, 'versionStatus', this.versionStatus);
      this.$api.autoexec.action.searchActionList(data).then(res => {
        if (res.Status == 'OK') {
          this.getTheadList(this.versionStatus);
          this.tableData = res.Return;
          this.$set(this.tableData, 'theadList', this.theadList);
          let versionStatusCountMap = res.Return.versionStatusCountMap;
          if (versionStatusCountMap) {
            let map = new Map(Object.entries(versionStatusCountMap));
            for (let item of this.statusList) {
              let count = map.get(item.name);
              item.count = count;
            }
          }
        }
      });
    },
    getPageData(currentPage) {
      this.searchAction(currentPage);
    },
    changePageSize(pageSize) {
      if (pageSize) {
        this.searchParam.currentPage = 1;
        this.searchParam.pageSize = pageSize;
        this.searchAction();
      }
    },
    toggleAction(row) {
      this.$api.autoexec.action
        .toggleAction({ id: row.id, isActive: row.isActive })
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        })
        .catch(error => {
          row.isActive = row.isActive ? 0 : 1;
        });
    },
    initActionConfig() {
      return {
        name: '',
        opType: 'readonly',
        typeId: '',
        viewAuthorityList: ['common#alluser'],
        editAuthorityList: ['common#alluser'],
        executeAuthorityList: ['common#alluser'],
        config: {
          invokeNotifyPolicyConfig: {}
        },
        description: ''
      };
    },
    addAction() {
      if (!this.hasAuth) {
        return;
      }
      this.id = null;
      this.addActionConfig = this.initActionConfig();
      this.isCopy = false;
      this.actionFormDialog = true;
    },
    copyAction(row) {
      if (!this.hasAuth) {
        return;
      }
      this.id = row.id;
      this.addActionConfig = this.initActionConfig();
      this.addActionConfig.name = row.name + '_copy';
      this.addActionConfig.typeId = row.typeId || '';
      this.addActionConfig.description = row.description || '';
      this.isCopy = true;
      this.actionFormDialog = true;
    },
    okAddAction() {
      //添加、复制
      let noticeSetting = this.$refs.noticeSetting || '';
      if (!this.$refs.addActionForm.valid() || (noticeSetting && !noticeSetting.valid())) {
        return;
      }
      this.$set(this.addActionConfig, 'typeName', this.typeName);
      const notifyPolicyConfig = noticeSetting.getData();
      if (notifyPolicyConfig?.policyId) {
        this.addActionConfig.config.invokeNotifyPolicyConfig = notifyPolicyConfig;
      } else {
        this.addActionConfig.config.invokeNotifyPolicyConfig = null;
      }
      if (this.isCopy) {
        let data = {
          id: this.id
        };
        Object.assign(data, this.addActionConfig);
        this.$api.autoexec.action.copyAction(data).then(res => {
          if (res.Status == 'OK') {
            this.$router.push({
              path: '/action-detail',
              query: { 
                id: res.Return,
                versionStatus: 'passed'
              }
            });
          }
        });
      } else {
        this.$api.autoexec.action.saveActionBasicInfo(this.addActionConfig).then(res => {
          if (res.Status == 'OK') {
            let id = res.Return;
            this.$router.push({
              path: '/action-detail',
              query: {
                id: id,
                versionStatus: 'draft'
              }
            });
          }
        });
      }
    },
    closeAction() {
      this.actionFormDialog = false;
    },
    deleteRow(row) {
      if (!row.deletable || row.referenceCount > 0) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = { id: row.id };
          this.$api.autoexec.action.deleteAction(data).then(res => {
            if (res.Status == 'OK') {
              this.searchAction();
              this.$Message.success(this.$t('message.deletesuccess'));
            }
          });
          vnode.isShow = false;
        }
      });
    },
    openRecord(row) {
      this.id = row.id;
      this.isShowRecord = true;
    },
    toEdit(row) {
      this.$router.push({
        path: '/action-detail',
        query: { id: row.id, versionStatus: this.versionStatus }
      });
    },
    toExecute(row) {
      if (!row.isActive || !row.executable) {
        return;
      }
      this.$router.push({
        path: '/runner-detail',
        query: { actionId: row.id }
      });
    },
    getSelected(indexList, itemList) {
      this.selectList = indexList;
    },
    uploadAction() {
      if (!this.hasAuth) {
        return;
      }
      this.showUploadDialog = true;
    },
    closeUploadDialog(refresh) {
      this.showUploadDialog = false;
      if (refresh) {
        this.getPageData(1);
      }
    },
    renderCount(tab) {
      return (h) => {
        return h('div', [
          h('span', tab.label),
          h('span',
            {
              style: {
                'font-size': '12px',
                'padding-left': '4px'
              }
            },
            tab.count
          )
        ]);
      };
    },
    changeTabValue(name) {
      this.versionStatus = name;
      // if (name == 'passed') {
      //   this.theadList[0].key != 'selection' && (this.theadList.unshift({key: 'selection', multiple: true}));
      // } else {
      //   this.theadList = this.theadList.filter(item => item.key != 'selection');
      // }
      this.searchAction(1);
    },
    getTheadList(versionStatus) {
      this.theadList = [];
      let index = 0;
      if (versionStatus == 'passed') {
        this.theadList[index++] = { key: 'selection', multiple: true };
      }
      this.theadList[index++] = { title: this.$t('page.name'), key: 'name' };
      this.theadList[index++] = { title: this.$t('page.type'), key: 'typeName' };
      if (versionStatus == 'passed') {
        this.theadList[index++] = { title: this.$t('page.status'), key: 'isActive' };
      }
      this.theadList[index++] = { title: this.$t('page.description'), key: 'description', width: 400 };
      if (versionStatus == 'passed') {
        this.theadList[index++] = { title: ' ', key: 'action', align: 'right', width: 10 };
      }
    },
    getOpType() {
      let data = { enumClass: 'neatlogic.framework.autoexec.constvalue.AutoexecCombopOpType' };
      this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.addActionForm.opType.dataList = res.Return;
        }
      });
    }
  },
  computed: {
    downloadUrl() {
      return {
        url: 'api/binary/autoexec/combop/export',
        params: { idList: this.selectList }
      };
    },
    preventDownload() {
      const list = this.selectList && this.selectList.length > 0;
      if (!list) return true;
      return false;
    },
    hasAuth() {
      //组合工具新建权限
      return this.$store.getters.userAuthList.includes('AUTOEXEC_COMBOP_ADD');
    }
  },
  watch: {}
};
</script>
