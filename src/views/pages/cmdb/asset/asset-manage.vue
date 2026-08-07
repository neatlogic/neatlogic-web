<template>
  <div>
    <loading :loadingShow="loadingShow" type="fix"></loading>
    <TsContain :isSiderHide="isSiderHide" :enableCollapse="true">
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-if="!$utils.isEmpty(rootCiName) && $AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="action-item tsfont-setting" @click="editTree()">{{ $t('page.setting') }}</span>
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
          <span v-if="ciData && ciData.isAbstract === 0 && ciData.isVirtual === 0 && ciData.authData && ciData.authData.cientityinsert" class="action-item tsfont-plus" @click="addAsset">
            {{ $t('dialog.title.addtarget', { target: $t('page.assets') }) }}
          </span>
          <span v-if="tableConfig && tableConfig.tbodyList && tableConfig.tbodyList.length > 0" class="action-item tsfont-download" @click="openExportDialog">{{ $t('page.export') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <CombineSearcher
            v-show="isSimpleMode"
            ref="combineSearcher"
            v-model="searchVal"
            v-bind="searchConfig"
            @change="changeCombineSearcher"
            @switchMode="switchMode"
          >
            <template v-slot:batchSearchList="{ valueConfig, textConfig }">
              <div>
                <TsFormItem :label="$t('page.batchsearch')" :tooltip="$t('term.cmdb.resourcebatchsearchtooltip')" labelPosition="left">
                  <TsFormRadio
                    v-model="valueConfig.searchField"
                    :dataList="searchFieldRadioDataList"
                    @change="
                      () => {
                        $set(valueConfig, 'batchSearchList', '');
                        $delete(textConfig, 'batchSearchList');
                      }
                    "
                  ></TsFormRadio>
                </TsFormItem>
                <TsFormItem :label="$t('page.batchsearchvalue')" labelWidth="0px" labelPosition="left">
                  <TsFormInput
                    v-model="valueConfig.batchSearchList"
                    type="textarea"
                    :placeholder="'192.168.0.1\n192.168.0.2\n192.168.0.*'"
                    :autoSize="{ minRows: 4 }"
                    @change="
                      val => {
                        if (val) {
                          $set(textConfig, 'batchSearchList', val.split('\n'));
                        } else {
                          $delete(textConfig, 'batchSearchList');
                          $delete(valueConfig, 'batchSearchList');
                        }
                      }
                    "
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
          ></AdvancedModeSearch>
        </div>
      </template>
      <template v-slot:sider>
        <ResourceTypeTree
          :key="resourceTypeTreeKey"
          v-model="selectType.typeId"
          class="resource-type-tree"
          @load="handleResourceTypeLoad"
          @change="handleResourceTypeChange"
        >
          <template v-slot:empty="{ rootCiName: slotRootCiName }">
            <span v-if="$utils.isEmpty(slotRootCiName) && $AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="text-href" @click="editTree()">{{ $t('term.cmdb.resourcetypetreesettingdesc') }}</span>
            <span v-else>{{ $t('page.nodata') }}</span>
          </template>
        </ResourceTypeTree>
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
          :canEdit="canEditThead()"
          @getSelected="getSelected"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
          @checkshow="saveAssetTheadSetting"
        >
          <template v-slot:ip="{ row }">
            <span class="text-href" @click.stop="urlOpen(row)">
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
      :title="showDialog.title"
      :resourceIdList="resourceIdList"
      :settingConfig="settingConfig"
      @success="tagSuccess"
      @close="close"
    ></TagEdit>
    <AcountEdit
      v-if="isAddAccountShow"
      :operateType="operateType"
      :resourceId="resourceId"
      :resourceIdList="resourceIdList"
      :accountList="accountList"
      @success="accountSuccess"
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
      :exportCondition="{
        ...(searchVal || {}),
        batchSearchList: searchVal && searchVal.batchSearchList ? searchVal.batchSearchList.split('\n') : []
      }"
      @close="isExportAssetDialog = false"
    ></ExportAsset>
    <TreeEdit v-if="isShowTreeEdit" :ciId="treeTypeRootCiId" @close="closeTreeEdit"></TreeEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    GroupList: () => import('@/resources/components/GroupList/GroupList.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    AcountEdit: () => import('./components/acount-edit'),
    DeleteCiEntityDialog: () => import('../cientity/cientity-delete-dialog.vue'),
    AssetEdit: () => import('./asset-edit-dialog.vue'),
    TagEdit: () => import('./components/tag-edit'),
    TreeEdit: () => import('./components/tree-edit'),
    ExportAsset: () => import('./export-asset-dialog.vue'),
    AccountEditDialog: () => import('./components/account-edit-dialog'),
    ResourceTypeTree: () => import('@/resources/components/ResourceTypeTree'),
    AdvancedModeSearch: () => import('./advanced-mode-search') // 高级模式搜索
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
      rootCiName: null,
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
      // 资产清单显示配置，和根模型配置共用 assetlist_display.config 存储
      assetListDisplayId: null,
      assetListDisplayConfig: {},
      // 表头显示字段存储方式：server 保存到数据库，对所有用户生效；local 保存到当前浏览器，只对当前用户生效
      assetTheadFieldStorageType: 'local',
      // 前端固定维护的资产清单可选表头
      assetTheadList: [],
      // 未配置过表头时沿用原资产清单默认展示列
      defaultTheadFieldList: [
        'ip',
        'typeLabel',
        'name',
        'monitorTime',
        'inspectTime',
        'appModuleName',
        'appSystemName',
        'allIp',
        'bgList',
        'ownerList',
        'stateName',
        'networkArea',
        'tagList',
        'maintenanceWindow',
        'accountList',
        'description'
      ],
      theadSaveTimer: null,
      displayedTheadFieldList: [],
      pendingAddedTheadFieldList: [],
      searchConfig: {
        isShowAdvanceMode: true,
        searchMode: 'clickBtnSearch',
        placeholder: this.$t('term.inspect.inputtargetnameip'),
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
            textName: 'name',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          }
        ]
      },
      theadList: [],
      tableConfig: {
        keyName: 'id',
        tbodyList: [],
        currentPage: 1,
        pageSize: 20,
        rowNum: 0
      },
      settingConfig: {
        tagList: []
      },
      implementName: '',
      isExportAssetDialog: false,
      defaultValue: [],
      pendingResourceId: null,
      assetTheadReady: false,
      assetDataInitialized: false,
      isShowTreeEdit: false,
      resourceTypeTreeKey: 0,
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
          validateList: [{ name: 'required', message: '' }]
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
          validateList: [{ name: 'required', message: '' }]
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
          validateList: [{ name: 'required', message: '' }]
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
          validateList: [{ name: 'required', message: '' }],
          maxlength: 256
        },
        {
          name: 'name',
          type: 'input',
          label: this.$t('page.name'),
          validateList: [{ name: 'required', message: '' }],
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
          validateList: [{ name: 'required', message: '' }]
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
          validateList: [{ name: 'required', message: '' }]
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
          validateList: [{ name: 'required', message: '' }]
        },
        {
          name: 'stateIdList',
          type: 'select',
          label: this.$t('term.autoexec.assetstatus'),
          search: true,
          transfer: true,
          defaultValue: [],
          multiple: true,
          className: 'block-span',
          url: '/api/rest/resourcecenter/state/list/forselect',
          params: { needPage: false },
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          validateList: [{ name: 'required', message: '' }]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    let { resourceId = '' } = this.$route.query || {};
    this.defaultValue = resourceId ? [parseInt(resourceId)] : [];
    this.pendingResourceId = resourceId ? parseInt(resourceId) : null;
    await this.initAssetTheadSetting();
    this.assetTheadReady = true;
    await this.loadAssetDataByType({ initial: true });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.theadSaveTimer && clearTimeout(this.theadSaveTimer);
  },
  destroyed() {},
  methods: {
    canEditThead() {
      if (this.assetTheadFieldStorageType == 'server') {
        return this.$AuthUtils.hasRole('RESOURCECENTER_MODIFY');
      } else {
        return true;
      }
    },
    async initAssetTheadSetting() {
      // 全量表头固定在前端，再按已保存的显示/排序配置组装 TsTable 表头
      this.assetTheadList = this.getAssetTheadList();
      if (this.assetTheadFieldStorageType == 'server') {
        await this.getAssetlistSetting();
      } else {
        this.assetListDisplayConfig = this.getLocalAssetTheadConfig() || {};
      }
      this.applyAssetTheadSetting(this.assetListDisplayConfig);
    },
    getAssetlistSetting() {
      return this.$api.cmdb.resourceentity.getAssetlist().then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.assetListDisplayId = res.Return.id || null;
          this.assetListDisplayConfig = res.Return.config || {};
        }
      }).catch(() => {
        this.assetListDisplayConfig = {};
      });
    },
    getAssetTheadLocalStorageKey() {
      const userInfo = this.$store && this.$store.state ? (this.$store.state.userInfo || {}) : {};
      const userKey = userInfo.uuid || userInfo.userUuid || userInfo.userId || 'anonymous';
      return 'neatlogic.cmdb.assetManage.theadFieldList.' + userKey;
    },
    getLocalAssetTheadConfig() {
      const configStr = localStorage.getItem(this.getAssetTheadLocalStorageKey());
      if (!configStr) {
        return null;
      }
      try {
        return JSON.parse(configStr);
      } catch (e) {
        localStorage.removeItem(this.getAssetTheadLocalStorageKey());
        return null;
      }
    },
    saveLocalAssetTheadConfig(config) {
      localStorage.setItem(this.getAssetTheadLocalStorageKey(), JSON.stringify(config || {}));
    },
    getAssetTheadList() {
      // 资产清单全量表头固定在前端，避免每次打开页面都请求表头接口
      return [
        { key: 'id', title: 'ID' },
        { key: 'ip', title: this.$t('page.ipaddress') },
        { key: 'typeLabel', title: this.$t('page.type') },
        { key: 'name', title: this.$t('page.name') },
        { key: 'monitorTime', title: this.$t('term.inspect.monitoringstate') },
        { key: 'inspectTime', title: this.$t('term.autoexec.inspectstatus') },
        { key: 'envName', title: this.$t('page.environment') },
        { key: 'appModuleName', title: this.$t('page.module') },
        { key: 'appSystemName', title: this.$t('page.apply') },
        { key: 'allIp', title: this.$t('term.inspect.iplist'), type: 'tag', valueKey: 'ip' },
        { key: 'bgList', title: this.$t('term.autoexec.subordinatedepartment'), type: 'tag', valueKey: 'bgName' },
        { key: 'ownerList', title: this.$t('page.owner'), type: 'usercards' },
        { key: 'stateName', title: this.$t('term.autoexec.assetstatus') },
        { key: 'networkArea', title: this.$t('page.networkarea') },
        // { key: 'vendorName', title: this.$t('page.manufacturer') },
        // { key: 'dataCenterName', title: this.$t('term.inspect.datacenter') },
        { key: 'tagList', title: this.$t('page.tag'), type: 'tag' },
        { key: 'maintenanceWindow', title: this.$t('term.deploy.maintenancewindow') },
        { key: 'accountList', title: this.$t('page.account') },
        { key: 'description', title: this.$t('page.description') }
        // { key: 'fcu', title: '创建者' },
        // { key: 'fcd', title: '创建日期', type: 'time' },
        // { key: 'lcu', title: '修改者' },
        // { key: 'lcd', title: '修改日期', type: 'time' }
      ];
    },
    applyAssetTheadSetting(config = {}) {
      const allTheadMap = {};
      this.assetTheadList.forEach(item => {
        allTheadMap[item.key] = item;
      });
      // fieldList 保存全量字段的显示状态和排序，勾选/取消勾选不改变原有排序
      const fieldSettingList = this.getAssetTheadFieldSettingList(config);
      const fieldSettingMap = {};
      fieldSettingList.forEach(item => {
        fieldSettingMap[item.name] = item;
      });
      const fieldOrderList = fieldSettingList.map(item => item.name);
      // selection/action 为固定功能列，不参与用户显隐保存
      const theadList = [
        { key: 'selection', title: '', isShow: 1, isDisabled: true },
        ...fieldOrderList
          .filter(key => allTheadMap[key])
          .map(key => ({
            ...allTheadMap[key],
            isShow: fieldSettingMap[key] && fieldSettingMap[key].isShow == '1' ? 1 : 0
          })),
        { title: '', key: 'action', isShow: 1 }
      ];
      this.theadList = theadList;
      this.displayedTheadFieldList = this.getVisibleTheadFieldList(theadList);
    },
    getAssetTheadFieldSettingList(config = {}) {
      const configFieldList = Array.isArray(config.fieldList) ? config.fieldList : [];
      const configFieldMap = {};
      configFieldList
        .filter(item => item && item.name)
        .forEach((item, index) => {
          configFieldMap[item.name] = {
            name: item.name,
            isShow: item.isShow == '1' || item.isShow == 1 ? '1' : '0',
            sort: item.sort != null && item.sort !== '' && !isNaN(parseInt(item.sort)) ? parseInt(item.sort) : index
          };
        });
      const fieldSettingList = [];
      this.assetTheadList.forEach((item, index) => {
        if (configFieldMap[item.key]) {
          fieldSettingList.push(configFieldMap[item.key]);
        } else {
          fieldSettingList.push({
            name: item.key,
            isShow: this.defaultTheadFieldList.includes(item.key) ? '1' : '0',
            sort: index
          });
        }
      });
      return fieldSettingList
        .sort((a, b) => a.sort - b.sort)
        .map((item, index) => ({
          name: item.name,
          isShow: item.isShow,
          sort: index.toString()
        }));
    },
    saveAssetTheadSetting(theadList = []) {
      // TsTable 在勾选和拖拽排序时都会触发 checkshow，这里统一持久化
      const fieldTheadList = theadList.filter(item => item.key && !['selection', 'action'].includes(item.key));
      const fieldList = fieldTheadList.map((item, index) => ({
        name: item.key,
        isShow: item.isShow || item.isShow == undefined ? '1' : '0',
        sort: index.toString()
      }));
      const visibleFieldList = fieldList.filter(item => item.isShow == '1').map(item => item.name);
      if (this.$utils.isEmpty(visibleFieldList)) {
        this.$Message.warning(this.$t('form.placeholder.pleaseselect', { target: this.$t('page.field') }));
        return;
      }
      // 同步 TsTable 内部拖拽后的最新表头顺序，避免勾选隐藏字段并刷新数据时回退到父组件旧顺序
      this.theadList = theadList.map(item => ({ ...item }));
      const oldDisplayedTheadFieldList = this.displayedTheadFieldList || [];
      const addedFieldList = visibleFieldList.filter(field => !oldDisplayedTheadFieldList.includes(field));
      this.displayedTheadFieldList = visibleFieldList;
      this.pendingAddedTheadFieldList = this.uniqArray([...this.pendingAddedTheadFieldList, ...addedFieldList]);
      this.theadSaveTimer && clearTimeout(this.theadSaveTimer);
      // 拖拽排序会连续触发，短暂防抖避免频繁保存
      this.theadSaveTimer = setTimeout(() => {
        const pendingAddedTheadFieldList = this.pendingAddedTheadFieldList;
        this.pendingAddedTheadFieldList = [];
        const config = {
          ...(this.assetListDisplayConfig || {}),
          fieldList: fieldList
        };
        if (this.assetTheadFieldStorageType == 'local') {
          this.saveLocalAssetTheadConfig(config);
          this.assetListDisplayConfig = config;
          this.refreshAssetDataWhenAddVisibleThead(pendingAddedTheadFieldList);
        } else {
          const data = {
            id: this.assetListDisplayId,
            rootCiName: this.rootCiName,
            config: config
          };
          this.$api.cmdb.resourceentity.saveAssetlistData(data).then(res => {
            if (res.Status == 'OK') {
              this.assetListDisplayConfig = config;
              this.refreshAssetDataWhenAddVisibleThead(pendingAddedTheadFieldList);
            }
          });
        }
      }, 300);
    },
    getVisibleTheadFieldList(theadList = this.theadList) {
      return (theadList || [])
        .filter(item => item.key && !['selection', 'action'].includes(item.key))
        .filter(item => item.isShow || item.isShow == undefined)
        .map(item => item.key);
    },
    refreshAssetDataWhenAddVisibleThead(addedFieldList = []) {
      if (this.$utils.isEmpty(addedFieldList)) {
        return;
      }
      const tbodyFieldList = this.tableConfig.theadFieldList || [];
      const hasAddedFieldData = addedFieldList.every(field => tbodyFieldList.includes(field));
      if (hasAddedFieldData) {
        return;
      }
      this.searchAssetData();
    },
    uniqArray(list = []) {
      const resultList = [];
      list.forEach(item => {
        if (item && !resultList.includes(item)) {
          resultList.push(item);
        }
      });
      return resultList;
    },
    async initData() {
      await this.searchAssetData();
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
        return this.searchAssetData();
      } else {
        return this.advancedModeSearch(this.searchVal);
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
    closeDeleteDialog(needRefresh) {
      this.isDeleteDialogShow = false;
      this.selectedCiEntityList = [];
      this.ciEntityList = [];
      this.selectList = [];
      if (needRefresh) {
        this.tableConfig.currentPage = 1;
        this.tableConfig.rowNum = 0;
        this.searchAssetData(true);
      }
    },
    getTreeType() {
      //获取树形类型
      return this.$api.cmdb.asset.getResourceTreeType().then(res => {
        this.rootCiName = res.Return.rootCiName;
        let data = res.Return.tbodyList;
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
    handleResourceTypeLoad({ rootCiName = '', rootNode = null } = {}) {
      this.rootCiName = rootCiName;
      this.treeTypeRootCiId = rootNode && rootNode.id ? rootNode.id : null;
      if (!rootNode) {
        this.clearAssetTable();
      }
    },
    async handleResourceTypeChange({ selectedId, node, selected } = {}) {
      if (!selected || !selectedId) {
        this.selectType = { typeId: null };
        this.implementName = '';
        this.ciData = {};
        this.clearAssetTable();
        return;
      }
      this.selectType = {
        typeId: selectedId
      };
      this.implementName = node ? (node.label + '(' + node.name + ')' + this.$t('term.inspect.inspect')) : '';
      this.getCiById(selectedId);
      await this.loadAssetDataByType({ initial: true });
    },
    async loadAssetDataByType({ initial = false } = {}) {
      if (!this.assetTheadReady || !this.selectType.typeId) {
        return;
      }
      if (initial && !this.assetDataInitialized) {
        this.assetDataInitialized = true;
        await this.initData();
      } else if (this.isSimpleMode) {
        await this.changeCurrent();
      } else {
        await this.advancedModeSearch(this.searchVal);
      }
      if (this.pendingResourceId && this.tableConfig.tbodyList && this.tableConfig.tbodyList.some(item => item.id == this.pendingResourceId)) {
        this.editAccount({ id: this.pendingResourceId });
        this.pendingResourceId = null;
      }
    },
    clearAssetTable() {
      this.tableConfig = {
        ...this.tableConfig,
        tbodyList: [],
        currentPage: 1,
        rowNum: 0
      };
      this.resourceIdList = [];
      this.selectedCiEntityList = [];
      this.selectList = [];
      this.selectedRemain = false;
      this.loading = false;
      this.loadingShow = false;
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
        this.clearAssetTable();
        return;
      }
      if (this.tableConfig.currentPage == 1) {
        this.tableConfig.rowNum = 0;
      }
      let params = {
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize,
        rowNum: this.tableConfig.rowNum,
        ...this.searchVal,
        ...this.selectType,
        theadFieldNameList: this.getVisibleTheadFieldList(),
        batchSearchList: this.searchVal.batchSearchList ? this.searchVal.batchSearchList : []
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
      this.$addHistoryData('rowNum', params.rowNum);
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
          this.loadingShow = false;
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
      this.$api.cmdb.ci.getCiById(ciId, { needAction: true }).then(res => {
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
      this.ciEntityList =
        this.selectedCiEntityList?.map(item => ({
          ciId: item.typeId,
          ciEntityId: item.id,
          ciEntityName: item.name
        })) || [];
      this.ciEntityId = null;
      this.isDeleteDialogShow = true;
    },
    async handleOperateSuccess(params) {
      const { msg = '' } = params || {};
      await this.searchAssetData(true);
      if (msg) {
        this.$Message.success(msg);
      }
      this.resourceIdList = [];
      this.selectList = [];
      this.selectedRemain = true;
    },
    async tagSuccess(params) {
      await this.handleOperateSuccess(params);
      this.isMangeShow = false;
    },
    async accountSuccess(params) {
      await this.handleOperateSuccess(params);
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
    close() {
      this.isMangeShow = false;
    },
    closeAddAccount(needFresh) {
      this.isAddAccountShow = false;
      if (needFresh) {
        this.searchAssetData();
      }
    },
    restoreHistory(historyData) {
      this.searchVal = historyData['searchVal'];
      this.selectType = historyData['selectType'];
      this.tableConfig.currentPage = historyData['currentPage'];
      this.tableConfig.pageSize = historyData['pageSize'];
      this.tableConfig.rowNum = historyData['rowNum'];
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
    editTree() {
      this.isShowTreeEdit = true;
    },
    async closeTreeEdit(action) {
      this.isShowTreeEdit = false;
      if (action == 'refresh') {
        this.treeTypeRootCiId = null;
        this.selectType.typeId = null;
        this.resourceTypeTreeKey += 1;
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
      if (this.tableConfig.currentPage == 1) {
        this.tableConfig.rowNum = 0;
      }
      // 复杂模式搜索
      let params = {
        currentPage: this.tableConfig.currentPage || 1,
        pageSize: this.tableConfig.pageSize || 20,
        rowNum: this.tableConfig.rowNum || 0,
        typeId: this.selectType.typeId,
        ...searchVal
      };
      this.loadingShow = true;
      return this.$api.autoexec.action
        .getNodeList(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.tableConfig = Object.assign(this.tableConfig, res.Return || {});
          }
        })
        .finally(() => {
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
