<template>
  <div class="matrix-overview">
    <Loading :loading-show="loadingShow" type="fix"></Loading>
    <TsContain>
      <template v-slot:topLeft><span class="tsfont-plus text-action" @click="addMatrix">{{ $t('dialog.title.addtarget',{'target':$t('page.matrix')}) }}</span></template>
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
                <i class="ts-block"></i>
              </div>
              <div class="action-item" :class="modeType == 'list' ? 'active text-href' : ''" @click="changeMode('list')">
                <i class="ts-list"></i>
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
            v-if="matrixTableList"
            v-bind="matrixTableList"
            keyName="uuid"
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
                  <li v-if="row.type === 'custom'" class="ts-intersect icon" @click.stop="copyMatrix(row)">{{ $t('page.copy') }}</li>
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
                          <div @click="exportMatrix(row.uuid, row.name)">{{ $t('page.export') }}</div>
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
                            <span>{{ $t('page.import') }}</span>
                          </Upload>
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
                  width="500"
                  :transfer="true"
                >
                  <a href="javascript:void(0)">{{ $t('page.viewexample') }}</a>
                  <div slot="content" class="api">
                    <pre>
&lt;view&gt;
   &lt;!--{{ $t('message.framework.viewmatrixsql') }}--&gt;
  &lt;attrs&gt;
    &lt;attr name="user_id" label="{{ $t('page.userid') }}" /&gt;
    &lt;attr name="user_name" label="{{ $t('page.username') }}" /&gt;
    &lt;attr name="teamName" label="{{ $t('page.group') }}" /&gt;
  &lt;/attrs&gt;
  &lt;sql&gt;
    SELECT
    &lt;!--{{ $t('message.framework.reqid') }}--&gt;
    `u`.`id` AS id,
    &lt;!--{{ $t('message.framework.requuid') }}--&gt;
 `u`.`uuid` AS uuid,
    &lt;!--{{ $t('message.framework.reqattrs') }}--&gt;
    `u`.`user_name` AS name,
    `u`.`user_id` as user_id,
    `u`.`user_name` as user_name,
    group_concat( `t`.`name`) AS teamName
    FROM `user` `u`
    LEFT JOIN `user_team` `ut` ON `u`.`uuid` = `ut`.`user_uuid`
    LEFT JOIN `team` `t` ON `t`.`uuid` = `ut`.`team_uuid`
    GROUP BY u.`uuid`
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
      </TsForm>
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: [''],
  data() {
    let _this = this;
    return {
      actionUrl: BASEURLPREFIX + '/api/binary/matrix/import',
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
        // cmdbId: {
        //   type: 'radio',
        //   label: '视图类型',
        //   value: null,
        //   transfer: true,
        //   dataList: [{text: '视图', value: 1}, {text: '模型', value: 2}],
        //   width: '100%',
        //   validateList: ['required'],
        //   onChange: val => {
        //     let name = '';
        //     if (val == 1) {
        //       name = '视图数据源';
        //       _this.customviewList();
        //     } else {
        //       name = '模型数据源';
        //       _this.cmdbList();
        //     }
        //     _this.addAtrixForm.externalId.isHidden = false;
        //     _this.addAtrixForm.externalId.label = name;
        //   }
        // },        
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
            _this.addAtrixForm.showAttributeLabelList.value = [];
            if (val) {
              _this.showAttribute(val);
            } else {
              _this.addAtrixForm.showAttributeLabelList.dataList = [];
            }
          }
        },
        showAttributeLabelList: {
          type: 'select',
          label: this.$t('term.pbc.modelattribute'),
          value: [],
          multiple: true,
          transfer: true,
          isHidden: true,
          dataList: [],
          width: '100%',
          validateList: ['required']
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
        }
        // customViewId: {
        //   type: 'select',
        //   label: '自定义视图',
        //   value: null,
        //   transfer: true,
        //   isHidden: true,
        //   dataList: [],
        //   width: '100%',
        //   // valueName: 'id',
        //   // textName: 'name',
        //   validateList: [
        //     'required'
        //   ]
        // }
      },
      matrixList: [], //矩阵列表
      matrixCardData: {
        //卡片布局的矩阵初始数据
        cardList: [],
        currentPage: 1,
        pageSize: 24,
        pageCount: 1
      },
      matrixTableList: [],
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
      tablePageSize: 20
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
          _this.addAtrixForm.showAttributeLabelList.isHidden = false;
          _this.cmdbList();
        } else {
          _this.addAtrixForm.showAttributeLabelList.isHidden = true;
        }
      });
    },
    showAttribute(val) {
      let data = {
        'matrixUuid': null,
        'type': 'cmdbci',
        'ciId': val
      };
      this.$api.framework.matrix
        .getMatrixAttributeByUuid(data)
        .then(res => {
          if (res.Status == 'OK') {
            let resData = res.Return.tbodyList;
            let newData = [];
            resData.forEach(v => {
              newData.push({text: v.name, value: v.label});
            });
            // console.log(resData);
            this.addAtrixForm.showAttributeLabelList.dataList = newData;
            // console.log(this.addAtrixForm);
          }
        })
        .catch(error => {
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
    async customviewList() {
      let data = {
        currentPage: 1,
        isPrivate: 0    
      };
      await this.$https.post('/api/rest/cmdb/customview/public/search', data).then(res => {
        if (res.Status == 'OK') {
          let resData = res.Return.tbodyList;
          let newData = [];
          resData.forEach(j => {
            newData.push({text: j.name, value: j.id});
          });
          this.addAtrixForm.externalId.dataList = newData;
        }
      });
    },
    //数据源矩阵检索
    getMatrixList: function(page) {
      let data = {
        keyword: this.keyword,
        pageSize: this.matrixCardData.pageSize,
        currentPage: page || this.currentPage
      };
      this.loadingShow = true;
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
                  [{name: this.$t('page.copy'), value: 'copy', type: 'text'}, {name: this.$t('page.export'), value: 'export', type: 'download'}, 
                    {name: this.$t('term.pbc.exporttemplate'), value: 'exportAttr', type: 'text'}],
                upload: true, actionUrl: this.actionUrl
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
    action(row, value) {
      if (value == 'del') {
        if (row.type === 'private') {
          return;
        }
        this.delMatrix(row);
      } else if (value == 'copy') {
        this.copyMatrix(row);
      } else if (value == 'export') {
        this.exportMatrix(row.uuid, row.name);
      } else if (value == 'exportAttr') {
        this.exportAttributeMatrix(row.uuid);
      }
    },
    //表格形式展示数据
    getMatrixTableList: function(param) {
      let data = param || {};
      this.loadingShow = true;
      this.$api.framework.matrix.getMatrixList(data).then(res => {
        if (res.Status == 'OK') {
          this.matrixTableList = res.Return;
          this.matrixTableList.theadList = this.matrixTableThead;
          setTimeout(() => {
            this.loadingShow = false;
          }, 200);
        }
      });
    },
    getPagedata(current) {
      if (current) {
        this.matrixTableList.currentPage = current;
      }
      let param = {
        keyword: this.keyword,
        pageSize: this.tablePageSize,
        currentPage: this.matrixTableList.currentPage ? this.matrixTableList.currentPage : 1
      };
      this.getMatrixTableList(param);
    },
    changePageSize(size) {
      this.tablePageSize = size;
      let param = {
        keyword: this.keyword,
        pageSize: this.tablePageSize,
        currentPage: 1
      };
      this.getMatrixTableList(param);
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
      this.getMatrixList();
      let data = {
        keyword: this.keyword,
        pageSize: this.tablePageSize,
        currentPage: 1
      };
      this.getMatrixTableList(data);
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
              this.currentPage = 1;
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
      if (data.ciId) {
        data.config = {
          showAttributeLabelList: data.showAttributeLabelList
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
    exportMatrix: function(uuid) {
      let data = {
        matrixUuid: uuid,
        fileType: 'excel'
      };
      this.$api.framework.matrix
        .exportMatrix(data)
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
        private: 'tsfont-private' //私有数据源
      };
      return iconObj[typeName] || '';
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
    }
  },

  filter: {},

  computed: {},

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

