<template>
  <div class="matrix-overview">
    <Loading :loading-show="loadingShow" type="fix"></Loading>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addMatrix">
          {{ $t('dialog.title.addtarget',{'target':$t('page.matrix')}) }}
        </span>
        <span class="tsfont-upload action-item text-action" @click.self="$refs.uploadDialog.showDialog">{{ $t('page.import') }}</span>
        <UploadDialog
          ref="uploadDialog"
          :actionUrl="importMatrixDefinitionUrl"
          :formatList="['pak']"
          @on-all-upload="searchMatrix()"
        />
      </template>
      <template v-slot:topRight>
        <TsRow>
          <Col :span="6">
            <RadioGroup v-model="modeType" type="button">
              <Radio label="block"><i class="tsfont-blocklist"></i></Radio>
              <Radio label="list"><i class="tsfont-list"></i></Radio>
            </RadioGroup>
          </Col>
          <Col :span="18">
            <InputSearcher
              v-model="keyword"
              @change="searchMatrix()"
            ></InputSearcher>
          </Col>
        </TsRow>

        <!-- <div class="controller-group" style="--children:2">
          <div style="text-align:right">
            <div class="action-group">
              <div class="action-item" :class="modeType == 'block' ? 'active text-href' : ''" @click="changeMode('block')">
                <i class="tsfont-blocklist"></i>
              </div>
              <div class="action-item" :class="modeType == 'list' ? 'active text-href' : ''" @click="changeMode('list')">
                <i class="tsfont-list"></i>
              </div>
            </div>
          </div>
          <div>
            <TsFormInput
              v-model="keyword"
              class="search"
              search
              clearable
              placeholder="关键字"
              border="border"
              @on-enter="searchMatrix()"
              @on-clear="searchMatrix"
            ></TsFormInput>
          </div>
        </div>-->
      </template>
      <div slot="content">
        <div v-show="modeType == 'block'" class="list-box">
          <TsCard
            v-bind="matrixCardData"
            :boxShadow="false"
            :padding="false"
            :fixBtn="true"
            @updatePage="getMatrixList"
            @action="action"
            @uploadSuccess="uploadSuccess"
            @uploadError="uploadError"
          >
            <template slot-scope="{ row }">
              <div class="title pb-sm">
                <div class="overflow top-title-matrix text-action" :title="row.name + '('+row.label+')'" @click="editMatrix(row.uuid, row.name, row.type)"><span>{{ row.name }}</span><span class="text-grey">({{ row.label }})</span></div>
                <div class="text-grey top-typename">
                  <Tooltip :content="row.typeName" transfer theme="light">
                    <Icon :size="16" :custom="getIconByType(row.type)" class="text-primary customize-data-icon" />
                  </Tooltip>
                </div>
              </div>
              <div v-if="row.type !='private'" class="text-title">
                <UserCard v-bind="row.fcuVo" hideAvatar></UserCard>
                <span> {{ row.lcd | formatDate }} {{ row.actionType }}</span>
              </div>
              <div v-else class="text-title">
                -
              </div>
            </template>
          </TsCard>
        </div>
        <div v-show="modeType == 'list'">
          <TsTable
            v-bind="matrixTableConfig"
            keyName="uuid"
            :theadList="matrixTableThead"
            @operation="operation"
            @changeCurrent="getPagedata"
            @changePageSize="changePageSize"
          >
            <template slot="lcu" slot-scope="{ row }">
              <UserCard v-if="row.type !='private'" v-bind="row.lcuVo"></UserCard>
              <div v-else>-</div>
            </template>
            <template slot="lcd" slot-scope="{ row }">
              <div v-if="row.type !='private'">{{ row.lcd | formatDate }}</div>
              <div v-else>-</div>
            </template>
            <template slot="referenceCount" slot-scope="{ row }">
              <div>
                <ReferenceSelect
                  :uuid="row.uuid"
                  :isTable="true"
                  calleeType="matrix"
                  :referenceCount="row.referenceCount"
                ></ReferenceSelect>
              </div>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li v-if="row.type === 'custom'" class="tsfont-copy icon" @click.stop="copyMatrix(row)">{{ $t('page.copy') }}</li>
                  <li
                    class="tsfont-trash-o icon"
                    :class="{ disable: row.referenceCount > 0 || row.type==='private' }"
                    :title="row.type==='private'? $t('message.framework.privatematrixtip') : row.referenceCount > 0 ? $t('message.framework.delmatrixtip') : ''"
                    @click.stop="delMatrix(row)"
                  >{{ $t('page.delete') }}</li>
                  <li v-if="row.type === 'custom'">
                    <Dropdown trigger="click" transfer>
                      <span class="padding-text tsfont-option-horizontal hover-color"></span>
                      <DropdownMenu slot="list" class="dropdown">
                        <DropdownItem>
                          <div @click="exportMatrixData(row.uuid, row.name)">{{ $t('term.pbc.exportdata') }}</div>
                        </DropdownItem>
                        <DropdownItem>
                          <div @click="exportAttributeMatrix(row.uuid)">{{ $t('term.pbc.exporttemplate') }}</div>
                        </DropdownItem>
                        <DropdownItem>
                          <Upload
                            ref="upload"
                            :show-upload-list="false"
                            :on-success="uploadSuccess"
                            :on-error="uploadError"
                            :action="`${actionUrl}` + `?matrixUuid=` + `${row.uuid}`"
                          >
                            <span>{{ $t('page.importdata') }}</span>
                          </Upload>
                        </DropdownItem>
                        <DropdownItem>
                          <div @click="exportMatrix(row.uuid)">{{ $t('page.export') }}</div>
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </li>
                  <li v-else-if="row.type === 'view' || row.type === 'cmdbci' || row.type === 'external'">
                    <Dropdown trigger="click" transfer>
                      <span class="padding-text tsfont-option-horizontal hover-color"></span>
                      <DropdownMenu slot="list" class="dropdown">
                        <DropdownItem>
                          <div @click="exportMatrixData(row.uuid, row.name)">{{ $t('term.pbc.exportdata') }}</div>
                        </DropdownItem>
                        <DropdownItem>
                          <div @click="exportMatrix(row.uuid)">{{ $t('page.export') }}</div>
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </div>
    </TsContain>
    <TsDialog
      ref="TsDialog"
      type="modal"
      :is-show.sync="atrixFormDialog"
      :mask-close="false"
      :has-footer="true"
      :title="isCopy ? $t('dialog.title.copytarget',{'target':$t('page.matrix')}) : $t('dialog.title.addtarget',{'target':$t('page.matrix')})"
      width="medium"
      @on-close="atrixFormDialog = false"
      @on-ok="okAddMatrix"
    >
      <TsForm ref="addAtrixForm" :item-list="addAtrixForm" type="type">
        <template v-slot:integrationUuid>
          <div class="editIntegration">
            <TsFormSelect v-model="addAtrixForm.integrationUuid.value" v-bind="addAtrixForm.integrationUuid">
              <template v-slot:first-ul>
                <li class="tsfont-plus text-href first-slot" @click="addIntegration()">{{ $t('page.config') }}</li>
              </template>
            </TsFormSelect>
            <div class="action-group action-list">
              <span class="action-item tsfont-rotate-right" :title="$t('page.refresh')" @click="refreshIntegrationUuidList()"></span>
              <span
                v-if="addAtrixForm.integrationUuid.value"
                class="action-item tsfont-edit"
                :title="$t('term.framework.selectintgn')"
                @click="goEditIntegration"
              ></span>
            </div>
          </div>
        </template>
        <template v-slot:fileId>
          <div>
            <!-- dataType:后端给的字段类型 -->
            <div>
              <TsUpLoad
                ref="upload"
                styleType="button"
                dataType="matrixview"
                className="smallUpload"
                type="drag"
                width="75%"
                :multiple="false"
                :uploadCount="1"
                :format="['xml']"
                :defaultList="defaultFileList"
                @remove="setFile"
                @getFileList="selectFile"
              ></TsUpLoad>
              <div class="text-tip tips desc-text-mt">
                {{ $t('message.framework.xmldesc') }}
                <Poptip
                  trigger="hover"
                  placement="right"
                  width="800"
                  :transfer="true"
                >
                  <a href="javascript:void(0)">{{ $t('page.viewexample') }}</a>
                  <div slot="content" class="api">
                    <pre>
