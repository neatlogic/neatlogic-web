<template>
  <div>
    <div v-if="needCondition && !ciEntityData.error">
      <div class="clearfix mb-nm">
        <div v-if="needAction && ciEntityData && ciEntityData.tbodyList && ciEntityData.tbodyList.length > 0" class="batch">
          <Dropdown trigger="click">
            <Button type="primary" ghost :disabled="!selectedCiEntityList || selectedCiEntityList.length == 0">
              {{ $t('page.batchoperation') }}
              <span class="tsfont-down"></span>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem @click.native="batchEdit()">{{ $t('page.edit') }}</DropdownItem>
              <DropdownItem @click.native="batchDelete()">{{ $t('page.delete') }}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div class="int">
          <TsFormInput
            v-if="!isAdvancedSearch"
            v-model="searchParam.keyword"
            border="border"
            :width="400"
            :placeholder="$t('form.placeholder.keyword')"
            @on-enter="searchCiEntity(1)"
          ></TsFormInput>
        </div>
        <div v-if="!isAdvancedSearch && needExport" class="export">
          <Button type="primary" :ghost="true" @click="isExportDialogShow = true">{{ $t('page.export') }}</Button>
        </div>
        <div v-if="attrList && attrList.length > 0" class="senior">
          <span @click="isAdvancedSearch = !isAdvancedSearch">
            {{ $t('page.advancesearch') }}
            <i :class="isAdvancedSearch ? 'tsfont-drop-up' : 'tsfont-drop-down'"></i>
          </span>
        </div>
      </div>
      <div v-if="isAdvancedSearch">
        <Tabs v-if="needDsl && COMMERCIAL_MODULES.includes('cmdb')" v-model="advencedSearchMode">
          <TabPane :label="$t('term.cmdb.condition')" name="condition"></TabPane>
          <TabPane label="表达式(beta)" name="dsl"></TabPane>
        </Tabs>
        <Card
          v-if="advencedSearchMode == 'condition'"
          dis-hover
          class="radius-md"
          style="margin-bottom: 10px"
        >
          <TsRow style="max-height: 250px; overflow-y: auto; overflow-x: hidden">
            <Col span="12">
              <TsRow class="search-item">
                <Col span="6" class="search-label text-grey overflow">{{ $t('term.cmdb.group') }}</Col>
                <Col span="18" class="search-condition">
                  <TsFormSelect
                    :transfer="true"
                    valueName="id"
                    textName="name"
                    :dataList="groupList"
                    :value="searchParam.groupId"
                    @change="
                      val => {
                        searchParam['groupId'] = val;
                      }
                    "
                  ></TsFormSelect>
                </Col>
              </TsRow>
            </Col>
            <Col v-for="attr in commonAttrList" :key="attr.name" span="12">
              <TsRow class="search-item">
                <Col span="6" class="search-label text-grey overflow">{{ attr.label }}</Col>
                <Col span="18" class="search-condition">
                  <div v-if="attr.name == 'id'">
                    <TsFormInput
                      :value="searchParam['filterCiEntityId']"
                      @change="
                        val => {
                          if (val) {
                            searchParam['filterCiEntityId'] = val;
                          } else {
                            searchParam['filterCiEntityId'] = null;
                          }
                        }
                      "
                    ></TsFormInput>
                  </div>
                  <div v-else-if="(attr.name = 'ci_id')">
                    <TsFormSelect
                      :transfer="true"
                      :dataList="attr.itemList"
                      :value="searchParam['filterCiId']"
                      @change="
                        val => {
                          searchParam['filterCiId'] = val;
                        }
                      "
                    ></TsFormSelect>
                  </div>
                </Col>
              </TsRow>
            </Col>
            <Col v-for="attr in globalAttrList" :key="attr.id" span="12">
              <TsRow class="search-item">
                <Col span="6" class="search-label text-grey tsfont-internet overflow">
                  {{ attr.label }}
                </Col>
                <Col span="6" class="search-expression">
                  <TsFormSelect
                    :transfer="true"
                    :value="globalAttrFilterList['attr_' + attr.id] && globalAttrFilterList['attr_' + attr.id]['expression']"
                    :dataList="globalAttrExpressionList"
                    @change="
                      val => {
                        setGlobalAttrData(attr, 'expression', val);
                      }
                    "
                  ></TsFormSelect>
                </Col>
                <Col v-if="!globalAttrConditionHideData[attr.id]" span="12" class="search-condition">
                  <TsFormSelect
                    :value="globalAttrFilterList['attr_' + attr.id] && globalAttrFilterList['attr_' + attr.id]['valueList']"
                    :dataList="attr.itemList"
                    valueName="id"
                    textName="value"
                    transfer
                    border="border"
                    multiple
                    @change="
                      val => {
                        setGlobalAttrData(attr, 'value', val);
                      }
                    "
                  ></TsFormSelect>
                </Col>
              </TsRow>
            </Col>
            <Col v-for="attr in searchAttrList" :key="attr.id" span="12">
              <TsRow class="search-item">
                <Col span="6" class="search-label text-grey overflow">{{ attr.label }}</Col>
                <Col span="6" class="search-expression">
                  <TsFormSelect
                    :transfer="true"
                    :value="attrFilterList['attr_' + attr.id] && attrFilterList['attr_' + attr.id]['expression']"
                    :dataList="attr.expressionList"
                    @change="
                      val => {
                        setAttrData(attr, 'expression', val);
                      }
                    "
                  ></TsFormSelect>
                </Col>
                <Col v-if="!attrConditionHideData[attr.id]" span="12" class="search-condition">
                  <AttrSearcher
                    ref="attrHandler"
                    :attrData="attr"
                    :valueList="attrFilterList['attr_' + attr.id] && attrFilterList['attr_' + attr.id]['valueList']"
                    @setData="
                      val => {
                        setAttrData(attr, 'value', val);
                      }
                    "
                  ></AttrSearcher>
                </Col>
              </TsRow>
            </Col>
            <Col v-for="rel in relList" :key="rel.id + '_' + rel.direction" span="12">
              <TsRow class="search-item">
                <Col span="6" class="search-label text-grey overflow">{{ rel.direction == 'from' ? rel.toLabel : rel.fromLabel }}</Col>
                <Col span="6" class="search-expression">
                  <TsFormSelect
                    :transfer="true"
                    border="border"
                    :value="relFilterList[rel.direction + rel.id] && relFilterList[rel.direction + rel.id]['expression']"
                    :dataList="rel.expressionList"
                    @change="
                      val => {
                        setRelData(rel, 'expression', val);
                      }
                    "
                  ></TsFormSelect>
                </Col>
                <Col v-if="!relConditionHideData[rel.direction + rel.id]" span="12" class="search-condition">
                  <TsFormSelect
                    :transfer="true"
                    :multiple="true"
                    v-bind="relSelectConfig(rel)"
                    :value="relFilterList[rel.direction + rel.id] && relFilterList[rel.direction + rel.id]['valueList']"
                    @change="
                      val => {
                        setRelData(rel, 'value', val);
                      }
                    "
                  ></TsFormSelect>
                </Col>
              </TsRow>
            </Col>
          </TsRow>
          <div style="text-align: right" class="mt-md">
            <Button
              type="primary"
              :ghost="true"
              class="mr-md"
              @click="isExportDialogShow = true"
            >{{ $t('page.export') }}</Button>
            <Button
              type="primary"
              :disabled="isLoading"
              :loading="isLoading"
              @click.native="searchCiEntity(1)"
            >{{ $t('page.search') }}</Button>
          </div>
        </Card>
        <div v-if="needDsl && COMMERCIAL_MODULES.includes('cmdb') && advencedSearchMode === 'dsl'" class="pb-md">
          <DslEditor v-model="searchParam.dsl" :suggestList="suggestList"></DslEditor>
          <div style="text-align: right" class="mt-md">
            <Button
              type="primary"
              :ghost="true"
              class="mr-md"
              @click="isExportDialogShow = true"
            >{{ $t('page.export') }}</Button>
            <Button
              type="primary"
              :disabled="isLoading"
              :loading="isLoading"
              @click.native="searchCiEntity(1)"
            >{{ $t('page.search') }}</Button>
          </div>
        </div>
      </div>
    </div>
    <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
    <div v-if="ciEntityData && ciEntityData.tbodyList && ciEntityData.tbodyList.length > 0">
      <TsTable
        v-if="ciEntityData"
        ref="ciEntityTable"
        v-model="selectedIndexList"
        v-bind="ciEntityData"
        :loading="tabloading"
        canExpand
        keyName="id"
        :fixedHeader="mode == 'dialog' || !fixedHeader ? false : true"
        :multiple="isMultiple"
        :showPager="needPage"
        :sortList="ciEntityData.sortList"
        :sortOrder="sortOrder"
        :selectedRemain="selectedRemain"
        :readonlyTextIsHighlight="readonlyTextIsHighlight"
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
        @getSelected="getSelected"
        @toggleExpand="toggleDiffContent"
        @updateSort="updateSort"
      >
        <!--<template v-if="needExpand" v-slot:expander="{ row }">
          <span class="text-href" @click="toggleDiffContent(row)">
            <span v-if="row.actionType == 'update'" :class="{'tsfont-minus-square': row['_expand'], 'tsfont-plus-square': !row['_expand']}"></span>
          </span>
        </template>-->
        <template v-slot:expand="{ row }">
          <!-- expand 表格里面的参数，是否可折叠 -->
          <div v-if="row.children">
            <TsTable :tbodyList="row.children" :theadList="childTheadList"></TsTable>
          </div>
          <div v-else>{{ $t('message.nothingchange') }}</div>
        </template>

        <template slot="actionType" slot-scope="{ row }">
          <div v-if="row.actionType == 'insert'">
            <b class="text-success">{{ $t('page.new') }}</b>
          </div>
          <div v-else>
            <Dropdown v-if="needAction" :transfer="true">
              <a href="javascript:void(0)">
                <b :class="row.actionType == 'delete' ? 'text-error' : 'text-primary'">
                  {{ row.actionType == 'delete' ? $t('page.delete') : $t('page.edit') }}
                  <Icon type="ios-arrow-down"></Icon>
                </b>
              </a>
              <DropdownMenu v-if="actionTypeConfig && (actionTypeConfig.edit || actionTypeConfig.del)" slot="list">
                <DropdownItem v-if="actionTypeConfig && actionTypeConfig.edit">
                  <a href="javascript:void(0)" @click="changeActionType(row, 'update')">{{ $t('page.edit') }}</a>
                </DropdownItem>
                <DropdownItem v-if="actionTypeConfig && actionTypeConfig.del">
                  <a href="javascript:void(0)" @click="changeActionType(row, 'delete')">{{ $t('page.delete') }}</a>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <b v-if="!needAction" :class="row.actionType == 'delete' ? 'text-error' : 'text-primary'">{{ row.actionType == 'delete' ? $t('page.delete') : $t('page.edit') }}</b>
          </div>
        </template>
        <template v-for="(head, index) in finalHeaderList" :slot="head.key" slot-scope="{ row }">
          <div v-if="head.key.startsWith('attr_') && row.attrEntityData" :key="index">
            <div v-if="row.attrEntityData[head.key]">
              <AttrViewer
                :ciEntity="row"
                :handler="row.attrEntityData[head.key].type"
                :attrEntity="row.attrEntityData[head.key]"
                :authData="row.authData"
              ></AttrViewer>
            </div>
            <div v-else>-</div>
          </div>
          <div v-else-if="head.key.startsWith('global_') && row.globalAttrEntityData" :key="index">
            <div v-if="row.globalAttrEntityData[head.key]">
              <Tag v-for="(v, vindex) in row.globalAttrEntityData[head.key].valueList" :key="vindex">
                {{ v.value }}
              </Tag>
            </div>
          </div>
          <div v-else-if="head.key.startsWith('const_')" :key="index" v-html="row[head.key.replace('const_', '')]"></div>
          <div v-else-if="(head.key.startsWith('relto_') || head.key.startsWith('relfrom_')) && row.relEntityData && row.relEntityData[head.key] && row.relEntityData[head.key]['valueList']" :key="index">
            <span v-for="(relentity, rindex) in row.relEntityData[head.key]['valueList']" :key="rindex" class="mr-xs">
              <a v-if="row.maxRelEntityCount > rindex" href="javascript:void(0)" @click="toCiEntity(relentity.ciEntityId, relentity.ciId)">
                <span class="tsfont-ci-o"></span>
                <span>{{ relentity.ciEntityName }}</span>
              </a>
              <a v-else href="javascript:void(0)" @click="showMoreRelCiEntity(row.relEntityData[head.key])"><span class="text-href tsfont-option-horizontal"></span></a>
            </span>
          </div>
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li v-if="mode == 'page'" class="tsfont-formtextarea" @click="toCiEntity(row.id, row.ciId)">{{ $t('page.detail') }}</li>
              <li v-if="row.authData && row.authData.accountmanagement" class="tsfont-userinfo" @click="openAccountEditDialog(row)">{{ $t('page.accountsmanage') }}</li>
              <li
                v-if="needAction"
                class="tsfont-edit"
                :class="!row.authData || !row.authData.cientityupdate ? 'disable' : ''"
                @click="editCiEntity(row)"
              >{{ $t('page.edit') }}</li>
              <li
                v-if="needAction"
                :class="!row.authData || !row.authData.cientitydelete ? 'disable' : ''"
                class="tsfont-trash-o"
                @click="deleteCiEntity(row)"
              >{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>

        <template v-if="row.account" slot="const_account" slot-scope="{ row }">
          <Tag v-for="(account, index) in row.account.split(',')" :key="index">{{ account }}</Tag>
        </template>
      </TsTable>
    </div>
    <div v-if="!ciEntityData.error && (!ciEntityData.tbodyList || ciEntityData.tbodyList.length == 0)">
      <NoData v-if="!isLoading"></NoData>
    </div>
    <div v-else-if="ciEntityData.error">
      <Alert show-icon type="error">
        {{ $t('page.exception') }}
        <span slot="desc">{{ ciEntityData.error }}</span>
      </Alert>
    </div>
    <RelCiEntityDialog
      v-if="isRelCientityDialogShow"
      :rel="currentRel"
      :ciEntityId="currentCiEntityId"
      @close="closeRelCiEntityDialog"
    ></RelCiEntityDialog>
    <DeleteCiEntityDialog
      v-if="isDeleteDialogShow"
      :allowDelete="allowDelete"
      :allowCommit="allowCommit"
      :ciEntityId="deleteCiEntityId"
      :ciEntityList="deleteCiEntityList"
      @close="closeDeleteDialog"
    ></DeleteCiEntityDialog>
    <BatchEditCiEntityDialog
      v-if="isBatchEditDialogShow"
      :ciId="batchEditCiId"
      :ciEntityList="batchEditCiEntityList"
      @close="closeBatchEditDialog"
    ></BatchEditCiEntityDialog>
    <TsDialog
      v-if="isExportDialogShow"
      type="modal"
      width="medium"
      :isShow="isExportDialogShow"
      :title="$t('term.cmdb.needexportcientity')"
      @on-close="isExportDialogShow = false"
    >
      <template v-slot>
        <div class="exportItemContainer">
          <div
            v-for="(item, index) in attrRelList"
            :key="index"
            class="exportItem overflow padding-xs"
            @click="selectExportItem(item)"
          >
            <i v-if="item.selected" class="tsfont-check-s text-success selected"></i>
            <div>{{ item.label }}</div>
            <div class="text-grey">{{ item.name }}</div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Checkbox v-if="selectedCiEntityList && selectedCiEntityList.length > 0" v-model="isOnlyExportSelected">
          <span class="fz10 text-grey">{{ $t('term.cmdb.onlyexportselected') }}</span>
        </Checkbox>
        <Button @click="isExportDialogShow = false">{{ $t('page.cancel') }}</Button>
        <Button type="primary" ghost @click="selectAllExportItem()">{{ $t('page.selectall') }}</Button>
        <Button
          v-download="exportUrl()"
          :disabled="isExporting || attrRelList.find(d => d.selected) == null"
          type="primary"
          :loading="isExporting"
        >{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
    <AccountEditDialog v-if="isShowAddAccountDialog" :resourceId="resourceId" @close="closeAccountEditDialog"></AccountEditDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    /*CiEntityListRelCondition:()=>import('./cientity-list-relcondition.vue'),*/
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    AttrSearcher: () => import('./attr-searcher.vue'),
    AttrViewer: () => import('./attr-viewer.vue'),
    RelCiEntityDialog: () => import('./rel-cientity-dialog.vue'),
    DeleteCiEntityDialog: () => import('./cientity-delete-dialog.vue'),
    BatchEditCiEntityDialog: () => import('./cientity-edit-batch.vue'),
    DslEditor: () => import('@/resources/plugins/DslEditor/dsl-editor.vue'),
    AccountEditDialog: () => import('@/views/pages/cmdb/asset/components/account-edit-dialog') // 帐户管理
  },
  directives: { download },
  props: {
    ciId: { type: Number },
    rootCiId: { type: Number }, //根模型id，如果选中了子模型配置项，回显数据时就要利用此属性匹配模型，主要用在ITSM表单
    idList: { type: Array },
    displayColumnList: { type: Array, default: null }, //指定需要展示的属性列表，不指定代表全展示，成员：attr_xxx,relto_xxx,relfrom_xxx,const_xxx
    formConfigList: { type: Array }, // 过滤标题,主要是从表单里面过来的，主要作用 1：列表的字段是否可显示，2：在点击编辑的时候，弹窗里面的内容是否可编辑
    actionTypeConfig: { type: Object }, // 用于控制单个配置项可切换的操作类型,有add,edit和del三种类型
    isMultiple: { type: Boolean, default: true },
    needExport: { type: Boolean, default: false }, //是否允许导出
    pageSize: { type: Number, default: 20 },
    needAction: { type: Boolean, default: true }, //是否需要操作列
    needExpand: { type: Boolean, default: false }, //是否需要展开控制列
    needCheck: { type: Boolean, default: false }, //是否需要复选框
    needCondition: { type: Boolean, default: true }, //是否需要条件
    needPage: { type: Boolean, default: true }, //是否需要分页
    needDsl: { type: Boolean, default: false }, //是否激活dsl搜索
    selectedData: { type: Array }, //已选中数据，只保存id，例如[123123123,123123123]
    needActionType: { type: Boolean, default: false }, //是否需要操作类型列，用于标记数据的操作类型，一般表单控件中使用
    relCiEntityId: { type: Number }, //关联配置项id
    direction: { type: String }, //当前模型在关系的位置
    relId: { type: Number }, //关系ID
    ciEntityList: { type: Array }, //配置项数据，如果不为空则不需要调用接口检索数据
    saveMode: { type: String, default: 'save' }, //有save和emit两种模式，save直接写入数据库，emit调用外部emit函数
    mode: { type: String, default: 'page' }, //page模式或dialog模式，如果是dialog模式将会禁用所有路由跳转
    fixedHeader: { type: Boolean, default: true }, //如果为true则固定头部，表格自动算高度
    condition: { type: Object }, //预设条件
    selectedRemain: { type: Boolean, default: false }, //是否保留选中
    readonlyTextIsHighlight: { type: Boolean, default: false } // 只读模式下，表头背景是否高亮
  },
  data() {
    return {
      COMMERCIAL_MODULES: COMMERCIAL_MODULES,
      advencedSearchMode: 'condition',
      childTheadList: [
        {
          key: 'label',
          title: this.$t('page.name')
        },
        {
          key: 'name',
          title: this.$t('page.uniquekey')
        },
        {
          key: 'oldValue',
          title: this.$t('page.beforeedit')
        },
        {
          key: 'newValue',
          title: this.$t('page.afteredit')
        }
      ],
      globalAttrExpressionList: [
        {
          value: 'like',
          text: this.$t('term.expression.like')
        },
        { value: 'notlike', text: this.$t('term.expression.notlike') },
        { value: 'is-null', text: this.$t('term.expression.empty') },
        { value: 'is-not-null', text: this.$t('term.expression.notempty') }
      ],
      isOnlyExportSelected: false, //只导出选中数据开关
      // 点击展开
      isExporting: false, //是否导出中
      isRelCientityDialogShow: false,
      currentRel: null,
      currentCiEntityId: null,
      selectedIndexList: [], //选中的数据(数据索引值)
      //isFirstOpen: true, // 标记是否第一次打开，用于ITSM表单控件
      isLoading: false,
      tabloading: true,
      isExportDialogShow: false,
      theadList: [],
      ciEntityData: {},
      downwardCiList: [],
      groupList: [], //当前用户的团体列表
      attrList: [],
      globalAttrList: [],
      searchParam: { pageSize: this.pageSize },
      isAdvancedSearch: false,
      relList: [],
      attrFilterList: {},
      globalAttrFilterList: {},
      relFilterList: {},
      sortConfig: {},
      actionTypeList: [
        { value: 'update', text: this.$t('page.edit') },
        { value: 'delete', text: this.$t('page.delete') }
      ], //作为表单组件时，需要选择对配置项的操作类型
      relConditionHideData: {}, //控制关系条件是否隐藏
      attrConditionHideData: {}, //控制属性条件是否隐藏
      globalAttrConditionHideData: {}, //控制全局属性条件是否隐藏
      selectedCiEntityList: [], //选中数据
      isDeleteDialogShow: false, //删除窗口
      isEditDialogShow: false, //批量修改窗口
      allowDelete: false,
      allowCommit: false,
      deleteCiEntityId: null,
      deleteCiEntityList: [],
      isBatchEditDialogShow: false, //批量修改窗口
      batchEditCiId: null, //批量修改模型id
      batchEditCiEntityList: [], //批量修改配置项
      attrRelList: [], //属性和关系列表，用于导出excel时选择
      isShowAddAccountDialog: false, // 账号管理弹窗
      resourceId: null,
      suggestList: [] //dsl搜索模式的提示词列表
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
    restoreHistory(historyData) {
      this.searchParam = historyData['searchParam'] || { pageSize: this.pageSize };
      this.isAdvancedSearch = historyData['isAdvancedSearch'];
      this.attrFilterList = historyData['attrFilterList'] || {};
      this.globalAttrFilterList = historyData['globalAttrFilterList'] || {};
      this.attrConditionHideData = historyData['attrConditionHideData'] || {};
      this.globalAttrConditionHideData = historyData['globalAttrConditionHideData'] || {};
      this.relFilterList = historyData['relFilterList'] || {};
      this.sortConfig = historyData['sortConfig'] || {};
    },
    getSuggestList(keywordData) {
      this.suggestList = [];
      if (keywordData.value) {
        this.$api.cmdb.ci.getAttrByCiId(this.ciId, { keyword: keywordData.value }).then(res => {
          const attrList = res.Return;
          if (attrList && attrList.length > 0) {
            attrList.forEach(attr => {
              this.suggestList.push(attr.name);
            });
            console.log(JSON.stringify(this.suggestList, null, 2));
          }
        });
      }
    },
    updateSort(sort) {
      this.sortConfig = sort;
      this.searchCiEntity();
    },
    selectExportItem(item) {
      this.$set(item, 'selected', !item.selected);
    },
    selectAllExportItem() {
      this.attrRelList.forEach(element => {
        this.$set(element, 'selected', true);
      });
    },
    async getCiAttrRelList() {
      await this.$api.cmdb.ci.searchCiAttrRel(this.ciId).then(res => {
        this.attrRelList = res.Return;
      });
    },
    batchEdit() {
      if (this.selectedCiEntityList && this.selectedCiEntityList.length > 0) {
        if (this.saveMode == 'save') {
          const errorList = [];
          let ciId;
          let isSameCi = true;
          const ciEntityList = [];
          this.selectedCiEntityList.forEach(cientity => {
            if (!ciId) {
              ciId = cientity.ciId;
            } else if (ciId != cientity.ciId) {
              isSameCi = false;
            }
            if (!cientity.authData || !cientity.authData.cientityupdate) {
              errorList.push(cientity);
            }
            ciEntityList.push(cientity);
          });
          if (!isSameCi) {
            this.$Message.info(this.$t('message.cmdb.diffci'));
            return;
          }
          if (errorList.length > 0) {
            this.$Message.info(this.$t('message.cmdb.hasnoauth', { target: errorList.map(cientity => cientity.name).join(',') }));
            return;
          }
          this.isBatchEditDialogShow = true;
          this.batchEditCiId = ciId;
          this.batchEditCiEntityList = ciEntityList;
        }
      }
    },
    batchDelete() {
      if (this.selectedCiEntityList && this.selectedCiEntityList.length > 0) {
        const deleteList = this.selectedCiEntityList.filter(e => e.authData && e.authData.cientitydelete);
        if (!deleteList || deleteList.length == 0) {
          return;
        }
        const commitList = this.selectedCiEntityList.filter(e => e.authData && e.authData.transactionmanage);
        if (!commitList || commitList.length == 0) {
          this.allowCommit = false;
        } else {
          this.allowCommit = true;
        }
        this.allowDelete = true;
        this.deleteCiEntityId = null;
        this.deleteCiEntityList = [];
        deleteList.forEach(d => {
          this.deleteCiEntityList.push({ ciEntityId: d.id, ciId: d.ciId, ciEntityName: d.name });
        });
        this.isDeleteDialogShow = true;
      }
    },
    changeActionType(row, action) {
      if (this.saveMode == 'save') {
        this.ciEntityData.tbodyList.forEach(cientity => {
          if (cientity.uuid == row.uuid) {
            this.$set(cientity, 'actionType', action);
            this.$forceUpdate();
          }
        });
      } else if (this.saveMode == 'emit') {
        this.$emit('changeActionType', row, action);
      }
    },
    closeRelCiEntityDialog() {
      this.currentRel = null;
      this.isRelCientityDialogShow = false;
    },
    toCiEntity(id, ciId) {
      if (this.mode == 'page') {
        if (!ciId) {
          ciId = this.ciId;
        }
        this.$router.push({ path: '/ci/' + ciId + '/cientity-view/' + id });
      }
    },
    showMoreRelCiEntity(relentity) {
      this.currentRel = relentity;
      this.isRelCientityDialogShow = true;
    },
    async init() {
      await this.searchCiEntity();
      this.tabloading = false;
      await this.getAttrByCiId();
      await this.getGlobalAttrList();
      await this.getRelByCiId();
      await this.getDownwardCiByCiId();
      this.searchGroup();
      await this.getCiAttrRelList();
    },
    exportUrl() {
      //复制一个条件对象不要影响页面搜索
      const searchParam = this.$utils.deepClone(this.searchParam);
      if (this.isOnlyExportSelected && this.selectedCiEntityList && this.selectedCiEntityList.length > 0) {
        const idList = [];
        this.selectedCiEntityList.forEach(cientity => {
          idList.push(cientity.id);
        });
        searchParam.idList = idList;
      }
      const showAttrRelList = [];
      this.attrRelList.forEach(element => {
        if (element.selected) {
          showAttrRelList.push(element.uid);
        }
      });

      searchParam.showAttrRelList = showAttrRelList;
      searchParam.attrFilterList = [];
      for (const key in this.attrFilterList) {
        const d = this.attrFilterList[key];
        if (d.attrId && d.expression) {
          const obj = {
            attrId: d.attrId,
            valueList: d.valueList,
            expression: d.expression
          };
          searchParam.attrFilterList.push(obj);
        }
      }
      searchParam.globalAttrFilterList = [];
      for (const key in this.globalAttrFilterList) {
        const d = this.globalAttrFilterList[key];
        if (d.attrId && d.expression) {
          const obj = {
            attrId: d.attrId,
            valueList: d.valueList,
            expression: d.expression
          };
          searchParam.globalAttrFilterList.push(obj);
        }
      }
      searchParam.relFilterList = [];
      for (const key in this.relFilterList) {
        const d = this.relFilterList[key];
        if (d.relId && d.expression && d.direction) {
          const obj = {
            relId: d.relId,
            direction: d.direction,
            valueList: d.valueList,
            expression: d.expression
          };
          searchParam.relFilterList.push(obj);
        }
      }
      searchParam.globalAttrStrictMode = true;
      return {
        url: 'api/binary/cmdb/cientity/export',
        params: searchParam,
        changeStatus: status => {
          if (status == 'start') {
            this.isExporting = true;
          } else if (status == 'success' || status == 'error') {
            this.isExporting = false;
            this.isExportDialogShow = false;
          }
        }
      };
    },
    async searchCiEntity(current) {
      //清空选中列表
      if (!this.selectedRemain) {
        this.selectedIndexList = [];
        this.selectedCiEntityList = [];
      }
      this.isLoading = true;
      if (current) {
        this.searchParam.currentPage = current;
      }
      this.searchParam.attrFilterList = [];
      for (const key in this.attrFilterList) {
        const d = this.attrFilterList[key];
        if (d.attrId && d.expression) {
          const obj = {
            attrId: d.attrId,
            valueList: d.valueList,
            expression: d.expression
          };
          this.searchParam.attrFilterList.push(obj);
        }
      }
      this.searchParam.globalAttrFilterList = [];
      for (const key in this.globalAttrFilterList) {
        const d = this.globalAttrFilterList[key];
        if (d.attrId && d.expression) {
          if (d.expression === 'is-null' || d.expression === 'is-not-null' || (d.valueList && d.valueList.length > 0)) {
            const obj = {
              attrId: d.attrId,
              valueList: d.valueList,
              expression: d.expression
            };
            this.searchParam.globalAttrFilterList.push(obj);
          }
        }
      }
      this.searchParam.relFilterList = [];
      for (const key in this.relFilterList) {
        const d = this.relFilterList[key];
        if (d.relId && d.expression && d.direction) {
          const obj = {
            relId: d.relId,
            direction: d.direction,
            valueList: d.valueList,
            expression: d.expression
          };
          this.searchParam.relFilterList.push(obj);
        }
      }
      this.searchParam.sortConfig = this.sortConfig;
      this.$addHistoryData('searchParam', this.searchParam);
      this.$addHistoryData('isAdvancedSearch', this.isAdvancedSearch);
      this.$addHistoryData('attrFilterList', this.attrFilterList);
      this.$addHistoryData('globalAttrFilterList', this.globalAttrFilterList);
      this.$addHistoryData('relFilterList', this.relFilterList);
      this.$addHistoryData('sortConfig', this.sortConfig);
      this.$addHistoryData('attrConditionHideData', this.attrConditionHideData);
      this.$addHistoryData('globalAttrConditionHideData', this.globalAttrConditionHideData);
      this.searchParam['globalAttrStrictMode'] = true;

      await this.$api.cmdb.cientity.searchCiEntity(this.searchParam).then(res => {
        this.searchParam.currentPage = res.Return.currentPage;
        this.searchParam.pageSize = res.Return.pageSize;
        this.ciEntityData = res.Return;
        //如果ciEntityList中有一些前端控制参数(一般是“_”开头)，需要补充回来，不然状态不一致
        if (this.ciEntityList && this.ciEntityList.length > 0) {
          this.ciEntityList.forEach(element => {
            for (let key in element) {
              if (key.indexOf('_') == 0) {
                const cientity = this.ciEntityData.tbodyList.find(d => d.uuid == element.uuid);
                if (cientity) {
                  cientity[key] = element[key];
                }
              }
            }
          });
        }
        //补充选中状态
        if (this.selectedData && this.selectedData.length > 0) {
          this.selectedIndexList = this.$utils.deepClone(this.selectedData);
        }
        this.selectedCiEntityList = [];
      }).finally(() => {
        this.isLoading = false;
      });
    },
    async getGlobalAttrList() {
      await this.$api.cmdb.ci.getGlobalAttrByCiId(this.ciId, { isActive: 1, needAlias: 1 }).then(res => {
        this.globalAttrList = res.Return;
      });
    },
    async getAttrByCiId() {
      await this.$api.cmdb.ci.getAttrByCiId(this.ciId, { needAlias: 1 }).then(res => {
        this.attrList = res.Return;
        if (this.attrList && this.attrList.length > 0) {
          this.attrList.forEach(attr => {
            this.suggestList.push({ value: attr.name, text: attr.name + '·' + attr.label });
          });
        }
      });
    },
    async getRelByCiId() {
      await this.$api.cmdb.ci.getRelByCiId(this.ciId, { needAlias: 1 }).then(res => {
        this.relList = res.Return;
      });
    },
    async getDownwardCiByCiId() {
      await this.$api.cmdb.ci.getDownwardCiList(this.ciId).then(res => {
        this.downwardCiList = res.Return;
      });
    },
    getPropConfig(propId) {
      if (this.attrList && this.attrList.length > 0) {
        for (let i = 0; i < this.attrList.length; i++) {
          const attr = this.attrList[i];
          if (attr.propId == propId) {
            return attr.propConfig;
          }
        }
      }
      return null;
    },
    editCiEntity(row) {
      if (!row.authData || !row.authData.cientityupdate) {
        return;
      }
      if (this.saveMode == 'save') {
        const id = row.id;
        const ciId = row.ciId;
        this.$router.push({ path: '/ci/' + ciId + '/cientity-edit/' + id });
      } else if (this.saveMode == 'emit') {
        this.$set(row, '_expand', false);
        this.$emit('update', row);
      }
    },
    toggleDiffContent(row, isShow) {
      let isStateSame = false;
      if (typeof isShow == 'undefined') {
        isShow = !row['_expand'];
      } else {
        if (isShow == row['_expand']) {
          isStateSame = true;
        }
      }
      if (!isStateSame) {
        if (!isShow) {
          this.$set(row, '_expand', false);
        } else {
          this.$set(row, '_expand', true);
          //只需要显示可编辑的属性或关系,如果为空代表全开
          const showAttrRelList = this.formConfigList.filter(d => d.isEdit).map(d => d.key);
          //模型id需要使用外部传入的ciId，这样显示的属性范围不会下探到子模型
          this.$api.cmdb.cientity.getCiEntityById(this.ciId, row.id, false, true, true, showAttrRelList).then(res => {
            if (res.Status == 'OK') {
              const oldAttrEntityData = res.Return.attrEntityData;
              const newAttrEntityData = {};
              for (let key in row.attrEntityData) {
                if (showAttrRelList.length == 0 || showAttrRelList.includes(key)) {
                  newAttrEntityData[key] = row.attrEntityData[key];
                }
              }
              const oldRelEntityData = res.Return.relEntityData;
              const newRelEntityData = {};
              for (let key in row.relEntityData) {
                if (showAttrRelList.length == 0 || showAttrRelList.includes(key)) {
                  newRelEntityData[key] = row.relEntityData[key];
                }
              }

              let diffDataList = [];
              this.createDiffData(diffDataList, newAttrEntityData, 'new');
              this.createDiffData(diffDataList, oldAttrEntityData, 'old');
              this.createDiffData(diffDataList, newRelEntityData, 'new');
              this.createDiffData(diffDataList, oldRelEntityData, 'old');
              //需要兼容一个为空字符串，一个是undefined的情况
              diffDataList = diffDataList.filter(d => (d.oldValue || d.newValue) && d.oldValue != d.newValue);

              if (diffDataList.length > 0) {
                diffDataList.forEach(element => {
                  const attr = this.attrList.find(d => d.id == element.key.replace('attr_', ''));
                  if (attr) {
                    element.id = attr.id;
                    element.label = attr.label;
                    element.name = attr.name;
                  } else {
                    const rel = this.relList.find(d => d.id == element.key.replace('relfrom_', '').replace('relto_', ''));
                    if (rel && rel.direction == 'from') {
                      element.id = rel.id;
                      element.label = rel.toLabel;
                      element.name = rel.toName;
                    } else if (rel && rel.direction == 'to') {
                      element.id = rel.id;
                      element.label = rel.fromLabel;
                      element.name = rel.fromName;
                    }
                  }
                });
                //去掉没有属性定义的比较内容
                diffDataList = diffDataList.filter(d => d.id && d.name && d.label);
                this.$set(row, 'children', diffDataList);
              }
            }
          });
        }
      }
    },
    createDiffData(diffDataList, attrRelData, valueType) {
      if (attrRelData) {
        Object.keys(attrRelData).forEach(key => {
          let value = '';
          if (attrRelData[key].actualValueList) {
            attrRelData[key].actualValueList.forEach(element => {
              if (element) {
                if (value) {
                  value += ',';
                }
                if (typeof element == 'object') {
                  if (element.text) {
                    value += element.text;
                  } else if (element.name) {
                    value += element.name;
                  }
                } else {
                  value += element;
                }
              }
            });
          } else if (attrRelData[key].valueList) {
            attrRelData[key].valueList.forEach(element => {
              if (element && element.ciEntityName) {
                if (value) {
                  value += ',';
                }
                value += element.ciEntityName;
              }
            });
          }
          const item = diffDataList.find(d => d.key == key);
          if (!item) {
            if (valueType == 'new') {
              diffDataList.push({ key: key, newValue: value });
            } else if (valueType == 'old') {
              diffDataList.push({ key: key, oldValue: value });
            }
          } else {
            if (valueType == 'new') {
              item['newValue'] = value;
            } else if (valueType == 'old') {
              item['oldValue'] = value;
            }
          }
        });
      }
    },
    compareValueList(newValueList, oldValueList) {
      if (!newValueList && !oldValueList) {
        return true;
      } else if ((newValueList && !oldValueList) || (!newValueList && oldValueList)) {
        return false;
      } else if (newValueList.length != oldValueList.length) {
        return false;
      } else if (newValueList.sort().toString() != oldValueList.sort().toString()) {
        return false;
      }
      return true;
    },
    deleteCiEntity(row) {
      if (!row.authData || !row.authData.cientitydelete) {
        return;
      }
      if (this.saveMode == 'save') {
        this.deleteCiEntityId = row.id;
        this.deleteCiEntityList = [];
        this.allowDelete = true;
        if (row.authData.transactionmanage) {
          this.allowCommit = true;
        } else {
          this.allowCommit = false;
        }
        this.isDeleteDialogShow = true;
      } else if (this.saveMode == 'emit') {
        this.$emit('delete', row);
      }
    },
    closeDeleteDialog(needRefresh) {
      this.isDeleteDialogShow = false;
      this.deleteCiEntityId = null;
      this.deleteCiEntityList = [];
      if (needRefresh) {
        this.searchCiEntity();
      }
    },
    setRelData(rel, type, value) {
      const key = rel.direction + rel.id;
      if (!this.relFilterList[key]) {
        this.relFilterList[key] = { relId: rel.id, direction: rel.direction };
      }
      if (type == 'value') {
        if (value instanceof Array) {
          this.relFilterList[key].valueList = value;
        } else {
          this.relFilterList[key].valueList = [value];
        }
      } else if (type == 'expression') {
        this.relFilterList[key].expression = value;
        if (value == 'is-null' || value == 'is-not-null') {
          //先判断值，不一样才修改，避免触发下拉框重复绑定
          if (!this.relConditionHideData[key]) {
            this.$set(this.relConditionHideData, key, true);
          }
        } else {
          if (this.relConditionHideData[key]) {
            this.$set(this.relConditionHideData, key, false);
          }
        }
      }
    },
    setGlobalAttrData(attr, type, value) {
      if (!this.globalAttrFilterList['attr_' + attr.id]) {
        this.globalAttrFilterList['attr_' + attr.id] = {};
        this.globalAttrFilterList['attr_' + attr.id].attrId = attr.id;
      }
      if (type === 'value') {
        this.globalAttrFilterList['attr_' + attr.id].valueList = value;
      } else if (type === 'expression') {
        this.$set(this.globalAttrFilterList['attr_' + attr.id], 'expression', value);
        if (value == 'is-null' || value == 'is-not-null') {
          //先判断值，不一样才修改，避免触发下拉框重复绑定
          if (!this.globalAttrConditionHideData[attr.id]) {
            this.$set(this.globalAttrConditionHideData, attr.id, true);
          }
        } else {
          if (this.globalAttrConditionHideData[attr.id]) {
            this.$set(this.globalAttrConditionHideData, attr.id, false);
          }
        }
      }
    },
    setAttrData(attr, type, value) {
      if (!this.attrFilterList['attr_' + attr.id]) {
        this.attrFilterList['attr_' + attr.id] = {};
        this.attrFilterList['attr_' + attr.id].attrId = attr.id;
      }
      if (type === 'value') {
        this.attrFilterList['attr_' + attr.id].valueList = value;
      } else if (type === 'expression') {
        this.$set(this.attrFilterList['attr_' + attr.id], 'expression', value);
        if (value == 'is-null' || value == 'is-not-null') {
          //先判断值，不一样才修改，避免触发下拉框重复绑定
          if (!this.attrConditionHideData[attr.id]) {
            this.$set(this.attrConditionHideData, attr.id, true);
          }
        } else {
          if (this.attrConditionHideData[attr.id]) {
            this.$set(this.attrConditionHideData, attr.id, false);
          }
        }
      }
    },
    changeCurrent(current) {
      this.searchParam.currentPage = current;
      this.searchCiEntity(current);
    },
    changePageSize(size) {
      this.searchParam.pageSize = size;
      this.searchCiEntity();
    },
    getSelected(indexList, itemList) {
      //补充根模型id，否则回显可能会有问题
      if (this.rootCiId && itemList && itemList.length > 0) {
        itemList.forEach(item => {
          if (!item.rootCiId) {
            item.rootCiId = this.rootCiId;
          }
        });
      }
      this.$emit('getCheckedCiEntity', itemList, indexList);
      this.selectedCiEntityList = itemList;
    },
    getSelectedCiEntityList() {
      return this.selectedCiEntityList;
    },
    closeBatchEditDialog(needRefresh) {
      this.isBatchEditDialogShow = false;
      if (needRefresh) {
        this.searchCiEntity();
      }
    },
    searchGroup() {
      this.$api.cmdb.group.getCurrentUserActiveGroupByCiId(this.ciId).then(res => {
        this.groupList = res.Return;
      });
    },
    setGroupId(groupId) {
      if (this.searchParam['groupId'] && this.searchParam['groupId'] == groupId) {
        delete this.searchParam['groupId'];
      } else {
        this.$set(this.searchParam, 'groupId', groupId);
      }
      this.searchCiEntity();
    },
    openAccountEditDialog(row) {
      this.resourceId = row.id;
      this.isShowAddAccountDialog = true;
    },
    closeAccountEditDialog(needRefresh) {
      this.resourceId = null;
      this.isShowAddAccountDialog = false;
      if (needRefresh) {
        this.searchCiEntity();
      }
    }
  },
  filter: {},
  computed: {
    sortOrder() {
      //把{"attr_xxx":"DESC","attr_yyy":"AEC"}转换成[{"attr_xxx":"DESC"},{"attr_yyy":"ASC"}]
      const returnList = [];
      if (!this.$utils.isEmpty(this.sortConfig)) {
        for (let k in this.sortConfig) {
          const obj = {};
          obj[k] = this.sortConfig[k];
          returnList.push(obj);
        }
      }
      return returnList;
    },
    commonAttrList: function() {
      const list = [
        {
          name: 'id',
          label: 'id',
          expressionList: [
            { value: 'eq', text: this.$t('term.expression.eq') },
            { value: 'ne', text: this.$t('term.expression.ne') },
            { value: 'like', text: this.$t('term.expression.like') },
            { value: 'notlike', text: this.$t('term.expression.notlike') }
          ]
        }
      ];
      if (this.downwardCiList.length > 1) {
        const itemList = [];
        this.downwardCiList.forEach((c, index) => {
          if (index > 0) {
            itemList.push({ value: c.id, text: c.label });
          }
        });
        list.push({
          name: 'ci_id',
          label: this.$t('term.cmdb.ci'),
          expressionList: [
            { value: 'eq', text: this.$t('term.expression.eq') },
            { value: 'ne', text: this.$t('term.expression.ne') }
          ],
          itemList: itemList
        });
      }
      return list;
    },
    finalHeaderList() {
      let finalList = [];
      if (this.ciEntityData && this.ciEntityData.theadList && this.ciEntityData.theadList.length > 0) {
        this.ciEntityData.theadList.forEach(element => {
          if (element.key.startsWith('attr_') || element.key.startsWith('global_') || element.key.startsWith('relto_') || element.key.startsWith('relfrom_') || element.key.startsWith('const_')) {
            finalList.push(element);
          }
        });
      }
      return finalList;
    },
    searchAttrList() {
      if (this.attrList && this.attrList.length > 0) {
        return this.attrList.filter(attr => attr.canSearch && attr.isSearchAble);
      } else {
        return null;
      }
    },
    relSelectConfig() {
      return function(rel) {
        return {
          border: 'border',
          dynamicUrl: '/api/rest/cmdb/cientity/search',
          params: { ciId: rel.direction == 'from' ? rel.toCiId : rel.fromCiId },
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id'
        };
      };
    }
  },
  watch: {
    ciId: {
      handler: function(val) {
        if (val) {
          Object.assign(this.searchParam, this.condition);
          this.searchParam['groupId'] = null;
          this.searchParam['ciId'] = this.ciId;
          this.searchParam['idList'] = this.idList;
          this.searchParam['relId'] = this.relId;
          this.searchParam['relCiEntityId'] = this.relCiEntityId;
          this.searchParam['direction'] = this.direction;
          this.searchParam['needAction'] = this.needAction;
          this.searchParam['needExpand'] = this.needExpand;
          this.searchParam['needActionType'] = this.needActionType;
          this.searchParam['needCheck'] = this.needCheck;
          this.searchParam['ciEntityList'] = this.ciEntityList;
          this.searchParam['mode'] = this.mode;
          this.searchParam['currentPage'] = 1;
          //表单中设置了需要显示的属性和关系
          if (this.formConfigList && this.formConfigList.length > 0) {
            const showAttrRelList = [];
            this.formConfigList.forEach(element => {
              if (element.isShow) {
                showAttrRelList.push(element.key);
              }
            });
            if (showAttrRelList.length > 0) {
              this.searchParam['showAttrRelList'] = showAttrRelList;
            }
          }
          if (this.displayColumnList) {
            this.searchParam['showAttrRelList'] = this.displayColumnList;
          }
          this.init();
        }
      },
      immediate: true
    },
    ciEntityList: {
      handler: function(newValue) {
        //复制一个对象，避免影响外面的对象导致循环更新
        const ciEntityList = JSON.parse(JSON.stringify(newValue));
        ciEntityList.forEach(element => {
          //const oldentity = this.ciEntityData.tbodyList.find(d => d.uuid == element.uuid);
          //根据actionType设置authData，否则编辑和删除按钮无法显示
          element.authData = {};
          element.authData['cientitydelete'] = true;
          if (element.actionType == 'update' || element.actionType == 'insert') {
            element.authData['cientityupdate'] = true;
          } else {
            element.authData['cientityupdate'] = false;
          }
        });
        this.$set(this.ciEntityData, 'tbodyList', ciEntityList);
      },
      deep: true
    },
    isAdvancedSearch: {
      handler: function(val) {
        if (!val) {
          if (this.attrList && this.attrList.length > 0) {
            this.attrList.forEach(element => {
              element.expression = null;
            });
          }
          this.attrFilterList = [];
          this.relFilterList = [];
          this.searchParam['filterCiEntityId'] = null;
          this.searchParam['filterCiId'] = null;
          this.searchParam['groupId'] = null;
          this.searchParam['dsl'] = null;
          this.searchCiEntity();
        } else {
          this.$set(this.searchParam, 'keyword', '');
        }
      }
    },
    advencedSearchMode: {
      handler: function(val) {
        if (val === 'condition') {
          this.searchParam.dsl = null;
          this.searchCiEntity();
        } else {
          if (this.attrList && this.attrList.length > 0) {
            this.attrList.forEach(element => {
              element.expression = null;
            });
          }
          this.attrFilterList = [];
          this.relFilterList = [];
          this.searchParam['filterCiEntityId'] = null;
          this.searchParam['filterCiId'] = null;
          this.searchParam['groupId'] = null;
          this.searchCiEntity();
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';

/deep/.bg-table {
  // 兼容暗黑模式
  padding-right: 0px !important;
}
.exportItemContainer {
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  .exportItem {
    cursor: pointer;
    font-size: 12px;
    border-radius: 4px;
    position: relative;
    .selected {
      position: absolute;
      right: 5px;
      top: 5px;
    }
  }
  .exportItem:hover {
    background: @default-table-hover-color;
  }
}
.search-item {
  height: 40px;
  line-height: 38px;
  .search-label {
    text-align: right;
  }
}
.clearfix {
  position: relative;
  margin-bottom: 10px;
  height: 30px;
  .batch {
    position: absolute;
    left: 0px;
  }
  .int {
    position: absolute;
    right: 80px;
  }
  .export {
    position: absolute;
    right: 490px;
  }
  .senior {
    cursor: pointer;
    line-height: 30px;
    margin-left: 10px;
    position: absolute;
    right: 0;
    top: 0;
  }
}

/deep/.ivu-card-body {
  .clearfix {
    height: initial !important;
  }
}
</style>
