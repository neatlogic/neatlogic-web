<template>
  <div class="formEdit" @click.stop>
    <TsContain border="bottom">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="controller-group" style="--children:2">
          <div>
            <TsFormInput
              ref="formNameInput"
              v-model="formName"
              :placeholder="$t('form.placeholder.pleaseinput', { target: $t('page.formname') })"
              maxlength="30"
              :validateList="nameValidateList"
            />
          </div>
          <div>
            <Dropdown
              v-if="currentVersion.uuid"
              trigger="hover"
              placement="bottom-start"
              style="line-height: 30px;cursor: pointer;"
            >
              <span class="btn-green-op">
                {{ currentVersion.text }}
                <Icon type="ios-arrow-down"></Icon>
              </span>
              <DropdownMenu slot="list">
                <DropdownItem
                  v-for="item in versionList"
                  :key="item.id"
                  :class="['version-li', { selected: currentVersion.uuid == item.uuid }]"
                  @click.native="changeVersion(item.uuid, item.version)"
                >
                  {{ item.version }}
                  <span :class="['span-activeText', { active: item.isActive === 1 }]" @mouseenter="currentVersion.uuid == item.uuid && haveChangeData()">
                    {{ item.isActive === 1 ? $t('page.isactived') : $t('page.unactived') }}
                    <!-- <i-switch
                      v-model="item.isActive"
                      :disabled="item.isActive === 1 || (currentVersion.uuid == item.uuid && currentVersion.uuid && showActiveTooltip) ? true : false"
                      :true-value="1"
                      :false-value="0"
                      class="label-right"
                      :title="currentVersion.uuid == item.uuid && currentVersion.uuid && showActiveTooltip ? '版本已经被修改，需保存之后再激活' : '激活版本'"
                      @click.native.stop
                      @on-change="activeFormVersion(item.uuid)"
                    /> -->
                  </span>
                  <!-- <span
                    v-if="item.isActive !== 1"
                    class="tsfont-trash-o"
                    title="删除版本"
                    @click.stop="delVersionModal(item.uuid, item.version)"
                  ></span> -->
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item tsfont-lightning" @click="showFormedit">
            {{ $t('page.react') }}
            <Badge :count="account"></Badge>
          </span>
          <!-- <span v-if="activeVersionUuid == currentVersion.uuid && currentVersion.uuid" class="action-item tsfont-check-square-o disable">激活</span>
          <span
            v-else-if="currentVersion.uuid"
            :class="['action-item', 'tsfont-check-square-o', { disable: showActiveTooltip }]"
            :title="showActiveTooltip ? '版本已经被修改，需保存之后再激活' : ''"
            @click="activeFormVersion(currentVersion.uuid)"
            @mouseenter="haveChangeData"
          >激活</span> -->
          <span class="action-item tsfont-eye " @click="previewForm">{{ $t('page.preview') }}</span>
          <!-- <span class="action-item tsfont-save" @click="handleSaveForm()">{{ $t('page.save') }}</span> -->
          <!-- <span v-if="currentVersion.uuid" class="action-item tsfont-save" @click="saveForm('saveother')">另存为新版本</span> -->
          <span v-if="activeVersionUuid == currentVersion.uuid && currentVersion.uuid" class="action-item tsfont-trash-o disable">{{ $t('page.delete') }}</span>
          <span v-else-if="currentVersion.uuid" class="action-item tsfont-trash-o" @click="delVersionModal(currentVersion.uuid, currentVersion.version)">{{ $t('page.delete') }}</span>
          <span class="action-item" style="padding:0px;">
            <Dropdown trigger="click">
              <span class="tsfont-option-horizontal click-btn action-item last"></span>
              <DropdownMenu slot="list" class="dropdown">
                <DropdownItem v-if="currentVersion.uuid && referenceCount > 0" @click.native.stop="quoteList(1)">
                  <div class="tsfont-formstaticlist referenceCount">{{ $t('page.referencelist') }}[{{ referenceCount }}]</div>
                </DropdownItem>
                <DropdownItem v-else-if="currentVersion.uuid">
                  <div class="tsfont-formstaticlist referenceCount disable">{{ $t('page.referencelist') }}</div>
                </DropdownItem>
                <!-- <DropdownItem @click.native="$refs.uploadDialog.showDialog">
                  <span class="tsfont-import">导入</span>
                  <UploadDialog
                    ref="uploadDialog"
                    :beforeUpload="beforeUpload"
                    :actionUrl="importUrl + (formUuid || null)"
                    :formatList="formatList"
                    @on-success="uploadSuccess"
                  />
                </DropdownItem>
                <DropdownItem v-if="currentVersion.uuid" @click.native.stop="exportFile">
                  <div class="tsfont-export">导出</div>
                </DropdownItem> -->
              </DropdownMenu>
            </Dropdown>
          </span>
        </div>
      </template>
      <div slot="content" class="formedit-content dividing-color" @click.stop>
        <!-- 左边可拖动组件类型 -->
        <div class="col-left-contain dividing-color">
          <template v-for="(typeConfig, typeIndex) in componentTypeList">
            <div v-if="typeConfig.dataList && typeConfig.dataList.length" :key="typeIndex">
              <span class="col-left-title text-grey">{{ typeConfig.title }}</span>
              <ul class="form-itemul">
                <li
                  v-for="(form, dindex) in typeConfig.dataList"
                  v-show="!form.isHide"
                  :key="dindex"
                  class="form-itemli"
                  :data-type="form.handler"
                  draggable="true"
                  @dragend="drop($event, form)"
                  @dragstart="dropstart($event, form)"
                >
                  <div class="div-li-contain text-action">
                    <div :class="form.icon + ' item-icon ivu-col'"></div>
                    <div class="item-text">{{ form.name }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </template>
        </div>
        <!-- 中间可编辑表格 -->
        <div>
          <div class="col-right-contain bg-op">
            <TsSheet
              v-if="isLoaded"
              ref="TsSheet"
              :content-json="sheetData"
              :isFormedit="isFormedit"
              :labelName="labelNameConfig"
              @updateContent="updateContent"
              @closeEditform="isFormedit = false"
              @openEditform="isFormedit = true"
              @getFormrule="getFormrule"
            ></TsSheet>
          </div>
        </div>
      </div>
    </TsContain>

    <TsDialog type="modal" :is-show.sync="returnModel1" :mask-close="false">
      <template v-slot:header>
        <div>{{ $t('page.tip') }}</div>
      </template>
      <template v-slot>{{ $t('dialog.content.saveconfirm') }}</template>
      <template v-slot:footer>
        <Button @click="cancelReturn1"></Button>
        <Button type="primary" @click="okAddReturn1">{{ $t('page.save') }}</Button>
      </template>
    </TsDialog>
    <!-- 引用列表弹出框 -->
    <TsDialog
      type="modal"
      :is-show.sync="referenceModel"
      :has-footer="false"
      :mask-close="false"
      :title="$t('term.framework.flowlist')"
    >
      <template v-slot>
        <Loading :loading-show="loadingShow" type="fix"></Loading>
        <TsCard
          v-if="!loadingShow"
          v-bind="cardData"
          :sm="8"
          :lg="8"
          :xl="8"
          :xxl="8"
          classname="overvivew-main"
          :boxShadow="false"
          @updatePage="quoteList"
        >
          <template slot-scope="{ row }">
            <div v-html="row.text"></div>
          </template>
        </TsCard>
      </template>
    </TsDialog>
    <!-- 删除提示框 -->
    <TsDialog
      type="modal"
      :is-show.sync="delVersion.delVersionIsShow"
      :title="$t('term.framework.deletealert')"
      btn-type="error"
      @on-ok="delFormVersion()"
    >
      <p v-if="delVersion.uuid != currentVersion.uuid" v-html="$t('term.framework.deleteversionconfirm', {target: delVersion.version})"></p>
      <p v-else v-html="$t('term.framework.deletecurrentversionconfirm')"></p>
    </TsDialog>
    <TsDialog
      v-if="isPrevview"
      type="silder"
      :is-show.sync="isPrevview"
      :mask-close="true"
      :has-footer="false"
      :width="prewviewWidth"
      :bg-op="false"
    >
      <div slot="header">{{ $t('page.preview') }}</div>
      <div>
        <FormPreview :content="previewData"></FormPreview>
      </div>
    </TsDialog>
  </div>
</template>

<script>
let _this;
let needToChangeVersion = {};

import { componentListConfig as initComponentConfig } from '@/resources/components/FormMaker/formedit/componentConfig.js';
export default {
  name: '',
  provide() {
    return {
      $actionAuthorityConfig: this.actionAuthorityConfig,
      $labelName: this.labelNameConfig
    };
  },
  components: {
    TsSheet: () => import('@/resources/components/FormMaker/formedit/TsSheet.vue'),
    FormPreview: () => import('@/resources/components/FormMaker/formview/form-view.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    // UploadDialog:()=>import('@/resources/components/UploadDialog/UploadDialog.vue'),
    TsCard: () => import('@/resources/components/TsCard/TsCard')
  },
  props: [''],
  data() {
    return {
      formatList: ['formversion'], //导入文件格式
      editFormName: false,
      initFormName: '',
      isnew: false, //标志是否是新建的表单
      formName: '',
      nameValidateList: [
        'required',
        'name-special',
        {
          name: 'searchUrl',
          url: 'api/rest/form/save',
          key: 'name',
          params: () => ({ uuid: this.formUuid })
        }
      ],
      formUuid: null,
      currentVersion: { uuid: '', text: '' },
      content: null, //初始化表单数据
      sheetData: null,
      previewData: null,
      isLoaded: false, //修复通过异步获取数据不更新content
      versionList: [],
      activeVersionUuid: '',
      delVersion: { uuid: '', version: '', delVersionIsShow: false },
      componentTypeList: [
        //组件类型数据
        {
          title: this.$t('term.report.basicwidget'),
          type: 'form',
          dataList: []
        },
        {
          title: this.$t('term.framework.extendwidget'),
          type: 'control',
          dataList: []
        },
        {
          title: this.$t('term.framework.customitem'),
          type: 'custom',
          dataList: []
        }
      ],
      labelNameConfig: {}, //组件类型和组件名称相对于的配置数据
      actionAuthorityConfig: { conditionList: [], filterList: [], showList: [], isValueList: [] }, //配置联动时每个操作对应的组件权限
      list: [],
      isReTurn: false, //跳转
      returnModel1: false, //导入导出保存判断
      referenceModel: false, //引用流程模态框
      importUrl: BASEURLPREFIX + '/api/binary/form/version/import?uuid=',
      isPrevview: false,
      prewviewWidth: 'large',
      exportModel: '',
      isChange: {
        name: false,
        sheet: false
      },
      referenceCount: 0, //引用列表个数
      showActiveTooltip: false,
      isActive: 1, //表单激活，不会涉及到表单版本激活
      isFormedit: false,
      account: 0,
      loadingShow: false,
      cardData: {
        cardList: [],
        currentPage: 1,
        pageSize: 9,
        pageCount: 1
      }
    };
  },
  created() {
    _this = this;
    this.$route.query.isrequirecheck = true;
    if (this.$route.query.name) {
      this.initFormName = this.$route.query.name;
      this.formName = this.$route.query.name;
    }
    this.formUuid = this.$route.query.uuid || null;
    this.isnew = this.$route.query.isnew || false;
    this.currentVersion.uuid = this.$route.query.currentVersionUuid || null;
    this.getFormByVersionUuid(this.currentVersion.uuid);
    this.getComponentList();
  },
  mounted() {
    document.addEventListener('click', this.getSheetchange);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.getSheetchange);
  },
  methods: {
    changeVersion: function(uuid, text) {
      //改变版本时触发事件
      let _this = this;
      if (JSON.stringify(this.content) == JSON.stringify(this.$refs.TsSheet.getSheetdata() || {}) && this.initFormName == this.formName) {
        //数据没有变化时直接导出
        this.currentVersion.uuid = uuid;
        this.currentVersion.text = text;
        this.getFormByVersionUuid(this.currentVersion.uuid);
      } else {
        //验证不通过时
        this.$createDialog({
          title: this.$t('page.tip'),
          content: this.$t('dialog.content.formsavetip'),
          cancelText: this.$t('page.cancel'),
          okText: this.$t('page.save'),
          'on-ok': vnode => {
            vnode.isShow = false;
            needToChangeVersion.uuid = uuid;
            needToChangeVersion.text = text;
            _this.saveForm('changeVersion');
          },
          'on-cancel': vnode => {
            vnode.isShow = false;
            this.currentVersion.uuid = uuid;
            this.currentVersion.text = text;
            this.getFormByVersionUuid(this.currentVersion.uuid);
          }
        });
      }
    },
    drop: function(eve, type) {
      eve.dataTransfer.clearData();
    },
    dropstart: function(eve, item) {
      eve.dataTransfer.setData('item', JSON.stringify(item));
    },
    handleActiveFormVersion(uuid) {
      // 处理激活表单版本
      let _this = this;
      if (this.showActiveTooltip) {
        return;
      }
      this.$api.framework.form
        .setFormActionVersion({ uuid: _this.formUuid, versionUuid: uuid })
        .then(res => {
          if (res.Status == 'OK') {
            _this.activeVersionUuid = uuid;
            _this.versionList.forEach(item => {
              item.isActive === 1 && (item.isActive = 0);
              item.uuid == uuid && (item.isActive = 1);
            });
            _this.$Message.success(this.$t('message.executesuccess'));
            _this.$forceUpdate();
          }
        })
        .catch(error => {
          this.$Notice.error({ title: error.data.Message });
        });
    },
    activeFormVersion: function(uuid) {
      //激活表单版本
      this.handleSaveForm(uuid);
    },
    previewForm: function() {
      //把预览表单的数据和中间表格数据分开，避免数据互相影响
      //预览表单
      //   this.previewData =this.$refs.TsSheet.getSheetdata();
      this.previewData = JSON.parse(JSON.stringify(this.$refs.TsSheet.getSheetdata()));
      if (this.previewData.controllerList && this.previewData.controllerList.length > 0) {
        let isnext = true;
        if (!isnext) {
          this.$Notice.warning({ title: this.$t('term.framework.widgetinfouncomplete') });
          return;
        }
      }
      //如果表单设置了组件联动
      if (this.previewData.globalSetting && this.previewData.globalSetting.ruleList && this.previewData.globalSetting.ruleList.length > 0) {
        let isnext = true;
        this.previewData.globalSetting.ruleList.forEach(rule => {
          if (rule.conditionList && rule.conditionList.length > 0) {
            //条件没填写完成
            rule.conditionList.forEach(con => {
              if (con.list && con.list.length > 0) {
                con.list.forEach(li => {
                  if (!li.component || !li.expression) {
                    isnext = false;
                  }
                });
              }
            });
          }
          if (rule.actionList && rule.actionList.length > 0) {
            //动作没填写完成
            rule.actionList.forEach(action => {
              if (!action.action) {
                isnext = false;
              } else if (action.type == 'component' && !action.component) {
                isnext = false;
              } else if (action.type == 'row' && (!action.value || action.value.length < 0)) {
                isnext = false;
              }
            });
          }
        });
        if (!isnext) {
          this.$Notice.warning({ title: this.$t('term.framework.linkagewidgetuncomplete') });
          return;
        }
      }
      this.isPrevview = true;
    },
    async handleSaveForm(uuid) {
      // 检查当前表单是否有被进行中的工单引用，若被引用，需要弹窗二次确认
      let _this = this;
      let isTip = await this.$frameworkUtils.isDependency(_this.formUuid, 'form');
      if (isTip) {
        this.$createDialog({
          title: this.$t('page.tip'),
          content: this.$t('dialog.content.updateformflowtip'),
          'on-ok': vnode => {
            if (uuid) {
              _this.handleActiveFormVersion(uuid); // 处理激活表单版本
            } else {
              _this.saveForm(); // 保存表单
            }
            vnode.isShow = false;
          },
          'on-close': vnode => {
            // 取消之后，激活状态变成修改之前状态
            if (uuid) {
              this.versionList &&
                this.versionList.forEach(item => {
                  if (item && item.uuid == uuid) {
                    item.isActive = item.isActive ? 0 : 1;
                  }
                });
            }
          }
        });
      } else {
        if (uuid) {
          _this.handleActiveFormVersion(uuid); // 处理激活表单版本
        } else {
          _this.saveForm(); // 保存表单
        }
      }
    },
    async saveForm(type) {
      //type 值为saveother(另存为)  exportFile(导出的保存)  upload(导入数据)
      var _this = this;
      if (!_this.$refs.TsSheet.validComponent()) {
        return false;
      }

      _this.sheetData = _this.$refs.TsSheet.getSheetdata() || {};
      let data = {
        name: _this.formName,
        isActive: _this.isActive,
        formConfig: _this.sheetData || {},
        uuid: _this.formUuid || null
      };
      type != 'saveother' && (data.currentVersionUuid = _this.currentVersion.uuid);
      if (_this.formName != '' && this.$utils.nameRegularValid(_this.formName)) {
        await this.$api.framework.form
          .saveForm(data)
          .then(res => {
            if (res.Status == 'OK') {
              _this.initFormName = _this.formName;
              _this.content = _this.$utils.deepClone(_this.sheetData || {});
              if (type == 'saveother' || !(_this.formUuid && _this.currentVersion.uuid)) {
                //_this.formUuid为空代表从其他地方跳过来进行新增
                _this.currentVersion.uuid = res.Return.currentVersionUuid;
                _this.currentVersion.text = res.Return.currentVersion;
                _this.versionList.unshift({
                  isActive: _this.formUuid && _this.currentVersion.uuid ? 1 : 0,
                  uuid: res.Return.currentVersionUuid,
                  version: res.Return.currentVersion
                });
                _this.formUuid = res.Return.uuid;
              } else if (type == 'exportFile') {
                //保存之后导出
                _this.okExportFile();
              } else if (type == 'upload') {
                //保存之后再导入
                // _this.$refs.uploadDialog.$refs.upload.handleClick();
              } else if (type == 'changeVersion') {
                //改变版本
                this.currentVersion.uuid = needToChangeVersion.uuid;
                this.currentVersion.text = needToChangeVersion.text;
                this.getFormByVersionUuid(this.currentVersion.uuid);
              }

              this.isReTurn = true;
              this.$Message.success(this.$t('message.savesuccess'));
              if (res.Return.uuid != this.$route.query.uuid || res.Return.currentVersionUuid != this.$route.query.currentVersionUuid) {
                this.$router.replace({
                  path: '/form-edit',
                  query: {
                    uuid: res.Return.uuid,
                    currentVersionUuid: res.Return.currentVersionUuid
                  }
                });
              }
            }
          })
          .catch(error => {
            this.$Notice.error({
              title: error.data.Message
            });
            this.isReTurn = false;
          });
      } else {
        this.$Notice.error({
          title: this.$t('page.formname'),
          desc: this.$t('form.validate.requiredname')
        });
        this.$nextTick(() => {
          this.$refs.formNameInput.focus();
        });
      }
    },
    getFormByVersionUuid: function(val) {
      //获取表单指定版本的数据，渲染表单
      let _this = this;
      _this.isLoaded = false;
      //先关闭编辑侧滑窗
      this.$set(this, 'isFormedit', false);
      this.showActiveTooltip = false;
      if (!_this.currentVersion.uuid || _this.isnew) {
        //缺少版本uuid或者新建过来的，不带任何数据
        _this.content = {};
        _this.sheetData = {};
        _this.isLoaded = true;
        return false;
      }
      let data = { uuid: _this.formUuid, currentVersionUuid: val };
      this.$api.framework.form
        .getFormByVersionUuid(data)
        .then(res => {
          if (res.Status == 'OK') {
            // _this.content = this.initConfig(JSON.parse(res.Return.formConfig || '{}'));
            _this.content = res.Return.formConfig || {};
            let sheetData = res.Return.formConfig || {};
            _this.isLoaded = true;
            _this.formName ? '' : (_this.initFormName = _this.formName = res.Return.name);
            _this.versionList = res.Return.versionList;
            _this.isActive = res.Return.isActive;
            _this.activeVersionUuid = getActiveVersionUuid(res.Return.versionList);
            _this.referenceCount = res.Return.referenceCount;
            //获取版本的text值
            for (let iv = 0; iv < _this.versionList.length; iv++) {
              if (_this.versionList[iv].uuid == val) {
                _this.currentVersion.text = _this.versionList[iv].version;
              }
            }
            _this.sheetData = _this.removeemptyRule(sheetData);
            _this.$forceUpdate();
          } else {
            _this.content = {};
            _this.sheetData = {};
            _this.isLoaded = true;
          }
          if (_this.sheetData.globalSetting && _this.sheetData.globalSetting.ruleList) {
            _this.account = _this.sheetData.globalSetting.ruleList.length || 0;
          }
        })
        .catch(error => {
          _this.content = {};
          _this.sheetData = {};
          _this.isLoaded = true;
          _this.$Message.error(this.$t('term.framework.getformdatafail'));
          _this.account = 0;
        });
    },
    initConfig(formConfig) {
      //重新处理每个组件的config属性，组件后期存属性的扩展，已经存在的组件可能没有对应的属性值，所有在每次初始化数据的时候把新的属性塞进去
      if (formConfig && formConfig.controllerList && formConfig.controllerList.length) {
        formConfig.controllerList.forEach(item => {
          let config = initComponentConfig[item.handler];
          config && (item.config = this.$utils.mergeObj(config, item.config));
        });
      }
      return formConfig;
    },
    delVersionModal: function(uuid, version) {
      //删除的模态框的处理
      this.delVersion.uuid = uuid;
      this.delVersion.version = version;
      this.delVersion.delVersionIsShow = true;
    },
    delFormVersion: function() {
      //删除表单对应的版本
      let _this = this;
      _this.$api.framework.form
        .delFormVersion({ uuid: _this.delVersion.uuid })
        .then(res => {
          if (res.Status == 'OK') {
            _this.delVersion.uuid == _this.currentVersion.uuid && (_this.currentVersion.uuid = _this.activeVersionUuid) && _this.getFormByVersionUuid(_this.activeVersionUuid);
            if (_this.versionList.length > 0) {
              //删除对应的版本数据
              for (let i = 0; i < _this.versionList.length; i++) {
                if (_this.versionList[i].uuid == _this.delVersion.uuid) {
                  _this.$delete(_this.versionList, i);
                }
              }
            }
            _this.$Message.success(this.$t('message.deletesuccess'));
          } else {
            _this.$Notice.error({ title: res.Message });
          }
          _this.delVersion = { uuid: '', version: '', delVersionIsShow: false };
        })
        .catch(error => {
          _this.$Notice.error({ title: error.data.Message });
        });
    },
    quoteList(page) {
      //引用列表
      let _this = this;
      let data = {
        calleeType: 'form',
        uuid: this.formUuid,
        currentPage: page || this.currentPage
      };
      _this.referenceModel = true;
      _this.loadingShow = true;
      _this.$api.framework.form.referenceData(data).then(res => {
        if (res.Status == 'OK') {
          let dataConfig = res.Return;
          Object.assign(_this.cardData, dataConfig);
          _this.$set(_this.cardData, 'cardList', dataConfig.list);
          _this.loadingShow = false;
        }
      });
    },
    updateContent: function(list) {
      if (JSON.stringify(list) != JSON.stringify(this.content)) {
        this.content = this.$utils.deepClone(list);
      }
    },
    toPrevpath: function() {
      //返回到表单列表
      this.$router.push({
        path: this.prevPath.router
      });
    },
    cancelReturn1: function() {
      this.returnModel1 = false;
    },
    okAddReturn1: function() {
      //保存之后跳转到列表页面
      this.saveForm();
      this.returnModel1 = false;
    },
    beforeUpload(e) {
      let _this = this;
      if (_this.$refs.TsSheet.validComponent() && _this.formName != '' && this.$utils.nameRegularValid(_this.formName)) {
        // if (false) {
        //当验证通过时 当没有改动时直接跳转页面
        if (JSON.stringify(this.content) == JSON.stringify(this.$refs.TsSheet.getSheetdata() || {}) && this.initFormName == this.formName) {
          //数据没有变化时直接导出
          return true;
        } else {
          //数据有变化时，先保存在导出
          _this.saveForm('upload'); //保存之后再导入
          return true;
        }
      } else {
        return new Promise(resolve => {
          this.$createDialog({
            title: this.$t('page.tip'),
            content: this.$t('message.framework.formimpottip'),
            cancelText: this.$t('page.cancel'),
            okText: this.$t('page.abandon'),
            'on-ok': vnode => {
              vnode.isShow = false;
              resolve(true);
            }
          });
        });
      }
    },
    exportFile: function() {
      //导出逻辑判断
      let _this = this;
      if (_this.$refs.TsSheet.validComponent() && _this.formName != '' && this.$utils.nameRegularValid(_this.formName)) {
        //当验证通过时 当没有改动时直接跳转页面
        if (JSON.stringify(this.content) == JSON.stringify(this.$refs.TsSheet.getSheetdata() || {}) && this.initFormName == this.formName) {
          //数据没有变化时直接导出
          _this.okExportFile();
        } else {
          //数据有变化时，先保存在导出
          _this.saveForm('exportFile');
        }
      } else {
        //验证不通过时
        this.$createDialog({
          title: this.$t('page.tip'),
          content: this.$t('message.framework.exportformtip'),
          cancelText: this.$t('page.cancel'),
          okText: this.$t('page.abandon'),
          'on-ok': vnode => {
            vnode.isShow = false;
            _this.okExportFile();
          }
        });
      }
    },
    okExportFile: function() {
      //导出具体的数据
      this.$https
        .get('/api/binary/form/version/export?uuid=' + this.formUuid + '&formVersionUuid=' + this.currentVersion.uuid, { responseType: 'blob' })
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
          this.$Notice.error({ title: this.$t('term.framework.errorinfo'), desc: error.data.Message });
        });
      // let data = {};
      // let url = '/api/binary/form/version/export?uuid=' + this.formUuid + '&formVersionUuid=' + this.currentVersion.uuid;
      // this.$utils.download(this, url, data, 'get');
    },
    uploadSuccess(data) {
      if (data.Status === 'OK') {
        if (this.currentVersion.uuid == data.Return.versionUuid) {
          //覆盖已有版本，就直接刷新
          this.getFormByVersionUuid(this.currentVersion.uuid);
          this.getComponentList();
        } else {
          //新建版本
          this.$router.push({
            path: '/form-edit',
            query: {
              uuid: this.$route.query.uuid,
              currentVersionUuid: data.Return.versionUuid
            }
          });
        }
      }
    },
    view: function(val) {
      this.formData = val;
    },
    getSheetchange: function() {
      if (this.content && this.$refs.TsSheet) {
        if (JSON.stringify(this.content) != JSON.stringify(this.$refs.TsSheet.getSheetdata() || {})) {
          this.isChange.sheet = true;
        } else {
          this.isChange.sheet = false;
        }
      }
    },
    haveChangeData() {
      if (this.$refs.TsSheet && JSON.stringify(this.content) == JSON.stringify(this.$refs.TsSheet.getSheetdata() || {}) && this.initFormName == this.formName) {
        //数据没有变化时直接导出
        this.showActiveTooltip = false;
      } else {
        this.showActiveTooltip = true;
      }
      return this.showActiveTooltip;
    },
    removeemptyRule(sheetData) {
      if (sheetData.controllerList && sheetData.controllerList.length > 0) {
        sheetData.controllerList.forEach(c => {
          if (c.config && c.config.ruleList && c.config.ruleList.length > 0) {
            let rule = c.config.ruleList;
            rule.forEach((r, rindex) => {
              if (!r.conditionConfig.type) {
                rule.splice(rindex, 1);
              } else {
                let isArray = typeof r.conditionConfig.value == 'object';
                if (isArray && r.conditionConfig.value.length == 0) {
                  rule.splice(rindex, 1);
                } else if (!r.conditionConfig.value && r.conditionConfig.expression != 'empty' && r.conditionConfig.expression != 'non-empty') {
                  rule.splice(rindex, 1);
                } else {
                  if (r.actionList && r.actionList.length > 0) {
                    let action = r.actionList;
                    action.forEach((a, aindex) => {
                      if (!a.value || a.value.length == 0) {
                        action.splice(aindex, 1);
                      }
                    });
                    if (action.length == 0) {
                      rule.splice(rindex, 1);
                    }
                  } else {
                    rule.splice(rindex, 1);
                  }
                }
              }
            });
          }
        });
      }
      return sheetData;
    },
    showFormedit() {
      this.isFormedit = !this.isFormedit;
    },
    getFormrule(count) {
      this.account = count || 0;
    },
    getComponentList() {
      let _this = this;
      let list = { formList: [], controlList: [], customList: [] };
      let extendConfig = { formpriority: { addMultiple: 'false', isFooter: true } };
      this.$api.framework.form.getHandlerList().then(function(res) {
        if (res.Status == 'OK') {
          res.Return.forEach(item => {
            list[item.type + 'List'].push(Object.assign(item, extendConfig[item.handler] || {}));
            _this.labelNameConfig[item.handler] = item.name; //获取组件的name值
            item.isConditionable && _this.actionAuthorityConfig.conditionList.push(item.handler);
            item.isFilterable && _this.actionAuthorityConfig.filterList.push(item.handler);
            if (!item.isFilterable && item.handler == 'formpriority') {
              // 解决修改优先级组件，不能作为过滤条件的问题
              _this.actionAuthorityConfig.filterList.push(item.handler);
            }
            item.isShowable && _this.actionAuthorityConfig.showList.push(item.handler);
            item.isValueable && _this.actionAuthorityConfig.isValueList.push(item.handler);
          });
          _this.componentTypeList.forEach(a => {
            // a.dataList = a.dataList.concat(list[a.type + 'List'] || []);
            a.dataList = list[a.type + 'List'] || [];
          });
        }
      });
    }
  },
  watch: {
    formName(val) {
      if (val != this.initFormName) {
        this.isChange.name = true;
      } else {
        this.isChange.name = false;
      }
    }
  },
  beforeRouteLeave(to, from, next, url) {
    let data = this.$refs.TsSheet.getSheetdata() || {};
    let isSame = this.$utils.isSame(this.content, data);
    if (isSame && this.initFormName == this.formName) {
      //当没有改动时直接跳转页面
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(
        this,
        {
          save: {
            fn: async vnode => {
              return await _this.saveForm();
            }
          }
        },
        to,
        from,
        next,
        url
      );
    }
  }
};