&lt;view&gt;
   &lt;!--{{ $t('message.framework.viewmatrixsql') }}--&gt;
  &lt;attrs&gt;
    &lt;attr name="id" label="ID" /&gt;
    &lt;attr name="xuqiu" label="需求" /&gt;
    &lt;attr name="moduleName" label="名称" /&gt;
    &lt;attr name="midver" label="版本" /&gt;
    &lt;attr name="type" label="架构类型" /&gt;
    &lt;attr name="serviceName" label="中间件服务名" /&gt;
    &lt;attr name="port" label="端口" /&gt;
    &lt;attr name="app" label="应用基架资源规格" /&gt;
  &lt;/attrs&gt;
  &lt;sql&gt;
    SELECT
    &lt;!--{{ $t('message.framework.reqid') }}--&gt;
    a.`cientity_id` AS id,
    &lt;!--{{ $t('message.framework.requuid') }}--&gt;
    MD5(a.`cientity_id`) AS uuid,
    &lt;!--{{ $t('message.framework.reqattrs') }}--&gt;
    b.`name` AS moduleName,
    a.`midver` AS midver,
    a.`xuqiu` AS xuqiu,
    a.`baseline` AS baseline,
    a.`type` AS type,
    e.`name` AS serviceName,
    d.`port` AS port,
    f.`name` AS app
    FROM @{DATA_SCHEMA}.`ci_inframid_line` a
    JOIN @{DATA_SCHEMA}.`ci_ciroot` b ON a.cientity_id = b.`cientity_id`
    LEFT JOIN `cmdb_rel` cr0 ON cr0.`from_name` = 'inframid_line' AND cr0.`to_name` = 'cfgfw'
    LEFT JOIN `cmdb_relentity` cr ON cr.`from_cientity_id` = a.cientity_id AND  cr.`rel_id` = cr0.`id`
    LEFT JOIN @{DATA_SCHEMA}.`ci_cfgfw` d ON d.cientity_id = cr.to_cientity_id
    LEFT JOIN @{DATA_SCHEMA}.`ci_ciroot` e ON e.cientity_id = d.`cientity_id`

    LEFT JOIN `cmdb_rel` cr2 ON cr2.`from_name` = 'infrabase_line' AND cr2.`to_name` = 'inframid_line'
    LEFT JOIN `cmdb_relentity` cr1 ON cr1.`to_cientity_id` = a.cientity_id AND  cr1.`rel_id` = cr2.`id`
    LEFT JOIN @{DATA_SCHEMA}.`ci_ciroot` f ON f.cientity_id = cr1.from_cientity_id
  &lt;/sql&gt;
