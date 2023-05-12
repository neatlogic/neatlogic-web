/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="script-manage">
    <!-- <Loading :loadingShow="loading" type="fix"></Loading> -->
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <span
            :class="{'text-disabled':!hasAuth}"
            :title="!hasAuth?$t('page.notauthrelationadmin'):''"
            class="action-item tsfont-plus"
            @click="addScript()"
          >{{ $t('term.autoexec.customtool') }}</span>
          <span
            :class="{'text-disabled':!hasAuth}"
            :title="!hasAuth?$t('page.notauthrelationadmin'):''"
            class="tsfont-upload action-item"
            @click="uploadAction()"
          >{{ $t('page.import') }}</span>
          <span :class="{'text-disabled':!selectList || selectList.length == 0}" class="tsfont-download action-item" @click="exportList()">{{ $t('page.export') }}</span>
          <span
            :class="{'text-disabled':!hasAuth || !selectList || selectList.length == 0}"
            :title="!hasAuth?$t('page.notauthrelationadmin'):''"
            class="action-item tsfont-trash-o"
            @click="batchDeleteScript()"
          >{{ $t('page.batchdelete') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="getPage(1)"></CombineSearcher>
      </template>
      <template v-slot:sider>
        <Tree
          :data="treeList"
          :render="renderContent"
          class="ts-tree"
          @on-select-change="selectTreeNode"
        ></Tree>
      </template>
      <template v-slot:content>
        <Tabs 
          v-model="versionStatus"
          class="block-tabs"
          :animated="false"
          @on-click="changeTabValue"
        >
          <TabPane
            v-for="tab in statusList"
            :key="tab.value"
            :label="renderCount(tab)"
            :name="tab.value"
          >
            <div class="padding">
              <TsTable
                v-if="tableData"
                v-bind="tableData"
                selectedRemain
                keyName="id"
                :loading="loading"
                @getSelected="getSelected"
                @changeCurrent="getPage"
                @changePageSize="changePageSize"
              >
                <template slot="riskVo" slot-scope="{ row }">
                  <span :style="''+((row.riskVo && row.riskVo.color)?'color:'+(row.riskVo && row.riskVo.color):'')+';'">{{ (row.riskVo && row.riskVo.name)||'' }}</span>
                </template>
                <template slot="isLib" slot-scope="{ row }">
                  <span>{{ (row.isLib && row.isLib==1)? $t('page.yes'): $t('page.no') }}</span>
                </template>
                <template slot="name" slot-scope="{ row }">
                  <span class="text-href" @click.stop="editScript(row)">{{ row.name }}</span>
                </template>
                <template slot="description" slot-scope="{ row }">
                  <div class="overflow description" :title="row.description">{{ row.description }}</div>
                </template>
                <template v-slot:catalogName="{ row }">
                  <Tooltip
                    :content="row.catalogPath"
                    theme="light"
                    :disabled="!row.catalogPath"
                    placement="top"
                    transfer
                  >
                    {{ row.catalogName }}
                  </Tooltip>
                </template>
                <template slot="action" slot-scope="{ row }">
                  <div class="tstable-action">
                    <ul class="tstable-action-ul">
                      <li
                        v-for="operate in row.operateList"
                        :key="operate.value"
                        :class="getIcon(operate.value, operate)"
                        :title="operate.disabledReason"
                        @click.stop="doRow(operate.value,operate,row)"
                      >{{ operate.text }}</li>
                    </ul>
                  </div>
                </template>
              </TsTable>
            </div>
          </TabPane>
        </Tabs>
      </template>
    </TsContain>
    <ScriptEdit
      v-if="showEdit"
      :id="editId"
      :isShow="showEdit"
      @close="close"
    ></ScriptEdit>
    <UploadDialog 
      ref="uploadDialog"
      :actionUrl="actionUrl"
      :formatList="formatList"
      :btnList="btnList"
      :btntext="this.$t('message.autoexec.gotoactivate')"
      :showSuccessNotice="false"
      :isValid="true"
      :successMassage="this.$t('message.autoexec.successimporttip')"
      :warnMassage="this.$t('message.autoexec.replaceimporttip')"
      :data="uploadDialogData"
      @on-success="getPage(1)"
      @goto="goto()"
    />
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
import ScriptEdit from './script/edit.vue';
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';
export default {
  name: 'ScriptManage',
  components: {
    CombineSearcher,
    ScriptEdit,
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve)
  },
  filters: {
  },
  mixins: [download],
  props: {
  },
  data() {
    return {
      searchVal: {},
      uploadDialogData: {
        isReplace: 0
      },
      maxCount: 99, //待审批显示的最大数量
      reviewingCount: 0,
      searchConfig: {
        placeholder: this.$t('page.insert') + this.$t('page.name') + '、' + this.$t('page.description'),
        searchList: [
          {
            type: 'select',
            name: 'isLib',
            dataList: [
              { value: 1, text: this.$t('page.yes') },
              { value: 0, text: this.$t('page.no') }
            ],
            label: this.$t('term.autoexec.islibraryfile'),
            transfer: true
          },
          {
            type: 'select',
            name: 'execMode',
            label: this.$t('page.executionmode'),
            placeholder: this.$t('page.pleaseselect'),
            url: '/api/rest/universal/enum/get',
            params: {enumClass: 'ScriptExecMode'},
            transfer: true,
            dealDataByUrl: this.dealExecModeList
          },
          {
            type: 'select',
            name: 'typeIdList',
            label: this.$t('term.autoexec.toolclassification'),
            placeholder: this.$t('page.pleaseselect'),
            search: true,
            dynamicUrl: '/api/rest/autoexec/type/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getToolClassificationList,
            transfer: true,
            multiple: true
          },
          {
            type: 'select',
            name: 'riskIdList',
            label: this.$t('term.autoexec.operationlevel'),
            placeholder: this.$t('page.pleaseselect'),
            dynamicUrl: '/api/rest/autoexec/risk/list',
            transfer: true,
            multiple: true
          },
          {
            type: 'select',
            name: 'customTemplateIdList',
            label: this.$t('page.customtemplate'),
            dynamicUrl: '/api/rest/autoexec/customtemplate/search',
            params: {isActive: 1},
            rootName: 'tbodyList',
            dealDataByUrl: this.dealTemplateData,
            multiple: true,
            transfer: true
          }
        ]
      },
      tableData: {
        canSelectRow: true,
        theadList: [
          {key: 'selection', multiple: true},
          {
            key: 'name',
            title: this.$t('page.name')
          
          }, {
            key: 'parser',
            title: this.$t('term.autoexec.scriptparser')
          }, {
            key: 'isLib',
            title: this.$t('term.autoexec.islibraryfile')
          }, {
            key: 'execMode',
            title: this.$t('page.executionmode')
          }, {
            key: 'typeName',
            title: this.$t('term.autoexec.toolclassification')
          }, {
            key: 'riskVo',
            title: this.$t('term.autoexec.operationlevel')
          
          }, {
            key: 'catalogName',
            title: this.$t('term.autoexec.directorytool')
          }, {
            key: 'description',
            title: this.$t('page.description')
          }, {
            key: 'action'
          }]
      },
      loading: false,
      actionIcons: {
        'generateToCombop': 'tsfont-tool',
        'copy': 'tsfont-copy',
        'export': 'tsfont-download',
        'delete': 'tsfont-trash-o'
      },
      showEdit: false,
      editId: null,
      selectList: [],
      actionUrl: BASEURLPREFIX + '/api/binary/autoexec/script/import', //导入地址
      formatList: ['pak'], //导入文件格式
      btnList: [
        {
          text: this.$t('dialog.title.canceltarget', {target: this.$t('page.import')}),
          class: 'bg-op',
          size: 'small',
          fn: () => this.cancelImport()
        },
        {
          text: this.$t('page.replace'), 
          class: ' bg-op',
          size: 'small',
          fn: (data, fileList) => this.replaceImport(data, fileList)
        }
      ],
      statusList: [],
      versionStatus: 'passed', //版本转态
      treeList: [], // 树列表
      catalogId: null // 树列表ID
    };
  },
  beforeCreate() {},
  created() {
    this.$route.query.status && (this.versionStatus = this.$route.query.status);
    if (this.$route.query.typeId) {
      let typeId = parseInt(this.$route.query.typeId);
      this.$set(this.searchVal, 'typeIdList', [typeId]);
    }
    this.changeTabValue(this.versionStatus);
    this.getTreeListSync(); // 获取树状列表
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
    async getTreeListSync() {
      const treeList = await this.$toolCatalogUtils.getTreeList(true);
      if (this.catalogId && treeList && treeList.length > 0) {
        this.setTreeDataSelect(this.catalogId, treeList, null);
      }
      this.treeList = treeList;
    },
    setTreeDataSelect(typeId, data, parentData) {
      if (data && data.length > 0) {
        data.forEach(d => {
          //d._parent = parentData;
          if (d.id == typeId) {
            d.selected = true;
            //this.setTreeDataExpand(d);
          } else {
            d.selected = false; // 解决返回列表页，有两个选中状态问题
            if (d.children) {
              this.setTreeDataSelect(typeId, d.children, d);
            }
          }
        });
      }
    },
    /*setTreeDataExpand(data) {
      data.expand = true;
      if (data._parent) {
        this.setTreeDataExpand(data._parent);
      }
    },*/
    selectTreeNode(node) {
      // 点击树节点，node Array 类型
      this.tableData.currentPage = 1;
      if (!this.$utils.isEmpty(node) && node[0]['id']) {
        this.catalogId = node[0]['id'] == 'all' ? 0 : node[0]['id'];
        this.getList(); // 获取列表数据
      } else {
        // 点击所有时候
        this.catalogId = 0;
        this.getList();
      }
    },
    renderContent(h, { root, node, data }) {
      //渲染树的lable名称
      return h('span', {
        staticClass: '',
        domProps: {
          innerHTML: data.name
        }
      });
    },
    addScript(id, isLib) {
      if (!this.hasAuth) {
        return;
      }
      if (id) {
        this.$router.push({
          path: '/script-add',
          query: {
            isLib: isLib,
            oldId: id
          }
        });
      } else {
        this.$router.push({ path: '/script-add'});
      }
    },
    editScript(row) {
      let id = row.id;
      if (this.versionStatus == 'submitted') {
        this.$router.push({
          path: '/review-detail',
          query: {
            versionId: row.submittedVersionId
          }
        });
      } else {
        this.$router.push({
          path: '/script-detail',
          query: {
            scriptId: id,
            status: this.versionStatus
          }
        });
      }
    },
    restoreHistory(historyData) {
      this.versionStatus = historyData['versionStatus'];
      this.catalogId = historyData['catalogId'];
      this.searchVal = historyData['searchVal'];
    },
    getList() {
      let param = {versionStatus: this.versionStatus, catalogId: this.catalogId};
      if (this.searchVal && Object.keys(this.searchVal).length) {
        Object.assign(param, this.searchVal);
      }
      if (this.tableData && this.tableData.currentPage) {
        Object.assign(param, {
          currentPage: this.tableData.currentPage
        });
      }
      if (this.tableData && this.tableData.pageSize) {
        Object.assign(param, {
          pageSize: this.tableData.pageSize
        });
      }
      this.loading = true;
      this.$addHistoryData('versionStatus', this.versionStatus);
      this.$addHistoryData('catalogId', this.catalogId);
      this.$addHistoryData('searchVal', this.searchVal);
      this.$api.autoexec.script.getScriptList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.statusList = res.Return.statusList;
          this.$set(this.tableData, 'currentPage', res.Return.currentPage);
          this.$set(this.tableData, 'pageCount', res.Return.pageCount);
          this.$set(this.tableData, 'pageSize', res.Return.pageSize);
          this.$set(this.tableData, 'rowNum', res.Return.rowNum);
          this.$set(this.tableData, 'tbodyList', res.Return.tbodyList || []);
          this.reviewingCount = res.Return.reviewingCount || 0;
        }
      }).finally(res => {
        this.loading = false;
      });
    },
    getPage(page) {
      this.tableData.currentPage = page;
      this.getList();
    },
    changePageSize(size) {
      this.tableData.currentPage = 1;
      this.tableData.pageSize = size;
      this.getList();
    },
    copyRow(row) {
      console.log(row);
    },
    deleteRow(item, row) {
      let _this = this;
      if (item.disabled) {
        return;
      }
      let param = {
        id: row.id
      };
      _this.$createDialog({
        title: _this.$t('page.warning'),
        content: (row.isLibReference == 1 ? this.$t('term.autoexec.currenttoolisalreadydependentonanothertool') : '') + _this.$t('page.confirm') + _this.$t('page.delete') + this.$t('term.autoexec.customtool') + '：' + row.name + '?',
        btnType: 'error',
        'on-ok': vnode => {
          _this.$api.autoexec.script.deleteScript(param).then(res => {
            if (res.Status == 'OK') {
              _this.getList();
              _this.$Message.success(this.$t('message.deletesuccess'));
            }
          }).finally(res => {
            vnode.isShow = false;
          });
        }
      });    
    },
    publishRow(item, row) {
      if (item.disabled) {
        return;
      }
      this.editId = row.id;
      this.showEdit = true;
    },
    exportRow(row) {
      let param = {
        url: 'api/binary/autoexec/script/export',
        params: {
          idList: [row.id]
        }
      };
      this.download(param);
    },
    doRow(type, item, row) {
      if (!type) {
        return;
      }
      if (type == 'generateToCombop') {
        this.publishRow(item, row);
      } else if (type == 'copy') {
        this.addScript(row.id, row.isLib);
      } else if (type == 'export') {
        this.exportRow(row);
      } else if (type == 'delete') {
        this.deleteRow(item, row);
      }
    },
    close(isRefresh) {
      this.editId = null;
      this.showEdit = false;
      if (isRefresh) {
        this.getPage(1);
      }
    },
    getSelected(indexList, itemList) {
      this.selectList = indexList;
    },
    exportList() {
      if (!this.selectList || this.selectList.length == 0) {
        return;
      }
      let param = {
        url: 'api/binary/autoexec/script/export',
        params: {
          idList: this.selectList
        }
      };
      this.download(param);
    },
    uploadAction() {
      if (!this.hasAuth) {
        return;
      }
      this.$refs.uploadDialog.showDialog();
    },
    renderCount(tab) {
      return (h) => {
        return h('div', [
          h('span', tab.text),
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
      this.selectList = [];
      this.versionStatus = name;
      this.tableData.currentPage = 1;
      if (name == 'passed') {
        this.tableData.theadList[0].key != 'selection' && (this.tableData.theadList.unshift({key: 'selection', multiple: true}));
      } else {
        this.tableData.theadList = this.tableData.theadList.filter(item => item.key != 'selection');
      }

      this.getList();
    },
    dealExecModeList(nodeList) {
      let columlist = [];
      if (nodeList && nodeList.length > 0) {
        columlist = nodeList.filter(item => {
          return item.value != 'native';
        });
      }
      return columlist;
    },
    dealTemplateData(list) {
      let dataList = [
        {
          text: this.$t('term.autoexec.alltemplates'),
          value: 0
        }
      ];
      if (list && list.length > 0) {
        list.forEach(item => {
          if (item.name && item.id) {
            dataList.push({
              text: item.name,
              value: item.id
            });
          }
        });
      }
      return dataList;
    },
    batchDeleteScript() {
      if (!this.selectList || this.selectList.length == 0) {
        return;
      }
      let _this = this;
      let param = {
        idList: this.selectList
      };
      _this.$createDialog({
        title: _this.$t('page.warning'),
        content: _this.$t('page.confirm') + _this.$t('page.delete') + '?',
        btnType: 'error',
        'on-ok': vnode => {
          _this.$api.autoexec.script.batchDeleteScript(param).then(res => {
            if (res.Status == 'OK') {
              _this.getList();
              let failedList = res.Return;
              if (failedList && failedList.length > 0) {
                _this.$Notice.error({
                  title: _this.$t('dialog.title.deleteconfirm'),
                  desc: failedList.join('、') + this.$t('term.autoexec.deletefailedcombinatetoolpresetcitetips')
                });
              } else {
                _this.$Message.success(_this.$t('message.deletesuccess'));
                this.selectList = [];
              }
            }
          }).finally(res => {
            vnode.isShow = false;
          });
        }
      });  
    },
    cancelImport() {
      this.$refs.uploadDialog.hideDialog();
    },
    replaceImport(data, fileList) {
      if (data && data.failureReasonList && fileList) {
        let fileNameList = [];
        let scriptIdList = [];
        data.failureReasonList.filter(item => item.isWarn == 1).forEach(e => {
          fileNameList.push(e.fileName);
          scriptIdList.push(e.id);
        });
        this.$set(this.uploadDialogData, 'scriptIdList', scriptIdList);
        this.$set(this.uploadDialogData, 'isReplace', 1);
        fileList = fileList.filter(item => fileNameList.includes(item.file.name));
        fileList.forEach(e => {
          e.Status = 0;
        });
        this.$nextTick(() => {
          this.$refs.uploadDialog.okImport(fileList);
        });
        this.$nextTick(() => {
          this.uploadDialogData = {
            isReplace: 0
          };
        });
      }
    },
    goto() {
      window.open(HOME + '/autoexec.html#/script-manage?status=submitted');
    }
  },
  computed: {
    getIcon() {
      return function(type, item) {
        let className = this.actionIcons[type] || 'tsfont-tool';
        if (item.disabled) {
          className += ' disable'; 
        }
        return className;
      };
    },
    hasAuth() { //新建权限
      return this.$store.getters.userAuthList.includes('AUTOEXEC_SCRIPT_MODIFY');
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
.script-manage{
  /deep/.ivu-tabs-bar{
    margin-bottom: 0px;
  }
  .description{
    max-width: 400px;
  }
}
</style>
