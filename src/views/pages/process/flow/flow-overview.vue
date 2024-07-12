<template>
  <div class="flowOverview">
    <!-- 关联服务弹窗 -->
    <RelationService :isShow="relevanceModel" :processUuid="processUuid" @close="closeService"></RelationService>
    <!-- 关联服务end -->
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="addFlow">{{ $t('term.process.flow') }}</span>
          <div class="action-item tsfont-upload" @click.self="$refs.uploadDialog.showDialog">{{ $t('page.import') }}</div>
          <ComplexUploadDialog
            ref="uploadDialog"
            targetType="process"
            url="/api/binary/common/import"
            @close="closeComplexUploadDialog"
          ></ComplexUploadDialog>
        </div>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="6"><Checkbox
            v-model="isCreator"
            :true-value="1"
            :false-value="0"
            @on-change="isCheck"
          >{{ $t('term.process.mycreated') }}</Checkbox> </Col>
          <Col :span="18">
            <InputSearcher
              v-model="keyword"
              @change="searchFlow(1)"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content" class="content">
        <div class="flow-main">
          <TsCard
            v-if="flowData.cardList"
            v-bind="flowData"
            :boxShadow="false"
            :sm="12"
            :lg="8"
            :xl="6"
            :xxl="4"
            :padding="false"
            :fixBtn="true"
            @updatePage="searchFlow"
            @action="action"
          >
            <template slot-scope="{ row }">
              <div class="overvivew-main" @click="editFlow(row)">
                <div class="title pb-sm text-action overflow" :title="row.name">{{ row.name }}</div>
                <div class="text-grey overflow">
                  <UserCard v-bind="row.lcuVo" hideAvatar></UserCard>
                  <span> {{ row.lcd | formatDate }} {{ row.actionType }}</span>
                </div>
              </div>
            </template>
          </TsCard>
        </div>
      </div>
    </tscontain>
    <TsDialog
      type="modal"
      :isShow.sync="addModel"
      height="110px"
      :okBtnDisable="!canSubmit"
      @on-ok="okAddFlow"
      @on-close="cancelAddFlow"
    >
      <template v-slot:header>
        <div>{{ isCopy ? $t('page.copy') : $t('page.add') }}</div>
      </template>
      <template v-slot>
        <TsForm ref="mainForm" :itemList="formSetting" type="type"></TsForm>
      </template>
    </TsDialog>
    <TsDialog
      type="modal"
      :isShow.sync="draftModel"
      :title="$t('term.process.restoredrafts')"
      :okText="$t('page.recover')"
      :cancelText="$t('page.cancel')"
      @on-ok="draftOk"
      @on-close="draftCancle"
    >
      <p style="margin-bottom: 10px;">
        <span>{{ $t('term.process.savedraftflow') }}</span>
        <!-- <span style="margin-left: 36px;">{{ $t('term.process.autosaveinterval') }}</span> -->
      </p>
      <TsTable
        :theadList="draftKey"
        :tbodyList="draftData"
        @clickTr="draftCurrentChange"
      ></TsTable>
    </TsDialog>
  </div>
</template>