&lt;/view&gt;
                    </pre>
                  </div>
                </Poptip>
              </div>
            </div>
            <div v-if="showFileError" class="form-error-tip">{{ $t('term.framework.upconfigfile') }}</div>
          </div>
        </template>
        <template v-slot:attributeMappingList="{valueConfig}">
          <div v-for="(conItem, conIdex) in addAtrixForm.attributeMappingList.value" :key="conIdex" class="pb-sm">
            <TsRow :gutter="0">
              <Col span="10">
                <div class="pr-sm">
                  <TsFormSelect
                    v-model="conItem.label"
                    :dataList="getDataList(conItem.label)"
                    search
                    transfer
                    :validateList="['required']"
                    @on-change="(val)=>{
                      changeAttrLabel(val, conItem, valueConfig);
                    }"
                  ></TsFormSelect>
                </div>
              </Col>
              <Col span="10">
                <div class="pr-sm">
                  <TsFormInput
                    v-model="conItem.uniqueIdentifier"
                    :maxlength="50"
                    type="text"
                    :placeholder="$t('page.uniquekey')"
                    :validateList="['required', 'key-special']"
                  ></TsFormInput>
                </div>
              </Col>
              <Col span="2">
                <div class="btn-group text-tip">
                  <span class="tsfont-plus" style="padding-right:8px;" @click="addAttr(conItem, conIdex)"></span>
                  <span v-if="addAtrixForm.attributeMappingList.value.length > 1" class="tsfont-minus" @click="delAttr(conItem, conIdex)"></span>
                </div>
              </Col>
            </TsRow>
          </div>
        </template>
      </TsForm>
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue'),
    UploadDialog: () => import('./components/UploadDialog.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: [''],
  data() {
    let _this = this;
    return {
      actionUrl: BASEURLPREFIX + '/api/binary/matrix/data/import',
      importMatrixDefinitionUrl: BASEURLPREFIX + '/api/binary/matrix/import', // 矩阵定义导入
      loadingShow: true,
      keyword: '',
      showFileError: false, //视图数据校验信息是否展示
      defaultFileList: [],
      addAtrixForm: {
        //矩阵表单数据
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          width: '100%',
          label: this.$t('page.name'),
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: 'api/rest/matrix/save',
              message: this.$t('message.targetisexists', {'target': this.$t('page.matrixname')}),
              key: 'name',
              params: (value, rule) => {
                rule.url = this.isCopy ? 'api/rest/matrix/copy' : 'api/rest/matrix/save';
                return {};
              }
            }
          ]
        },
        label: {
          type: 'text',
          name: 'label',
          value: '',
          maxlength: 50,
          width: '100%',
          label: this.$t('page.uniquekey'),
          validateList: ['required', 'char', { name: 'searchUrl', url: 'api/rest/matrix/save', message: this.$t('message.targetisexists', {'target': this.$t('term.framework.matrixuniquekey')}), key: 'label' }]
        },
        type: {
          type: 'radio',
          label: this.$t('page.type'),
          name: 'type',
          dataList: [
            // {
            //   text: '自定义数据源',
            //   value: 'custom',
            //   key: 'custom'
            // },
            // {
            //   text: '外部数据源',
            //   value: 'integrationUuid11',
            //   key: 'fileId'
            // },
            // {
            //   text: '视图数据源',
            //   value: 'fileId22',
            //   key: 'integrationUuid'
            // }
          ],
          value: 'custom',
          onChange: val => {
            _this.allHidden(val);
          }
        },
        integrationUuid: {
          type: 'slot',
          label: this.$t('term.framework.integrationsetting'),
          value: null,
          transfer: true,
          isHidden: true,
          width: '90%',
          dynamicUrl: '/api/rest/integration/search',
          params: {
            handler: 'MatrixIntegrationHandler',
            isActive: 1
          },
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'uuid',
          validateList: [
            'required'
          ]
        },
        ciId: {
          type: 'select',
          label: this.$t('term.framework.cidata'),
          value: null,
          transfer: true,
          isHidden: true,
          dataList: [],
          width: '100%',
          validateList: ['required'],
          onChange: val => {
            let emptyRow = {
              label: '',
              uniqueIdentifier: ''
            };
            let newList = [];
            newList.push(emptyRow);
            _this.addAtrixForm.attributeMappingList.value = newList;
            if (val) {
              let data = {
                'matrixUuid': null,
                'type': 'cmdbci',
                'ciId': val
              };
              _this.showAttribute(data);
            }
          }
        },
        customViewId: {
          type: 'select',
          label: this.$t('term.cmdb.customview'),
          dynamicUrl: '/api/rest/cmdb/customview/search',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          value: null,
          transfer: true,
          isHidden: true,
          dataList: [],
          width: '100%',
          validateList: [
            'required'
          ],
          onChange: val => {
            let emptyRow = {
              label: '',
              uniqueIdentifier: ''
            };
            let newList = [];
            newList.push(emptyRow);
            _this.addAtrixForm.attributeMappingList.value = newList;
            if (val) {
              let data = {
                'matrixUuid': null,
                'type': 'cmdbcustomview',
                'customViewId': val
              };
              _this.showAttribute(data);
            }
          }
        },
        fileId: {
          type: 'slot',
          label: this.$t('term.cmdb.configfile'),
          value: null,
          transfer: true,
          isHidden: true,
          width: '100%',
          valueName: 'uuid',
          textName: 'name',
          validateList: [
            'required'
          ]
        },
        attributeMappingList: {
          type: 'slot',
          label: this.$t('page.attribute'),
          value: [],
          transfer: true,
          isHidden: true,
          width: '100%',
          validateList: ['required']
        }
      },
      matrixList: [], //矩阵列表
      matrixCardData: {
        //卡片布局的矩阵初始数据
        cardList: [],
        currentPage: 1,
        pageSize: 24,
        pageCount: 1
      },
      matrixTableConfig: {
        currentPage: 1,
        pageSize: 20,
        rowNum: 0,
        tbodyList: []
      },
      matrixTableThead: [
        {
          title: 'ID',
          key: 'id'
        },
        {
          title: this.$t('page.name'),
          key: 'name',
          type: 'linktext',
          textValue: 'view'
        },
        {
          title: this.$t('page.uniquekey'),
          key: 'label'
        },
        {
          title: this.$t('page.datasourcetype'),
          key: 'typeName'
        },
        {
          title: this.$t('page.referencecount'),
          key: 'referenceCount'
        },
        {
          title: this.$t('page.fcu'),
          key: 'lcu'
        },
        {
          title: this.$t('page.fcd'),
          key: 'lcd'
        },
        {
          title: '',
          key: 'action',
          align: 'right',
          width: 10
        }
      ],
      atrixFormDialog: false, //新建矩阵弹框
      isCopy: false, //是否复制
      uuid: null, //矩阵uuid
      type: null, //矩阵类型
      currentPage: 1, //当前页数
      pageCount: 1, //总页数
      modeType: 'block', //显示方式
      cmdbCiEntityAttrList: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.atrixFormDialogShow) {
      //跳转到这个页面时，需要进行新增
      this.addMatrix();
    }
    this.policyList();
    // this.cmdbList();
  },
  beforeMount() {},
  mounted() {
    if (this.modeType == 'block') {
      this.getMatrixList();
    } else {
      this.getPagedata();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    allHidden(val) {
      let _this = this;
      let newData = this.addAtrixForm.type.dataList;
      let newVal = '';
      newData.forEach(v => {
        if (v.value == val) {
          newVal = v.key;
        }
      });
      this.addAtrixForm.ciId.value = null;
      this.addAtrixForm.customViewId.value = null;
      this.cmdbCiEntityAttrList = [];
      Object.keys(_this.addAtrixForm).forEach(v => {
        if ((_this.addAtrixForm[v].isHidden == false || _this.addAtrixForm[v].isHidden == true) && val != 'custom') {
          if (_this.addAtrixForm[v].name == newVal) {
            _this.$set(_this.addAtrixForm[v], 'isHidden', false);
          } else {
            _this.$set(_this.addAtrixForm[v], 'isHidden', true);
          }
        }

        if ((_this.addAtrixForm[v].isHidden == false || _this.addAtrixForm[v].isHidden == true) && val == 'custom') {
          _this.$set(_this.addAtrixForm[v], 'isHidden', true);
        }
      });

      _this.$nextTick(() => {
        if (newVal == 'ciId') {
          let emptyRow = {
            label: '',
            uniqueIdentifier: ''
          };
          let newList = [];
          newList.push(emptyRow);
          _this.addAtrixForm.attributeMappingList.value = newList;
          _this.addAtrixForm.attributeMappingList.isHidden = false;
          _this.cmdbList();
        } else if (newVal == 'customViewId') {
          let emptyRow = {
            label: '',
            uniqueIdentifier: ''
          };
          let newList = [];
          newList.push(emptyRow);
          _this.addAtrixForm.attributeMappingList.value = newList;
          _this.addAtrixForm.attributeMappingList.isHidden = false;
        } else {
          _this.addAtrixForm.attributeMappingList.isHidden = true;
        }
      });
    },
    showAttribute(data) {
      this.$api.framework.matrix
        .getMatrixAttributeByUuid(data)
        .then(res => {
          if (res.Status == 'OK') {
            let tbodyList = res.Return.tbodyList || [];
            let dataList = [];
            tbodyList.forEach(v => {
              if (v.label) {
                dataList.push({text: v.name, value: v.label});
              }
            });
            this.cmdbCiEntityAttrList = dataList;
          }
        });
    },
    setFile: function(fileList) {
      this.defaultFileList = [];
      this.showFileError = true;
    },
    selectFile: function(fileList) {
      let fileObj = {};
      fileObj['id'] = fileList[0].id;
      fileObj['name'] = fileList[0].name;
      this.defaultFileList.push(fileObj);
      this.showFileError = false;
    },
    async policyList() {
      await this.$api.common.getSelectList({ enumClass: 'MatrixTypeFactory' }).then((res) => {
        if (res.Status == 'OK') {
          this.addAtrixForm.type.dataList = res.Return.filter(item => {
            return item.value != 'private';
          });
        }
      });
    },
    async cmdbList() {
      let data = '';
      await this.$https.post('/api/rest/cmdb/ci/citype/search' + data).then(res => {
        if (res.Status == 'OK') {
          let resData = res.Return;
          let newData = [];
          resData.forEach(v => {
            v.ciList.forEach(j => {
              newData.push({text: j.label, value: j.id});
            });
          });
          this.addAtrixForm.ciId.dataList = newData;
        }
      });
    },
    //数据源矩阵检索
    getMatrixList: function(currentPage) {
      let data = {
        keyword: this.keyword,
        pageSize: this.matrixCardData.pageSize,
        currentPage: currentPage || this.matrixCardData.currentPage
      };
      this.loadingShow = true;
      this.$addHistoryData('modeType', this.modeType);
      this.$addHistoryData('keyword', this.keyword);
      this.$addHistoryData('currentPage', data.currentPage);
      this.$addHistoryData('pageSize', data.pageSize);
      this.$api.framework.matrix.getMatrixList(data).then(res => {
        if (res.Status == 'OK') {
          const { tbodyList: cardList, currentPage, pageSize, pageCount, rowNum } = res.Return;
          this.matrixCardData = { cardList, currentPage, pageSize, pageCount, rowNum };
          this.matrixCardData.cardList.map(v => {
            if (v.referenceCount > 0 || v.type === 'private') {
              v.disable = true;
            } else {
              v.disable = false;
            }

            v.btnList = [
              {name: this.$t('page.reference'), value: 'ReferenceSelect', icon: '', type: 'ReferenceSelect', calleeType: 'matrix'},
              {name: this.$t('page.delete'), value: 'del', type: 'del', icon: 'tsfont-trash-o', disable: true, text: v.type === 'private' ? this.$t('message.framework.privatematrixtip') : this.$t('message.framework.delmatrixtip'), key: 'disable'}
            ];

            if (v.type == 'custom') {
              v.btnList.push(
                {name: this.$t('term.framework.multi'), value: 'dropdown', icon: '', type: 'dropdown', menuArr:
                  [
                    {name: this.$t('page.copy'), value: 'copy', type: 'text'},
                    {name: this.$t('term.pbc.exportdata'), value: 'exportData', type: 'download'},
                    {name: this.$t('term.pbc.exporttemplate'), value: 'exportAttr', type: 'text'},
                    {name: this.$t('page.export'), value: 'export', type: 'download'}
                  ],
                upload: true, actionUrl: this.actionUrl
                }
              );
            } else if (v.type == 'view' || v.type == 'external' || v.type == 'cmdbci') {
              v.btnList.push(
                {name: this.$t('term.framework.multi'), value: 'dropdown', icon: '', type: 'dropdown', menuArr:
                  [
                    {name: this.$t('term.pbc.exportdata'), value: 'exportData', type: 'download'},
                    {name: this.$t('page.export'), value: 'export', type: 'download'}
                  ]
                }
              );
            }
          });
        }
        setTimeout(() => {
          this.loadingShow = false;
        }, 200);
      });
    },
    restoreHistory(historyData) {
      let modeType = historyData['modeType'];
      this.keyword = historyData['keyword'];
      if (this.modeType == 'block') {
        this.matrixCardData.currentPage = historyData['currentPage'];
        this.matrixCardData.pageSize = historyData['pageSize'];
      } else {
        this.matrixTableConfig.currentPage = historyData['currentPage'];
        this.matrixTableConfig.pageSize = historyData['pageSize'];
      }
      this.modeType = modeType;
    },
    action(row, value) {
      if (value == 'del') {
        if (row.type === 'private') {
          return;
        }
        this.delMatrix(row);
      } else if (value == 'copy') {
        this.copyMatrix(row);
      } else if (value == 'exportData') {
        this.exportMatrixData(row.uuid, row.name);
      } else if (value == 'exportAttr') {
        this.exportAttributeMatrix(row.uuid);
      } else if (value == 'export') {
        this.exportMatrix(row.uuid);
      }
    },
    //表格形式展示数据
    getMatrixTableList(currentPage, pageSize) {
      this.loadingShow = true;
      this.$addHistoryData('modeType', this.modeType);
      this.$addHistoryData('keyword', this.keyword);
      this.$addHistoryData('currentPage', currentPage);
      this.$addHistoryData('pageSize', pageSize);
      this.$api.framework.matrix.getMatrixList({
        keyword: this.keyword,
        currentPage: currentPage,
        pageSize: pageSize
      }).then(res => {
        if (res.Status == 'OK') {
          this.matrixTableConfig = Object.assign(this.matrixTableConfig, res.Return || {});
          setTimeout(() => {
            this.loadingShow = false;
          }, 200);
        }
      });
    },
    getPagedata(current = 1) {
      if (current) {
        this.matrixTableConfig.currentPage = current;
        this.matrixTableConfig.pageSize = 20;
      }
      this.getMatrixTableList(this.matrixTableConfig.currentPage, this.matrixTableConfig.pageSize);
    },
    changePageSize(pageSize = 20) {
      this.matrixTableConfig.pageSize = pageSize;
      this.getMatrixTableList(1, this.matrixTableConfig.pageSize);
    },
    //新建矩阵
    addMatrix: function() {
      this.atrixFormDialog = true;
      this.addAtrixForm.name.value = null;
      this.addAtrixForm.label.value = null;
      this.addAtrixForm.integrationUuid.value = null;
      this.addAtrixForm.fileId.value = null;
      this.uuid = null;
      this.addAtrixForm.type.disabled = false;
      this.isCopy = false;
      this.defaultFileList = [];
    },
    //搜索矩阵
    searchMatrix: function() {
      this.getMatrixList(1);
    },
    //删除矩阵
    delMatrix(row) {
      if (row.referenceCount > 0) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = {
            uuid: row.uuid
          };
          this.$api.framework.matrix.deleteMatrix(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchMatrix();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    //复制矩阵
    copyMatrix: function(row) {
      this.addAtrixForm.name.value = row.name + '_copy';
      this.addAtrixForm.label.value = row.label + 'copy';
      this.addAtrixForm.type.value = row.type;
      this.addAtrixForm.integrationUuid.value = row.integrationUuid;
      this.uuid = row.uuid;
      this.isCopy = true;
      this.atrixFormDialog = true;
      this.addAtrixForm.type.disabled = true;
      this.allHidden(row.type);
    },
    //确定添加/复制矩阵
    okAddMatrix: function() {
      let formObj = this.$refs.addAtrixForm;
      let data = formObj.getFormValue();
      if (formObj.valid()) {
        if (data.type == 'view' && this.defaultFileList.length == 0) {
          // 上传组件没有值
          this.showFileError = true;
          return false;
        } else if (data.type == 'view' && this.defaultFileList.length > 0) {
          data.fileId = this.defaultFileList[0].id;
        }
      } else {
        //校验未通过
        return;
      }
      if (data.ciId || data.customViewId) {
        if (data.attributeMappingList && data.attributeMappingList.length > 0) {
          let attributeMappingList = data.attributeMappingList;
          for (let i = 0; i < attributeMappingList.length; i++) {
            let attributeMapping = attributeMappingList[i];
            if (!attributeMapping.label) {
              this.$Notice.error({
                title: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.attribute') }),
                duration: 1.5
              });
              return;
            }
            if (!attributeMapping.uniqueIdentifier) {
              this.$Notice.error({
                title: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.uniquekey')}),
                duration: 1.5
              });
              return;
            }
          }
        } else {
          this.$Notice.error({
            title: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.attribute') }),
            duration: 1.5
          });
          return;
        }
        data.config = {
          attributeMappingList: data.attributeMappingList
        };
      }

      if (this.isCopy) {
        delete data.type;
        data.uuid = this.uuid;
        this.$api.framework.matrix
          .copyMatrix(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.searchMatrix();
              this.$Message.success(this.$t('message.copysuccess'));
              this.atrixFormDialog = false;
            }
          });
      } else {
        this.$api.framework.matrix
          .saveMatrix(data)
          .then(res => {
            if (res.Status == 'OK') {
              let obj = res.Return.matrix;
              let path = null;
              if (obj.type == 'external') {
                path = '/matrix-external-edit';
              } else if (obj.type == 'custom') {
                path = '/matrix-edit';
              } else if (obj.type == 'private') {
                path = '/matrix-private';
              } else {
                path = '/matrix-view-edit';
              }
              let query = {
                uuid: obj.uuid,
                name: obj.name,
                type: obj.type
              };
              obj.type != 'external' && obj.type != 'view' ? (query.isAddMatrix = true) : ''; //外部数据和视图数据不需要打开编辑矩阵弹框
              this.$router.push({
                path: path,
                query: query
              });
            }
          });
      }
    },
    //导出矩阵
    exportMatrixData: function(uuid) {
      let data = {
        matrixUuid: uuid,
        fileType: 'excel'
      };
      this.$api.framework.matrix
        .exportMatrixData(data)
        .then(res => {
          if (res.status == '200') {
            const aLink = document.createElement('a');
            let blob = new Blob([res.data], {
              type: 'application/x-msdownload'
            });
            aLink.href = URL.createObjectURL(blob);
            let contentDisposition = decodeURI(res.headers['content-disposition']);
            let fileName = contentDisposition.substring(22, contentDisposition.length - 1);
            aLink.download = fileName;
            aLink.click();
            document.body.appendChild(aLink);
          }
        })
        .catch(error => {
          this.$Notice.error({
            title: this.$t('page.exporterror')
          });
        });
    },
    //导出矩阵模板
    exportAttributeMatrix: function(uuid) {
      let data = {
        matrixUuid: uuid
      };
      this.$api.framework.matrix
        .exportAttributeMatrix(data)
        .then(res => {
          if (res.status == '200') {
            const aLink = document.createElement('a');
            let blob = new Blob([res.data], {
              type: 'application/x-msdownload'
            });
            aLink.href = URL.createObjectURL(blob);
            let contentDisposition = decodeURI(res.headers['content-disposition']);
            let fileName = contentDisposition.substring(22, contentDisposition.length - 1);
            aLink.download = fileName;
            aLink.click();
            document.body.appendChild(aLink);
          }
        })
        .catch(error => {
          this.$Notice.error({
            title: this.$t('page.exporterror')
          });
        });
    },
    exportMatrix(uuid) {
      let data = {
        uuid: uuid
      };
      this.$api.framework.matrix.exportMatrix(data).then(res => {
        if (res.status == '200') {
          const aLink = document.createElement('a');
          let blob = new Blob([res.data], {
            type: 'application/x-msdownload'
          });
          aLink.href = URL.createObjectURL(blob);
          let contentDisposition = decodeURI(res.headers['content-disposition']);
          let fileName = contentDisposition.substring(22, contentDisposition.length - 1);
          aLink.download = fileName;
          aLink.click();
          document.body.appendChild(aLink);
        }
      }).catch(error => {
        this.$Notice.error({
          title: this.$t('page.exporterror')
        });
      });
    },
    //导入矩阵成功
    uploadSuccess: function(res, file) {
      if ((file.response.Status = 'OK')) {
        this.$Message.success(this.$t('message.importsuccess'));
        this.getMatrixList();
      }
    },
    //导入矩阵失败
    uploadError: function(error, file) {
      if ((file.Status = 'ERROR')) {
        this.$Notice.error({
          title: this.$t('message.importfailed'),
          desc: file.Message
        });
      }
    },
    getIconByType(typeName) {
      let iconObj = {
        custom: 'tsfont-chart-table', // 自定义数据源
        external: 'tsfont-integration', // 外部数据源
        cmdbci: 'tsfont-ci-o', // cmdb模型数据源
        view: 'tsfont-shitu', // 视图数据源
        private: 'tsfont-private', //私有数据源
        cmdbcustomview: 'tsfont-component' // 自定义视图
      };
      return iconObj[typeName] || 'tsfont-chart-table';
    },
    editMatrix: function(uuid, name, type) {
      //编辑矩阵
      let path = null;
      // console.log(type, '----');
      if (type == 'external') {
        path = '/matrix-external-edit';
      } else if (type == 'custom') {
        path = '/matrix-edit';
      } else if (type == 'private') {
        path = '/matrix-private';
      } else {
        path = '/matrix-view-edit';
      }
      this.$router.push({
        path: path,
        query: {
          uuid: uuid,
          name: name,
          type: type
        }
      });
    },
    //行点击
    trClick: function(item) {
      let path = '/matrix-view-edit';
      if (item.type == 'external') {
        path = '/matrix-external-edit';
      } else if (item.type == 'custom') {
        path = '/matrix-edit';
      } else if (item.type == 'private') {
        path = '/matrix-private';
      }
      this.$router.push({
        path: path,
        query: {
          uuid: item.uuid,
          name: item.name,
          type: item.type
        }
      });
    },
    //改变显示方式
    changeMode(val) {
      if (val == 'block') {
        this.modeType = 'block';
        this.getMatrixList(1);
      } else {
        this.modeType = 'list';
        this.getPagedata(1);
      }
    },
    //刷新集成设置列表
    refreshIntegrationUuidList() {
      this.addAtrixForm.integrationUuid.dynamicUrl = '/api/rest/integration/search?refuuid=' + this.$utils.setUuid();
      this.$nextTick(() => {
        this.$Message.success(this.$t('message.refreshsuccess'));
      });
    },
    addIntegration() {
      //跳转到集成管理的页面
      window.open(HOME + '/framework.html#/integration-manage?isIntegrationDialogShow=true', '_blank');
    },
    goEditIntegration() {
      //跳转到集成编辑的页面
      window.open(HOME + '/framework.html#/integration-manage?isIntegrationDialogShow=true' + '&&integrationUuid=' + this.addAtrixForm.integrationUuid.value, '_blank');
    },
    operation(item, type) {
      if (type && type === 'view') {
        this.trClick(item);
      }
    },
    addAttr(conItem, conIdex) {
      let emptyRow = {
        label: '',
        uniqueIdentifier: ''
      };
      this.addAtrixForm.attributeMappingList.value.splice(conIdex + 1, 0, emptyRow);
    },
    delAttr(conItem, conIdex) {
      this.$delete(this.addAtrixForm.attributeMappingList.value, conIdex);
    },
    changeAttrLabel(val, conItem, valueConfig) {
      if (valueConfig.type === 'cmdbci') {
        this.$set(conItem, 'uniqueIdentifier', val);
      }
    }
  },
  filter: {},
  computed: {
    getDataList() {
      return (label) => {
        let list = this.$utils.deepClone(this.cmdbCiEntityAttrList);
        list.forEach(item => {
          let find = this.addAtrixForm.attributeMappingList.value.find(v => v.label === item.value && v.label !== label);
          if (find) {
            this.$set(item, '_disabled', true);
          } else {
            this.$set(item, '_disabled', false);
          }
        });
        return list;
      };
    }
  },
  watch: {
    modeType: {
      handler: function(val) {
        if (val === 'block') {
          this.getMatrixList(1);
        } else {
          this.getPagedata(1);
        }
      }
    }
  }
};
</script>

