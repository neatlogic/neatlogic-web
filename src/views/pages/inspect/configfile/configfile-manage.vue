<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-slot:topLeft>
        <div v-auth="'INSPECT_CONFIG_FILE_MODIFY'" class="action-group">
          <div class="action-item tsfont-plus" @click="openEditDialog('add')">
            {{ $t('dialog.title.addtarget', {target: $t('page.path')}) }}
          </div>
          <div class="action-item tsfont-trash-o" @click="openEditDialog('delete')">
            {{ $t('dialog.title.deletetarget', {target: $t('page.path')}) }}
          </div>
          <div class="action-item tsfont-trash-o" @click="openEditDialog('clear')">
            {{ $t('term.inspect.clearfile') }}
          </div>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <CombineSearcher
            v-model="searchValue"
            v-bind="searchConfig"
            @change="changeCombineSearcher"
            @change-label="changeLabel"
          >
            <template v-slot:batchSearchList="{valueConfig,textConfig}">
              <div>
                <TsFormItem :label="$t('page.batchsearch')" :tooltip="$t('term.cmdb.resourcebatchsearchtooltip')" labelPosition="left">
                  <TsFormRadio
                    v-model="valueConfig.searchField"
                    :dataList="searchFieldRadioDataList"
                  ></TsFormRadio>
                </TsFormItem>
                <TsFormItem :label="$t('page.batchsearchvalue')" labelWidth="0px" labelPosition="left">
                  <TsFormInput
                    v-model="valueConfig.batchSearchList"
                    type="textarea"
                    :placeholder="'192.168.0.1\n192.168.0.2\n192.168.0.*'"
                    :autoSize="{minRows: 4}"
                    @change="(val)=>{changeBatchSearchList(val,textConfig)}"
                  >
                  </TsFormInput>
                </TsFormItem>
              </div>
            </template>
          </CombineSearcher>
        </div>
      </template>
      <template v-slot:sider>
        <div>
          <span v-if="$utils.isEmpty(resourceList)" class="text-href" @click="gotoAssetManagePage()">{{ $t('term.cmdb.gotoresourcetypetreesetting') }}</span>
          <Tree
            v-else
            :data="resourceList"
            :render="renderTree"
            :multiple="false"
            class="ts-tree"
            @on-select-change="selectTreeNode"
          ></Tree>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            v-model="selectList"
            v-bind="reportData"
            :theadList="theadList"
            :loading="loadingShow"
            keyName="id"
            multiple
            @changeCurrent="searchConfigFileList"
            @changePageSize="changePageSize"
          >
            <template v-slot:ip="{ row }">
              <span>
                <span>{{ row.ip }}</span>
                <span v-if="row.port">:{{ row.port }}</span>
              </span>
            </template>
            <template v-slot:lastChangeTime="{ row }">
              <span v-if="row.lastChangeTime">{{ getTime(row.lastChangeTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
              <span v-else>-</span>
            </template>
            <template v-slot:taskStatus="{ row }">
              <CommonStatus
                v-if="row.jobPhaseNodeVo"
                :statusName="row.jobPhaseNodeVo.statusName"
                :statusValue="row.jobPhaseNodeVo.status"
                type="text"
              ></CommonStatus>
              <span v-else>-</span>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-file-single" @click="openFileList(row)">{{ $t('term.inspect.filelist') }}</li>
                  <li v-auth="'INSPECT_CONFIG_FILE_MODIFY'" class="tsfont-setting" @click="editFilePath(row)">{{ $t('term.inspect.pathconfig') }}</li>
                  <li v-auth="'INSPECT_CONFIG_FILE_MODIFY'" class="tsfont-trash-o" @click="clearFile(row)">{{ $t('term.inspect.clearfile') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
    <BatchEditDialog
      v-if="isEditDialog"
      :title="editTitle"
      :editType="editType"
      :selectList="selectList"
      :conditionConfig="conditionConfig"
      :conditionConfigText="conditionConfigText"
      @close="closeEdit"
    ></BatchEditDialog>
    <FileListDialog v-if="isShowFileListDialog" :resourceId="resourceId" @close="isShowFileListDialog=false"></FileListDialog>
    <EditFilePath
      v-if="isEditFilePath"
      :resourceId="resourceId"
      :pathList="pathList"
      @close="isEditFilePath=false"
    ></EditFilePath>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    BatchEditDialog: resolve => require(['./components/batch-edit-dialog.vue'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    FileListDialog: resolve => require(['./components/file-list-dialog.vue'], resolve),
    EditFilePath: resolve => require(['./components/edit-file-path.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)

  },
  props: {},
  data() {
    return {
      loadingShow: true,
      searchValue: {
        searchField: 'ip'
      },
      searchParam: {},
      selectList: [],
      searchFieldRadioDataList: [
        {
          value: 'ip',
          text: 'IP'
        },
        {
          value: 'name',
          text: this.$t('page.name')
        }
      ],
      searchConfig: {
        placeholder: this.$t('term.inspect.inputargetnameip'),
        searchList: [
          {
            type: 'select',
            name: 'appSystemIdList',
            label: this.$t('page.apply'),
            multiple: true,
            value: null,
            dynamicUrl: '/api/rest/resourcecenter/appsystem/list/forselect',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            search: true,
            transfer: true,
            onChange: (val) => {
              let appSystemIdList = [];
              appSystemIdList = this.searchConfig.searchList.filter(item => {
                return item.name == 'appModuleIdList';
              });
              if (!this.$utils.isEmpty(appSystemIdList)) {
                appSystemIdList[0].params.appSystemIdList = val;
              }
              if (val) {
                this.$nextTick(() => {
                  if (this.searchValue && this.searchValue.appModuleIdList) {
                    this.$delete(this.searchValue, 'appModuleIdList');
                  }
                });
              }
            }
          },
          {
            type: 'select',
            name: 'appModuleIdList',
            label: this.$t('page.module'),
            multiple: true,
            dynamicUrl: '/api/rest/resourcecenter/appmodule/list',
            params: { appSystemIdList: null },
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            search: true,
            transfer: true
          },
          {
            type: 'checkbox',
            name: 'envIdList',
            label: this.$t('page.environment'),
            multiple: true,
            url: '/api/rest/resourcecenter/appenv/list/forselect',
            params: { needPage: false },
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          },
          {
            type: 'slot',
            label: this.$t('page.batchsearch'),
            labelWidth: '0px',
            labelPosition: 'left',
            name: 'batchSearchList'
          },
          {
            type: 'select',
            name: 'vendorIdList',
            label: this.$t('page.manufacturer'),
            multiple: true,
            url: '/api/rest/resourcecenter/vendor/list/forselect',
            params: { needPage: false },
            rootName: 'tbodyList',
            textName: 'description',
            valueName: 'id',
            search: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'tagIdList',
            label: this.$t('page.tag'),
            multiple: true,
            dynamicUrl: '/api/rest/resourcecenter/tag/list/forselect',
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            search: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'protocolIdList',
            label: this.$t('term.inspect.connectionagreement'),
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            multiple: true,
            rootName: 'tbodyList',
            search: true,
            clearable: true,
            transfer: true,
            dealDataByUrl: this.dealDataByUrl
          },
          {
            type: 'checkbox',
            name: 'inspectJobPhaseNodeStatusList',
            label: this.$t('page.jobstatus'),
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.autoexec.constvalue.JobNodeStatus' },
            multiple: true,
            className: 'block-span'
          },
          {
            type: 'checkbox',
            name: 'stateIdList',
            label: this.$t('term.autoexec.assetstatus'),
            multiple: true,
            url: '/api/rest/resourcecenter/state/list/forselect',
            params: { needPage: false },
            rootName: 'tbodyList',
            textName: 'description',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          }
        ]
      },
      theadList: [
        {
          key: 'selection',
          title: ''
        },
        {
          title: this.$t('page.ipaddress'),
          key: 'ip'
        },
        {
          title: this.$t('page.type'),
          key: 'typeLabel'
        },
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.description'),
          key: 'description'
        },
        {
          title: this.$t('term.inspect.latestchangetime'),
          key: 'lastChangeTime'
        },
        {
          title: this.$t('term.inspect.inspectionjobstatus'),
          key: 'taskStatus'
        },
        {
          title: this.$t('term.inspect.iplist'),
          key: 'allIp',
          type: 'tag',
          valueKey: 'ip'
        },
        {
          title: this.$t('term.autoexec.subordinatedepartment'),
          key: 'bgList',
          type: 'tag',
          valueKey: 'bgName'
        },
        {
          title: this.$t('page.owner'),
          key: 'ownerList',
          type: 'usercards'
        },
        {
          title: this.$t('term.autoexec.assetstatus'),
          key: 'stateName'
        },
        {
          title: this.$t('page.networkarea'),
          key: 'networkArea'
        },
        {
          title: this.$t('page.tag'),
          key: 'tagList',
          type: 'tag'
        },
        {
          title: this.$t('term.deploy.maintenancewindow'),
          key: 'maintenanceWindow'
        },
        {
          key: 'action'
        }
      ],
      reportData: {},
      resourceList: [],
      timmer: null,
      isEditDialog: false,
      editTitle: '',
      editType: '',
      flattenResourceMap: {},
      searchText: {},
      typeName: '',
      conditionConfig: {}, //批量添加条件
      conditionConfigText: {}, //批量添加条件显示
      isShowFileListDialog: false, //是否展示文件路径列表
      isEditFilePath: false, //是否编辑文件路径
      pathList: [],
      resourceId: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getResourceList();
    this.searchConfigFileList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.timmer) {
      clearTimeout(this.timmer);
      this.timmer = null;
    }
  },
  destroyed() {},
  methods: {
    restoreHistory(historyData) {
      if (historyData['searchParam']) {
        this.searchParam = historyData['searchParam'];
      }
      if (historyData['searchValue']) {
        this.searchValue = historyData['searchValue'];
      }
    },
    dealDataByUrl(nodeList, type) {
      // 处理默认值的数据结构
      let columlist = [];           
      nodeList.forEach(v => {
        let text = '';
        if (v.port) {
          text = v.name + '(' + v.port + ')';
        } else {
          text = v.name;
        }
        columlist.push(
          {text: text, value: v.id}
        );
      });
      return columlist;
    },
    getResourceList() {
      return this.$api.cmdb.asset.getResourceTreeType().then(res => {
        this.resourceList = res.Return;
        this.$nextTick(() => {
          this.flattenResourceList();
          if (this.searchParam.typeId) {
            this.selectResource(this.searchParam.typeId);
          } else {
            if (this.resourceList.length > 0) {
              this.$set(this.searchParam, 'typeId', this.resourceList[0].id);
              this.$set(this.resourceList[0], 'selected', true);
              this.$set(this.resourceList[0], 'expand', true);
              this.typeName = this.resourceList[0].label;
            }
          }
        });
      });
    },
    //扁平化资源数据，变成一个id为key的map
    flattenResourceList(children) {
      let resourceList = children || this.resourceList;
      if (resourceList && resourceList.length > 0) {
        resourceList.forEach(resource => {
          this.flattenResourceMap[resource.id] = resource;
          if (resource.children) {
            this.flattenResourceList(resource.children);
          }
        });
      }
    },
    selectTreeNode(nodeList, node) {
      //选中类型
      this.$set(this.searchParam, 'typeId', node.id);
      this.typeName = node.label;
      this.searchConfigFileList(1);
    },
    renderTree(h, { root, node, data }) {
      return h('span', data.label);
    },
    selectResource(id) {
      const resource = this.flattenResourceMap[id];
      if (resource) {
        this.typeName = resource.label;
        this.$set(resource, 'selected', true);
        this.$set(resource, 'expand', true);
        let parentId = resource.parentId;
        while (parentId) {
          const pr = this.flattenResourceMap[parentId];
          if (pr) {
            this.$set(pr, 'expand', true);
            parentId = pr.parentId;
          } else {
            parentId = null;
          }
        }
      }
    },
    searchConfigFileList(currentPage) {
      if (!this.searchParam.typeId) {
        this.loadingShow = false;
        return;
      }
      this.loadingShow = true;
      if (currentPage) {
        this.$set(this.searchParam, 'currentPage', currentPage);
      }
      this.$addHistoryData('searchValue', this.searchValue);
      this.$addHistoryData('searchParam', this.searchParam);
      let params = Object.assign({}, this.searchValue, this.searchParam);
      if (!this.$utils.isEmpty(params.batchSearchList)) {
        params.batchSearchList = params.batchSearchList.split('\n');
      } else {
        params.batchSearchList = [];
      }
      this.$api.inspect.configfile.getConfigFileList(params).then(res => {
        if (res && res.Status == 'OK') {
          this.reportData = res.Return;
          const idList = [];
          if (this.reportData.tbodyList && this.reportData.tbodyList.length > 0) {
            this.reportData.tbodyList.forEach(element => {
              if (element.jobPhaseNodeVo && element.jobPhaseNodeVo.status && (element.jobPhaseNodeVo.status === 'running' || element.jobPhaseNodeVo.status === 'pending')) {
                idList.push(element.id);
              }
            });
            if (idList.length > 0) {
              setTimeout(() => {
                this.refresh(idList);
              }, 3000);
            }
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changePageSize(pageSize) {
      this.$set(this.searchParam, 'pageSize', pageSize);
      this.searchConfigFileList(1);
    },
    refreshConfigList(idList) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      if (!this.searchParam.typeId) {
        this.loadingShow = false;
        return;
      }
      this.$api.inspect.configfile.getConfigFileList({
        needPage: false,
        idList: idList,
        typeId: this.searchParam.typeId 
      }).then(res => {
        if (res && res.Status == 'OK') {
          const jobList = res.Return.tbodyList;
          const newIdList = [];
          if (jobList && jobList.length > 0) {
            jobList.forEach(job => {
              const index = this.reportData.tbodyList.findIndex(d => d.id === job.id);
              if (index >= 0) {
                this.$set(this.reportData.tbodyList, index, job);
              }
              if (job.jobPhaseNodeVo && job.jobPhaseNodeVo.status && (job.jobPhaseNodeVo.status === 'running' || job.jobPhaseNodeVo.status === 'pending')) {
                newIdList.push(job.id);
              }
            });
            this.$refs['reportTable'] && this.$refs['reportTable'].$forceUpdate();//状态层次太深，需要强制刷新
            if (newIdList.length > 0) {
              this.timmer = setTimeout(() => {
                this.refresh(newIdList);
              }, 5000);
            }
          }
        }
      });
    },
    changeLabel(textConfig) {
      if (!this.$utils.isEmpty(this.searchValue.batchSearchList)) {
        this.$set(textConfig, 'batchSearchList', this.searchValue.batchSearchList.split('\n'));
      }
      this.searchText = textConfig || {};
    },
    openEditDialog(type) {
      this.editType = type;
      this.conditionConfig = Object.assign({typeId: this.searchParam.typeId}, this.searchValue);
      this.conditionConfigText = Object.assign({typeId: this.typeName}, this.searchText);
      if (type == 'add') {
        this.editTitle = this.$t('dialog.title.batchaddtarget', {target: this.$t('page.path')});
      } else if (type == 'delete') {
        this.editTitle = this.$t('dialog.title.batchdeletetarget', {target: this.$t('page.path')});
      } else if (type == 'clear') {
        this.editTitle = this.$t('term.inspect.batchclearfile');
      }
      this.isEditDialog = true;
    },
    closeEdit() {
      this.conditionConfig = {};
      this.conditionConfigText = {};
      this.isEditDialog = false;
    },
    openFileList(row) {
      this.resourceId = row.id;
      this.isShowFileListDialog = true;
    },
    async editFilePath(row) {
      this.resourceId = row.id;
      this.pathList = [];
      let res = await this.$api.inspect.configfile.getFilePathList({resourceId: row.id});
      if (res && res.Return && res.Return.tbodyList && res.Return.tbodyList.length) {
        res.Return.tbodyList.forEach(item => {
          this.pathList.push(item.path);
        });
      }
      this.isEditFilePath = true;
    },
    clearFile(row) {
      this.$createDialog({
        title: this.$t('term.inspect.clearfile'),
        content: this.$t('term.inspect.clearcofigfilerecord', {target: row.ip + (row.name ? '[' + row.name + ']' : '')}),
        btnType: 'error',
        okText: this.$t('page.clearup'),
        'on-ok': function(vnode) {
          this.$api.inspect.configfile.clearResourceFile({resourceId: row.id}).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Notice.success({
                title: this.$t('message.clearupsuccess')
              });
              vnode.isShow = false;
            }
          });
        }
      });
    },
    getTime(time) {
      return Date.parse(new Date()) - time;
    },
    changeBatchSearchList(val, textConfig) {
      if (this.$utils.isEmpty(val)) {
        this.$delete(textConfig, 'batchSearchList');
      } else {
        this.$set(textConfig, 'batchSearchList', val.split('\n'));
      }
    },
    changeCombineSearcher(val) {
      if (this.$utils.isEmpty(val)) {
        this.$set(this.searchValue, 'searchField', 'ip');
      }
      this.searchConfigFileList(1);
    },
    gotoAssetManagePage() {
      window.open(HOME + '/cmdb.html#/asset-manage', '_blank');
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