<script>
import download from '@/resources/mixins/download.js';
export default {
  name: 'FlowOverview',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    ComplexUploadDialog: () => import('@/resources/components/ComplexUploadDialog/complexUploadDialog.vue'),
    RelationService: () => import('./flowedit/relation-service.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  filters: {},
  mixins: [download],
  props: [''],
  data() {
    let _this = this;
    return {
      loadingShow: true,
      isCreator: 0, //搜索我创建的
      keyword: null, //关键字
      pageSize: 24, //每页条数
      currentPage: 1,
      processList: [],
      flowData: {}, //流程数据
      addModel: false, //新建模态框
      relevanceModel: false, //关联模态框
      isCopy: false, //新建，复制流程
      uuid: null, //流程uuid
      formSetting: [
        {
          type: 'text',
          name: 'name',
          value: '', //默认值
          maxlength: 30,
          width: '100%',
          label: this.$t('page.name'),
          validateList: ['required', 'name-special', {
            name: 'searchUrl',
            url: 'api/rest/process/save',
            params: (value, rule) => {
              if (this.isCopy) {
                rule.url = 'api/rest/process/copy';
                return {};
              } else {
                rule.url = 'api/rest/process/save';
                return {uuid: this.uuid};
              }
            },
            validSearchUrl: (isValid, msg) => {
              _this.banSubmit(isValid);
            }
          }]
        }
      ],
      processUuid: null,
      draftModel: false,
      draftKey: [
        {
          title: this.$t('term.process.autosavedatetime'),
          key: 'fcd'
        },
        {
          title: this.$t('page.filename'),
          key: 'name'
        }
      ],
      draftData: [],
      canSubmit: true//是否可以提交新增或者修改表单
    };
  },
  mounted() {},
  created() {
    this.searchFlow();
  },
  methods: {
    banSubmit(isValid) {
      //this.canSubmit = isValid;
    },
    searchFlow(currentPage) {
      let data = {
        isICreated: this.isCreator,
        pageSize: this.pageSize,
        currentPage: currentPage || this.currentPage,
        keyword: this.keyword
      };
      currentPage && (this.currentPage = currentPage);
      this.$addHistoryData('keyword', this.keyword);
      this.$addHistoryData('isCreator', this.isCreator);
      this.$addHistoryData('currentPage', this.currentPage);
      this.$api.process.process
        .processSearch(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.loadingShow = false;
            let flowData = res.Return;
            Object.keys(flowData).forEach(item => {
              if (item != 'processList') {
                this.$set(this.flowData, item, flowData[item]);
              } else {
                this.$set(this.flowData, 'cardList', flowData[item]);
              }
            });
            // console.log(this.flowData.cardList, '====');
            this.currentPage = res.Return.currentPage;
            this.flowData.cardList.map(v => {
              v.btnList = [
                {name: this.$t('term.process.relcatalog'), value: 'referenceCount', icon: 'tsfont-tool', type: 'referenceCount', key: 'referenceCount'},
                {name: this.$t('page.delete'), value: 'del', type: 'del', icon: 'tsfont-trash-o', disable: true, text: this.$t('term.process.flowcannotdelete'), key: 'referenceCount'},
                {name: this.$t('term.framework.multi'), value: 'dropdown', icon: '', type: 'dropdown', menuArr: [{name: this.$t('page.copy'), value: 'copy', type: 'text'},
                  {name: this.$t('page.export'), value: 'export', type: 'download'}]
                }
              ];
            });
          }
        });
    },
    isCheck() {
      this.searchFlow(1);
    },
    action(row, value) {
      if (value == 'referenceCount') {
        this.relevanceList(row.uuid);
      } else if (value == 'del') {
        this.delflow(row);
      } else if (value == 'copy') {
        this.copy(row.uuid, row.name);
      } else if (value == 'export') {
        this.btnExport(row.uuid, row.name);
      }
      // console.log(row, value, '====');
    },
    editFlow: function(row) {
      //编辑流程
      this.$router.push({
        path: '/flow-edit',
        query: {
          uuid: row.uuid,
          name: row.name,
          referenceCount: row.referenceCount
        }
      });
    },
    draftCurrentChange(currentRow) {
      this.draftCurrentData = currentRow;
    },
    draftCancle() {
      this.addFlow('add');
    },
    draftOk() {
      this.$router.push({
        path: '/flow-edit',
        query: {
          uuid: this.draftCurrentData.processUuid,
          draftuuid: this.draftCurrentData.uuid,
          name: this.draftCurrentData.name
        }
      });
    },
    addFlow: function(action) {
      //添加流程
      if (action === 'add') {
        this.addModel = true;
        this.formSetting[0].value = null;
        this.uuid = null;
        this.isCopy = false;
        return;
      }
      this.canSubmit = false;
      this.$api.process.process
        .processDraftList({})
        .then(res => {
          if (res.Status == 'OK') {
            let draftList = res.Return;
            draftList.forEach(d => {
              d.fcd = this.$options.filters.formatDate(d.fcd);
            });
            this.draftData.splice(0);
            this.draftData.push(...draftList);
            if (this.draftData[0]) {
              this.draftCurrentData = this.draftData[0];
              this.draftData[0]._highlight = true;
            }
            if (draftList && draftList.length) {
              this.draftModel = true;
            } else {
              this.addFlow('add');
            }
          }
        })
        .catch(error => {
          this.addFlow('add');
        }).finally(() => {
          this.canSubmit = true;
        });
    },
    delflow(row) {
      if (row.referenceCount > 0) {
        return;
      }
      //删除流程
      this.uuid = row.uuid;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          let getData = {
            uuid: this.uuid
          };
          vnode.isShow = false;
          this.$api.process.process.delProcess(getData).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchFlow();
            }
          });
        }
      });
    },
    updateFlow: function(uuid, name) {
      let data = {
        uuid: uuid,
        name: name
      };
      this.$api.process.process
        .updateProcess(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        });
    },
    copy: function(uuid, name) {
      //复制流程
      this.formSetting[0].value = name + '_copy';
      this.uuid = uuid;
      this.isCopy = true;
      this.addModel = true;
    },
    btnExport: function(uuid, name) {
      this.download({url: '/api/binary/common/export', params: { primaryKey: uuid, type: 'process'}});
    },
    refreshFlow: function() {
      //刷新服务
      this.relevanceList(this.processUuid);
    },
    okAddFlow: function() {
      let Form = this.$refs.mainForm;
      let name = Form.getFormValue().name;
      let isActive = 1;
      let config = '{}';
      let newUuid = this.$utils.setUuid();
      if (Form.valid()) {
        if (this.isCopy) {
          let getData = {
            uuid: this.uuid,
            name: name
          };
          this.$api.process.process
            .copyProcess(getData)
            .then(res => {
              if (res.Status == 'OK') {
                this.searchFlow();
              }
              this.addModel = false;
              this.$Message.success(this.$t('message.executesuccess'));
            });
        } else {
          let isrepeat = false;
          this.processList.forEach(flow => {
            if (flow.name == name) {
              isrepeat = true;
            }
          });
          if (isrepeat) {
            this.$Message.error(this.$t('message.targetisexists', {target: this.$t('page.name')}));
          } else {
            this.$router.push({
              path: '/flow-edit',
              query: {
                uuid: newUuid,
                name: name,
                isnew: true
              }
            });
          }
        }
      }
    },
    cancelAddFlow: function() {
      this.addModel = false;
    },
    closeService(val) {
      this.relevanceModel = val;
    },
    relevanceList(uuid) {
      //关联服务
      this.relevanceModel = true;
      this.processUuid = uuid;
    },
    restoreHistory(historyData) {
      this.keyword = historyData['keyword'] || '';
      this.isCreator = historyData['isCreator'] || 0;
      this.currentPage = historyData['currentPage'] || 1;
    },
    closeComplexUploadDialog(isSuccess) {
      if (isSuccess) {
        this.searchFlow();
      }
    }
  },
  computed: {
    getDownLoad() {
      return (uuid) => {
        return {url: '/api/binary/process/export', params: {uuid: uuid}, method: 'post'};
      };
    }
  },
  watch: {}
};
</script>

<style lang="less" scoped>
/deep/.ivu-checkbox{
  vertical-align: text-bottom;
}

.flowOverview {
  /deep/ .tscard-container {
    .tscard-body {
      .overvivew-main {
        cursor: pointer;
      }
    }
  }
  /deep/ .ivu-checkbox-wrapper{
    margin-right: 0;
  }
}
</style>