<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.matrix-overview {
  .bar-top-right {
    text-align: right;
    .mode-change {
      display: inline-block;
      text-align: center;
      position: relative;
      top: -1px;
      margin-left: 16px;
      .icon {
        display: inline-block;
        border: 1px solid;
        cursor: pointer;
        width: 32px;
        height: 32px;
        line-height: 30px;
        &:first-child{
          border-top-left-radius: 6px;
          border-bottom-left-radius: 6px;
          &:not(:last-child) {
            border-right: none;
          }
        }
       &:last-child {
          border-top-right-radius: 6px;
          border-bottom-right-radius: 6px;
        }
      }
    }
  }
  .padding-text {
    padding: 0 8px;
  }

  .pointer {
    cursor: pointer;
  }
  .list-box {
    padding: 0;
    .title {
      position: relative;
      // min-height: 0;
      // padding: 12px 20px;
      .top-title-matrix {
        padding-right: 50px;
        cursor: pointer;
      }
      .top-typename {
        position: absolute;
        right: 0;
        top: -2px;
        .typename-icon {
          width: 16px;
          height: 16px;
          line-height: 16px;
          text-align: center;
          border-radius: 2px;
          transform: scale(20/16);
          &.customize-data-icon {
            &::before {
              color: @primary-color;
            }
          }
          &.external-data-icon {
            &::before {
              color: @info-color;
            }
          }
        }
      }
    }
  }

  .formName {
    padding-left: @space-xs;
  }
  .version {
    color: @primary-color;
  }
  .ivu-upload-select {
    display: block;
  }
  // .list-box .btn-list {
  //   height: auto;
  //   padding: 0;
  // }
  .overvivew-main {
    margin-bottom: 0;
  }
}
.editIntegration .action-list {
  position: absolute;
  right: 0px;
  top: 0;
  line-height: 32px;
  .action-item {
    & + .action-item {
      padding-left: 0px;
    }
  }
}
</style>