function getActiveVersionUuid(versionList) {
  //获取激活版本的uuid
  if (versionList.length > 0) {
    for (let i = 0; i < versionList.length; i++) {
      if (versionList[i].isActive == 1) {
        return versionList[i].uuid;
      }
    }
  }
  return '';
}
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.form-itemul {
  //overflow: auto;
  .clearfix();
  display: block;
  .form-itemli {
    padding: 5px 5px;
    display: block;
    text-align: center;
    cursor: move;
    width: 50%;
    float: left;
    > .div-li-contain {
      padding: 5px 0;
      user-select: none;
      text-align: center;
      // &:hover {
      //   color: @primary-color;
      // }
    }
    .item-icon {
      font-size: 24px;
      height: 30px;
      line-height: 30px;
      &::before {
        font-weight: normal;
      }
    }
    .item-text {
      height: 25px;
      //line-height: 25px;
      font-size: 12px;
    }
  }
}
.formEdit {
  overflow: hidden !important;
}
.formEdit .col-left-contain {
  height: calc(100% - 2px);
  overflow: auto;
  padding: 0 14px;
  width: 184px;
  position: absolute;
  left: 0px;
  border-right: 1px solid;
}
.formEdit .col-left-title {
  height: 50px;
  line-height: 50px;
}
.formEdit .input-contain {
  display: inline-block;
  line-height: 30px;
  padding: 0px 15px;
  padding-left: 0;
  > .tsfont-edit {
    padding-left: 5px;
    cursor: pointer;
  }
}
.version-li {
  padding-right: 130px !important;
  position: relative;
  .span-activeText {
    position: absolute;
    right: 40px;
    padding: 0 5px;
    &.active {
      color: @primary-color;
    }
  }
  .ivu-switch {
    visibility: hidden;
    margin-left: 5px;
  }
  .tsfont-trash-o {
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
    padding: 0 5px;
    visibility: hidden;
  }
  &:hover {
    .tsfont-trash-o {
      visibility: visible;
    }
    .ivu-switch {
      visibility: visible;
    }
  }
}
.ivu-dropdown-rel {
  cursor: pointer;
}

.formEdit {
  .referenceCount.disable {
    color: #bfbfbf;
    cursor: not-allowed;
  }
  .formedit-content {
    padding-left: 185px;
  }
  /deep/ .tscontain-container .tscontain-body {
    height: calc(100vh - 50px - 50px);
  }
}
</style>
