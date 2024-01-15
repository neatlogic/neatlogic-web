/* * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved. * * Licensed under the Apache License, Version 2.0 (the "License"); * you may not use this file except in compliance with the License. * You may obtain a copy of the License at * * http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law or agreed to in writing, software * distributed under the License is distributed on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. * See the License for the specific language governing permissions and * limitations under the License. */
<template>
  <div>
    <loading :loadingShow="loadingShow" type="fix"></loading>
    <TsContain :isSiderHide="isSiderHide" :enableCollapse="true">
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-if="treeData && treeData.length > 0 && $AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="action-item tsfont-setting" @click="editTree()">{{ $t('page.setting') }}</span>
          <span v-if="resourceIdList.length > 0 && $AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="action-item">
            <Dropdown trigger="click" placement="bottom-start">
              <div>
                <span>{{ $t('page.batchoperation') }}</span>
                <span class="tsfont-down"></span>
              </div>
              <DropdownMenu slot="list">
                <DropdownItem>
                  <div class="more-action" @click="addTag">{{ $t('dialog.title.addtarget', { target: $t('page.tag') }) }}</div>
                </DropdownItem>
                <DropdownItem>
                  <div class="more-action" @click="delTag">{{ $t('dialog.title.deletetarget', { target: $t('page.tag') }) }}</div>
                </DropdownItem>
                <DropdownItem divided>
                  <div class="more-action" @click="addAccount">{{ $t('dialog.title.addtarget', { target: $t('page.account') }) }}</div>
                </DropdownItem>
                <DropdownItem>
                  <div class="more-action" @click="delAccount">{{ $t('dialog.title.deletetarget', { target: $t('page.account') }) }}</div>
                </DropdownItem>
                <DropdownItem divided>
                  <div class="more-action" @click="delSelectedAsset">{{ $t('dialog.title.deletetarget', { target: $t('page.assets') }) }}</div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>
          <span
            v-if="ciData && ciData.isAbstract === 0 && ciData.isVirtual === 0 && ciData.authData && ciData.authData.cientityinsert"
            class="action-item tsfont-plus"
            @click="addAsset"
          >
            {{ $t('dialog.title.addtarget', { target: $t('page.assets') }) }}
          </span>
          <span v-if="tableConfig && tableConfig.tbodyList && tableConfig.tbodyList.length > 0" class="action-item tsfont-export" @click="openExportDialog">{{ $t('page.export') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <CombineSearcher
            v-show="isSimpleMode"
            ref="combineSearcher"
            v-model="searchVal"
            v-bind="searchConfig"
            @confirm="changeCombineSearcher"
            @change-label="changeLabelCombineSearcher"
            @switchMode="switchMode"
          >
            <template v-slot:batchSearchList="{ valueConfig }">
              <div>
                <TsFormItem :label="$t('page.batchsearch')" :tooltip="$t('term.cmdb.resourcebatchsearchtooltip')" labelPosition="left">
                  <TsFormRadio v-model="valueConfig.searchField" :dataList="searchFieldRadioDataList"></TsFormRadio>
                </TsFormItem>
                <TsFormItem :label="$t('page.batchsearchvalue')" labelWidth="0px" labelPosition="left">
                  <TsFormInput
                    v-model="valueConfig.batchSearchList"
                    type="textarea"
                    :placeholder="'192.168.0.1\n192.168.0.2\n192.168.0.*'"
                    :autoSize="{ minRows: 4 }"
                  ></TsFormInput>
                </TsFormItem>
              </div>
            </template>
          </CombineSearcher>
          <AdvancedModeSearch
            v-show="!isSimpleMode"
            ref="advancedModeSearch"
            v-model="searchVal"
            :searchList="searchList"
            @search="advancedModeSearch"
            @switchMode="switchMode"
          >
          </AdvancedModeSearch>
        </div>
      </template>
      <template v-slot:sider>
        <span v-if="$utils.isEmpty(treeData) && $AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="text-href" @click="editTree()">{{ $t('term.cmdb.resourcetypetreesettingdesc') }}</span>
        <Tree 
          v-if="!$utils.isEmpty(treeData)"
          :data="treeData"
          :render="renderContent"
          class="ts-tree"
          @on-select-change="selectTreeNode"
        ></Tree>
      </template>
      <template v-slot:content>
        <TsTable
          v-if="!loadingShow"
          v-model="selectList"
          v-bind="tableConfig"
          :theadList="theadList"
          :multiple="true"
          :selectedRemain="selectedRemain"
          :loading="loading"
          :hideAction="hasResourceCenterAuth"
          @getSelected="getSelected"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template v-slot:ip="{ row }">
            <span class="text-href" @click.stop="gotoDetails(row)">
              <span>{{ row.ip }}</span>
              <span v-if="row.port">:{{ row.port }}</span>
            </span>
          </template>
          <template v-slot:accountList="{ row }">
            <GroupList :dataList="row.accountList" type="slot" textName="name">
              <template v-slot:top="data">
                <Tag v-if="getText(data.item, 'name')">{{ getText(data.item, 'name') }} ({{ getText(data.item, 'account') }} / {{ getText(data.item, 'protocol') }})</Tag>
              </template>
              <template v-slot:drop="data">
                <Tag>{{ getText(data.item, 'name') }} ({{ getText(data.item, 'account') }} / {{ getText(data.item, 'protocol') }})</Tag>
              </template>
            </GroupList>
          </template>
          <template v-slot:monitorTime="{ row }">
            <!-- 监控状态 -->
            <span v-if="row.monitorStatusJson && row.monitorTime" :title="row.monitorTime | formatDate">
              <span class="inspectTime-class">
                <span :class="[row.monitorStatusJson.cssClass, { 'background-FATAL': row.monitorStatusJson.value == 'FATAL' }]" class="vertical">{{ row.monitorStatusJson.text }}</span>
                <span class="text-title">{{ formatTime(row.monitorTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }} {{ $t('page.before') }}</span>
              </span>
            </span>

            <span v-else>
              <span>-</span>
            </span>
          </template>
          <template v-slot:inspectTime="{ row }">
            <!-- 巡检状态 -->
            <span v-if="row.inspectStatusJson && row.inspectTime" :title="row.inspectTime | formatDate">
              <span class="inspectTime-class">
                <span :class="[row.inspectStatusJson.cssClass, { 'background-FATAL': row.inspectStatusJson.value == 'FATAL' }]" class="vertical">{{ row.inspectStatusJson.text }}</span>
                <span class="text-title">{{ formatTime(row.inspectTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }} {{ $t('page.before') }}</span>
              </span>
            </span>

            <span v-else>
              <span>-</span>
            </span>
          </template>
          <template v-slot:appModuleName="{ row }">
            <span v-if="row.appModuleName || row.appModuleAbbrName">
              <span v-if="row.appModuleName">{{ row.appModuleName }}</span>
              <span v-if="row.appModuleAbbrName" class="text-tip">({{ row.appModuleAbbrName }})</span>
            </span>
            <span v-else>-</span>
          </template>
          <template v-slot:appSystemName="{ row }">
            <span v-if="row.appSystemName || row.appSystemAbbrName">
              <span v-if="row.appSystemName">{{ row.appSystemName }}</span>
              <span v-if="row.appSystemAbbrName" class="text-tip">({{ row.appSystemAbbrName }})</span>
            </span>
            <span v-else>-</span>
          </template>
          <template v-slot:action="{ row }">
            <!-- 是否是巡检页面 -->
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-auth="'RESOURCECENTER_MODIFY'" class="tsfont-label" @click="tagEdit(row)">{{ $t('page.tagmanage') }}</li>
                <li v-auth="'RESOURCECENTER_MODIFY'" class="tsfont-userinfo" @click="editAccount(row)">{{ $t('page.accountsmanage') }}</li>
                <li v-if="row.isCanEdit" class="tsfont-edit" @click="editAsset(row)">{{ $t('dialog.title.edittarget', { target: $t('page.assets') }) }}</li>
                <li v-if="row.isCanDelete" class="tsfont-trash-o" @click="deleteAsset(row)">{{ $t('dialog.title.deletetarget', { target: $t('page.assets') }) }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <TagEdit
      v-if="isMangeShow"
      :operateType="operateType"
      :settingForm="settingForm"
      :title="showDialog.title"
      :resourceIdList="resourceIdList"
      :settingConfig="settingConfig"
      @success="success"
      @close="close"
      @refreshTagList="refreshTagList"
    ></TagEdit>
    <AcountEdit
      v-if="isAddAccountShow"
      :operateType="operateType"
      :resourceId="resourceId"
      :resourceIdList="resourceIdList"
      :accountList="accountList"
      :accountslist="accountslist"
      @success="success"
      @closeDialog="closeAddAccount"
    ></AcountEdit>
    <AccountEditDialog v-if="isShowAccountEditDialog" :resourceId="resourceId" @close="closeAccountEditDialog"></AccountEditDialog>
    <DeleteCiEntityDialog
      v-if="isDeleteDialogShow"
      :allowDelete="true"
      :allowCommit="true"
      :ciEntityId="ciEntityId"
      :ciEntityList="ciEntityList"
      @close="closeDeleteDialog"
    ></DeleteCiEntityDialog>
    <AssetEdit
      v-if="isEditAssetDialogShow"
      :ciEntityId="ciEntityId"
      :ciId="ciId"
      @close="closeCiEntityDialog"
    ></AssetEdit>
    <ExportAsset
      v-if="isExportAssetDialog"
      :selectList="selectList"
      :typeId="selectType.typeId"
      :exportCondition="searchVal"
      @close="isExportAssetDialog = false"
    ></ExportAsset>
    <TreeEdit 
      v-if="isShowTreeEdit"
      :ciId="treeTypeRootCiId"
      @close="closeTreeEdit"
    ></TreeEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    GroupList: resolve => require(['@/resources/components/GroupList/GroupList.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    AcountEdit: resolve => require(['./components/acount-edit'], resolve),
    DeleteCiEntityDialog: resolve => require(['../cientity/cientity-delete-dialog.vue'], resolve),
    AssetEdit: resolve => require(['./asset-edit-dialog.vue'], resolve),
    TagEdit: resolve => require(['./components/tag-edit'], resolve),
    TreeEdit: resolve => require(['./components/tree-edit'], resolve),
    ExportAsset: resolve => require(['./export-asset-dialog.vue'], resolve),
    AccountEditDialog: resolve => require(['./components/account-edit-dialog'], resolve),
    AdvancedModeSearch: resolve => require(['./advanced-mode-search'], resolve) // 高级模式搜索
  },
  filters: {},
  data() {
    return {
      isSimpleMode: true,
      isShowAccountEditDialog: false,
      loadingShow: true,
      selectedRemain: true,
      selectList: [],
      isDeleteDialogShow: false, //删除资产确认窗口
      isEditAssetDialogShow: false, //编辑资产窗口
      ciEntityId: null, //当前编辑或删除的配置id
      ciId: null, //当前编辑的配置项模型id
      ciEntityList: [],
      selectedCiEntityList: [], // 选中的配置项列表
      ciData: {}, //当前配置项模型数据
      isSiderHide: false,
      accountslist: [],
      isAddAccountShow: false,
      selectType: {
        typeId: ''
      },
      isMangeShow: false,
      showDialog: {
        type: 'modal',
        title: '',
        maskClose: false,
        isShow: false,
        width: 'medium'
      },
      resourceId: 0,
      resourceIdList: [],
      tagList: [],
      loading: false,
      treeData: [],
      disabled: false,
      operateType: '',
      accountList: [],
      searchFieldRadioDataList: [
        {
          value: 'ip',
          text: this.$t('page.ip')
        },
        {
          value: 'name',
          text: this.$t('page.name')
        }
      ],
      searchVal: {
        searchField: 'ip'
      },
      searchConfig: {
        isShowAdvanceMode: true,
        searchMode: 'clickBtnSearch',
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
            onChange: val => {
              let appSystemIdList = [];
              appSystemIdList = this.searchConfig.searchList.filter(item => {
                return item.name == 'appModuleIdList';
              });
              if (!this.$utils.isEmpty(appSystemIdList)) {
                appSystemIdList[0].params.appSystemIdList = val;
              }
              if (val) {
                this.$nextTick(() => {
                  if (this.searchVal && this.searchVal.appModuleIdList) {
                    this.$delete(this.searchVal, 'appModuleIdList');
                    this.changeCurrent();
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
            type: 'checkbox',
            name: 'inspectStatusList',
            label: this.$t('term.autoexec.inspectstatus'),
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.common.constvalue.InspectStatus' },
            multiple: true,
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
            label: this.$t('page.protocol'),
            multiple: true,
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getProtocolDataList,
            transfer: true,
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
          title: this.$t('term.inspect.monitoringstate'),
          key: 'monitorTime'
        },
        {
          title: this.$t('term.autoexec.inspectstatus'),
          key: 'inspectTime'
        },
        // {
        //   title: '巡检作业状态', // 需求变更，屏蔽
        //   key: 'taskStatus'
        // },
        {
          title: this.$t('page.module'),
          key: 'appModuleName'
        },
        {
          title: this.$t('page.apply'),
          key: 'appSystemName'
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
          title: this.$t('page.account'),
          key: 'accountList'
        },
        {
          title: this.$t('page.description'),
          key: 'description'
        },
        {
          title: '',
          key: 'action'
        }
      ],
      tableConfig: {
        keyName: 'id',
        tbodyList: [],
        currentPage: 1,
        pageSize: 20
      },
      settingConfig: {
        tagList: []
      },
      settingForm: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        tagList: {
          type: 'slot',
          name: 'tagList',
          label: this.$t('page.tag'),
          transfer: true,
          multiple: true,
          tagList: [],
          search: true,
          allowCreate: true,
          dynamicUrl: 'api/rest/resourcecenter/tag/name/list/forselect',
          rootName: 'tbodyList',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.tag') }) }, 'name-special']
        }
      },
      implementName: '',
      isExportAssetDialog: false,
      defaultValue: [],
      isShowTreeEdit: false,
      treeTypeRootCiId: null,
      searchList: [
        {
          name: 'appSystemIdList',
          type: 'select',
          label: this.$t('page.apply'),
          search: true,
          transfer: true,
          defaultValue: [],
          rootName: 'tbodyList',
          multiple: true,
          dealDataByUrl: 'getAppForselect',
          dynamicUrl: '/api/rest/resourcecenter/appsystem/list/forselect',
          validateList: [{name: 'required', message: ''}]
        },
        {
          name: 'appModuleIdList',
          type: 'select',
          label: this.$t('page.module'),
          search: true,
          transfer: true,
          defaultValue: [],
          rootName: 'tbodyList',
          multiple: true,
          dealDataByUrl: 'getAppForselect',
          dynamicUrl: '/api/rest/resourcecenter/appmodule/list',
          validateList: [{name: 'required', message: ''}]
        },
        {
          name: 'envIdList',
          type: 'select',
          label: this.$t('page.environment'),
          search: true,
          textName: 'name',
          transfer: true,
          valueName: 'id',
          defaultValue: [],
          rootName: 'tbodyList',
          multiple: true,
          className: 'block-span',
          url: '/api/rest/resourcecenter/appenv/list/forselect',
          validateList: [{name: 'required', message: ''}]
        },
        {
          type: 'checkbox',
          name: 'inspectStatusList',
          label: this.$t('term.autoexec.inspectstatus'),
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.common.constvalue.InspectStatus' },
          multiple: true,
          className: 'block-span'
        },
        {
          name: 'ip',
          type: 'input',
          label: this.$t('page.ip'),
          validateList: [{name: 'required', message: ''}],
          maxlength: 256
        },
        {
          name: 'name',
          type: 'input',
          label: this.$t('page.name'),
          validateList: [{name: 'required', message: ''}],
          maxlength: 256
        },
        {
          name: 'vendorIdList',
          type: 'select',
          label: this.$t('page.manufacturer'),
          search: true,
          textName: 'description',
          transfer: true,
          valueName: 'id',
          defaultValue: [],
          rootName: 'tbodyList',
          multiple: true,
          dynamicUrl: '/api/rest/resourcecenter/vendor/list/forselect',
          params: {
            needPage: false
          },
          validateList: [{name: 'required', message: ''}]
        },
        {
          name: 'tagIdList',
          type: 'select',
          label: this.$t('page.tag'),
          search: true,
          textName: 'name',
          transfer: true,
          valueName: 'id',
          defaultValue: [],
          rootName: 'tbodyList',
          multiple: true,
          dynamicUrl: '/api/rest/resourcecenter/tag/list/forselect',
          validateList: [{name: 'required', message: ''}]
        },
        {
          name: 'protocolIdList',
          type: 'select',
          label: this.$t('page.protocol'),
          search: true,
          transfer: true,
          defaultValue: [],
          rootName: 'tbodyList',
          multiple: true,
          dealDataByUrl: 'getProtocolDataList',
          className: 'block-span',
          dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
          validateList: [{name: 'required', message: ''}]
        },
        {
          name: 'stateIdList',
          type: 'select',
          label: this.$t('term.autoexec.assetstatus'),
          search: true,
          textName: 'description',
          transfer: true,
          valueName: 'id',
          defaultValue: [],
          rootName: 'tbodyList',
          multiple: true,
          className: 'block-span',
          params: {
            'needPage': false
          },
          url: '/api/rest/resourcecenter/state/list/forselect',
          validateList: [{name: 'required', message: ''}]
        }]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    let {resourceId = ''} = this.$route.query || {};
    this.defaultValue = resourceId ? [parseInt(resourceId)] : [];
    await this.getTreeType();
    await this.initData();
    if (resourceId) {
      this.editAccount({ id: parseInt(resourceId) });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async initData() {
      await this.searchAssetData();
      await this.listForselect();
      await this.listAccount();
      if (this.$route.query && this.$route.query.isAddAccountShow) {
        let assetIpList = sessionStorage.getItem('assetIpList');
        assetIpList && (this.resourceIdList = JSON.parse(assetIpList));
        this.operateType = 'addAccount';
        if (this.resourceIdList.length > 0) {
          let row = {
            id: this.resourceIdList[0].id
          };
          this.editAccount(row);
        }
      }
    },
    changeCurrent(currentPage = 1) {
      this.tableConfig.currentPage = currentPage;
      if (this.isSimpleMode) {
        this.searchAssetData();
      } else {
        this.advancedModeSearch(this.searchVal);
      }
    },
    changePageSize(pageSize) {
      this.tableConfig.currentPage = 1;
      this.tableConfig.pageSize = pageSize;
      if (this.isSimpleMode) {
        this.searchAssetData();
      } else {
        this.advancedModeSearch(this.searchVal);
      }
    },
    formatTime(time) {
      let data = '-';
      if (time) {
        data = Date.parse(new Date()) - time;
      }
      return data;
    },
    getText(obj, name) {
      // obj 对象，name获取对象的名称
      if (obj && obj.hasOwnProperty(name)) {
        return obj[name];
      } else {
        return '';
      }
    },
    async listForselect() {
      await this.$api.cmdb.asset.listTag({}).then(res => {
        let resdata = res.Return || {};
        this.settingForm.tagList.tagList = resdata;
      });
    },
    async listAccount() {
      await this.$api.cmdb.asset.searchAccount({}).then(res => {
        let resdata = res.Return || {};
        this.accountslist = resdata;
        this.loadingShow = false;
      });
    },
    closeDeleteDialog(needRefresh) {
      this.isDeleteDialogShow = false;
      this.selectedCiEntityList = [];
      this.ciEntityList = [];
      this.selectList = [];
      if (needRefresh) {
        this.tableConfig.currentPage = 1;
        this.searchAssetData(true);
      }
    },
    getTreeType() {
      //获取树形类型
      return this.$api.cmdb.asset.getResourceTreeType().then(res => {
        let data = res.Return;
        this.treeTypeRootCiId = data[0]?.id;
        if (this.selectType.typeId) {
          this.setTreeDataSelect(this.selectType.typeId, data);
        } else {
          if (data[0]) {
            data[0].selected = true;
            data[0].expand = true;
            this.selectType = {
              typeId: data[0].id
            };
            this.implementName = data[0].label + '(' + data[0].name + ')' + this.$t('term.inspect.inspect');
          }
        }
        this.treeData = data;
      });
    },
    setTreeDataSelect(typeId, data, parentData) {
      if (data && data.length > 0) {
        data.forEach(d => {
          d._parent = parentData;
          if (d.id == typeId) {
            d.selected = true;
            this.setTreeDataExpand(d);
          } else {
            if (d.children) {
              this.setTreeDataSelect(typeId, d.children, d);
            }
          }
        });
      }
    },
    setTreeDataExpand(data) {
      data.expand = true;
      if (data._parent) {
        this.setTreeDataExpand(data._parent);
      }
    },
    searchAssetData(isEmptySelected) {
      //获取表格数据
      if (!this.selectType.typeId) {
        return;
      }
      let params = {
        batchSearchList: [],
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize,
        ...this.searchVal,
        ...this.selectType
      };
      if (!this.$utils.isEmpty(params.batchSearchList)) {
        params.batchSearchList = params.batchSearchList.split('\n');
      }
      if (this.defaultValue && this.defaultValue.length > 0) {
        params.defaultValue = this.defaultValue;
        this.$addHistoryData('defaultValue', this.defaultValue);
      }
      this.$addHistoryData('searchVal', this.searchVal);
      this.$addHistoryData('selectType', this.selectType);
      this.$addHistoryData('currentPage', params.currentPage);
      this.$addHistoryData('pageSize', params.pageSize);
      return this.$api.cmdb.asset
        .getResourceList(params)
        .then(res => {
          if (isEmptySelected) {
            this.selectedRemain = false;
          }
          this.tableConfig = Object.assign(this.tableConfig, res.Return);
          this.$set(this.searchVal, 'searchField', params.searchField);
        })
        .finally(() => {
          this.loading = false;
          this.selectedCiEntityList = [];
        });
    },
    renderContent(h, { root, node, data }) {
      //渲染树的lable名称
      return h('span', {
        staticClass: '',
        domProps: {
          innerHTML: data.label
        }
      });
    },
    selectTreeNode(nodeList, node) {
      //选中类型
      this.selectType = {
        typeId: node.id
      };
      this.implementName = node.label + '(' + node.name + ')' + this.$t('term.inspect.inspect');
      //检查当前模型是否抽象模型，非抽象模型才显示添加资产按钮
      this.getCiById(node.id);
      //查询资源数据
      if (this.isSimpleMode) {
        this.changeCurrent();
      } else {
        this.advancedModeSearch(this.searchVal);
      }
    },
    getCiById(ciId) {
      this.$api.cmdb.ci.getCiById(ciId, true).then(res => {
        this.ciData = res.Return;
      });
    },
    getSelected(indexList, itemList) {
      this.resourceIdList = itemList;
      this.selectedCiEntityList = this.$utils.deepClone(itemList || []);
      this.selectedRemain = true;
    },
    tagEdit(row) {
      this.resourceIdList = [row.id];
      this.batchAction(this.$t('page.tagmanage'), 'tagEdit');
      this.settingConfig.tagList = row.tagList;
    },
    editAccount(row) {
      if (row && row.id) {
        this.isShowAccountEditDialog = true;
        this.resourceId = row.id;
      }
    },
    closeAccountEditDialog(needFresh) {
      this.resourceId = null;
      this.isShowAccountEditDialog = false;
      if (needFresh) {
        this.searchAssetData();
      }
    },
    addAsset() {
      this.ciEntityId = null;
      this.ciId = this.selectType.typeId;
      this.isEditAssetDialogShow = true;
    },
    editAsset(row) {
      this.ciEntityId = row.id;
      this.ciId = row.typeId;
      this.isEditAssetDialogShow = true;
    },
    closeCiEntityDialog(needRefresh) {
      this.ciEntityId = null;
      this.ciId = null;
      this.isEditAssetDialogShow = false;
      if (needRefresh) {
        this.searchAssetData();
      }
    },
    deleteAsset(row) {
      this.ciEntityId = row.id;
      this.ciEntityList = [];
      this.isDeleteDialogShow = true;
    },
    delSelectedAsset() {
      this.ciEntityList = this.selectedCiEntityList?.map((item) => ({
        ciId: item.typeId,
        ciEntityId: item.id, 
        ciEntityName: item.name
      })) || [];
      this.ciEntityId = null;
      this.isDeleteDialogShow = true;
    },
    async success(msg) {
      await this.searchAssetData(true);
      this.$Message.success(msg);
      this.resourceIdList = [];
      this.selectList = [];
      this.selectedRemain = true;
      this.isAddAccountShow = false;
    },
    gotoDetails(row) {
      this.$router.push({ path: '/ci/' + row.typeId + '/cientity-view/' + row.id });
    },
    urlOpen(row) {
      window.open(HOME + '/cmdb.html#/ci/' + row.typeId + '/cientity-view/' + row.id, '_blank');
    },
    inspection(row) {
      this.$router.push({ path: './assets-detail-' + row.id });
    },
    // 跳转标签管理页面
    gotoTag() {
      window.open(HOME + '/cmdb.html#/tag-manage?isNewAccountShow=' + true, '_blank');
    },
    batchAction(title, type) {
      this.isMangeShow = true;
      this.showDialog.title = title;
      this.operateType = type;
      this.settingConfig.tagList = [];
    },
    accountAction(title, type) {
      this.isAddAccountShow = true;
      this.showDialog.title = title;
      this.operateType = type;
      this.settingConfig.tagList = [];
      this.accountList = [];
    },
    // 批量操作
    addTag() {
      this.batchAction(this.$t('dialog.title.batchaddtarget', { target: this.$t('page.tag') }), 'addTag');
    },
    addAccount() {
      this.accountAction(this.$t('dialog.title.batchaddtarget', { target: this.$t('page.account') }), 'addAccount');
    },
    delTag() {
      this.batchAction(this.$t('dialog.title.batchdeletetarget', { target: this.$t('page.tag') }), 'delTag');
    },
    delAccount() {
      this.accountAction(this.$t('dialog.title.batchdeletetarget', { target: this.$t('page.account') }), 'delAccount');
    },
    // 刷新标签列表
    refreshTagList() {
      this.listForselect();
      this.$Message.success(this.$t('message.refreshsuccess'));
    },
    close() {
      this.isMangeShow = false;
    },
    closeAddAccount(needFresh) {
      this.isAddAccountShow = false;
      if (needFresh) {
        this.searchAssetData();
      }
    },
    // 巡检功能
    implement(row, once) {
      // combopId 树的id
      let id = this.selectType.typeId;
      let data = {};
      if (once == 'one') {
        // 点击具体的一个
        id = row.id;
        data = {
          roundCount: 64,
          combopId: '',
          source: 'inspect',
          param: {},
          name: row.name + this.$t('term.inspect.inspect'),
          typeLabel: row.typeLabel,
          typeName: row.typeName,
          executeConfig: {
            executeNodeConfig: { selectNodeList: [{ id: id, ip: row.ip, name: row.name, port: row.port }] }
          }
        };
      } else if (once == 'move') {
        data = {
          roundCount: 64,
          combopId: '',
          source: 'inspect',
          param: {},
          name: this.implementName,
          executeConfig: {
            executeNodeConfig: { filter: { typeIdList: [] } }
          }
        };
      } else if (once == 'timing') {
        // data = row;
      }
      this.$emit('implement', data, id, once);
    },
    restoreHistory(historyData) {
      this.searchVal = historyData['searchVal'];
      this.selectType = historyData['selectType'];
      this.tableConfig.currentPage = historyData['currentPage'];
      this.tableConfig.pageSize = historyData['pageSize'];
      this.defaultValue = historyData['defaultValue'];
    },
    openExportDialog() {
      this.isExportAssetDialog = true;
    },
    changeCombineSearcher(val) {
      if (this.$utils.isEmpty(val)) {
        this.$set(this.searchVal, 'searchField', 'ip');
      }
      this.changeCurrent();
    },
    changeLabelCombineSearcher(val) {
      if (!this.$utils.isEmpty(this.searchVal.batchSearchList)) {
        this.$set(val, 'batchSearchList', this.searchVal.batchSearchList.split('\n'));
      }
    },
    editTree() {
      this.isShowTreeEdit = true;
    },
    async closeTreeEdit(action) {
      this.isShowTreeEdit = false;
      if (action == 'refresh') {
        this.treeTypeRootCiId = null;
        this.selectType.typeId = null;
        await this.getTreeType();
        await this.initData();
      }
    },
    switchMode() {
      // 切换模式
      this.isSimpleMode = !this.isSimpleMode;
      this.$refs.advancedModeSearch && this.$refs.advancedModeSearch.openDropdown(); // 切换到简单模式，把高级模式关闭
      this.$nextTick(() => {
        this.$refs.combineSearcher && this.$refs.combineSearcher.handleToggleOpen(); // 打开简单模式面板
      });
      this.tableConfig.currentPage = 1; // 切换不同搜索模式时，页码设置为初始值
      this.tableConfig.pageSize = 20;
    },
    advancedModeSearch(searchVal) {
      // 复杂模式搜索
      let params = {
        currentPage: this.tableConfig.currentPage || 1,
        pageSize: this.tableConfig.pageSize || 20,
        typeId: this.selectType.typeId,
        ...searchVal
      };
      this.loadingShow = true;
      this.$api.autoexec.action.searchResourceCustomList(params).then(res => {
        if (res.Status == 'OK') {
          this.tableConfig = Object.assign(this.tableConfig, res.Return || {});
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  computed: {
    hasResourceCenterAuth() {
      //判断是否有资源中心管理权限
      return this.$store.getters.userAuthList.includes('RESOURCECENTER_MODIFY');
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.vertical {
  vertical-align: baseline;
  font-size: 12px;
}
.inspectTime-class {
  display: flex;
  align-items: center;
}
</style>
