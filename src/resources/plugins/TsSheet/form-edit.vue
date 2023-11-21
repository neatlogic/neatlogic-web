<template>
  <div>
    <TsContain :enableCollapse="true" :siderWidth="260">
      <template v-if="formDataQueue.length <=1" v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/form-overview')">{{ $getFromPage($t('router.framework.formmanage')) }}</span>
      </template>
      <template v-slot:topLeft>
        <TsRow v-if="formDataQueue.length <=1">
          <Col span="12">
            <TsFormInput
              ref="formName"
              v-model="formData.name"
              :placeholder="$t('form.placeholder.name')"
              maxlength="30"
              border="border"
              :validateList="nameValidateList"
            ></TsFormInput>
          </Col>
          <Col span="12">
            <div v-if="currentVersion.uuid">
              <Dropdown trigger="hover" placement="bottom-start" style="line-height: 30px;cursor: pointer;">
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
                      <i-switch
                        v-model="item.isActive"
                        :disabled="item.isActive === 1 || (currentVersion.uuid == item.uuid && currentVersion.uuid && showActiveTooltip) ? true : false"
                        :true-value="1"
                        :false-value="0"
                        class="label-right"
                        :title="currentVersion.uuid == item.uuid && currentVersion.uuid && showActiveTooltip ? $t('message.framework.activedversiontip') : $t('term.framework.activedversion')"
                        @click.native.stop
                        @on-change="activeFormVersion(item.uuid)"
                      />
                    </span>
                    <span
                      v-if="item.isActive !== 1"
                      class="tsfont-trash-o"
                      :title="$t('term.autoexec.deletedversion')"
                      @click.stop="delVersionModal(item.uuid, item.version)"
                    ></span>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </Col>
        </TsRow>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div v-if="formDataQueue.length <=1" class="action-item">
            <Poptip
              v-model="isShowValidList"
              word-wrap
              width="350"
              :title="$t('page.exception')"
              transfer
              :disabled="$utils.isEmpty(errorData)"
            >
              <span class="tsfont-xitongpeizhi" @click="formValid()">{{ $t('page.validate') }}</span>
              <div slot="content">
                <div v-for="(key) of Object.keys(errorData)" :key="key">
                  <div
                    v-for="(item, index) in errorData[key]"
                    :key="index"
                    class="ovewflow text-action pb-sm valid-list"
                    @click="jumpToItem(key, item)"
                  >
                    {{ item.error }}
                    <span class="text-error tsfont-close-o valid-icon"></span>
                  </div>
                </div>
              </div>
            </Poptip>
          </div>
          <div class="action-item text-action tsfont-lightning" @click="openReactionDialog()">{{ $t('term.framework.rowreaction') }}</div>
          <template v-if="formDataQueue.length <=1">
            <div class="action-item text-action tsfont-width" @click="editFormWidth()">{{ $t('term.framework.formwidth') }}</div>
            <div class="action-item text-action tsfont-scene" @click="openScene()">{{ $t('page.scene') }}</div>
            <div class="action-item text-action tsfont-circulation-s" @click="previewForm()">{{ $t('page.preview') }}</div>
            <div class="action-item">
              <Dropdown trigger="click">
                <span class="tsfont-option-horizontal click-btn"></span>
                <DropdownMenu slot="list" class="dropdown">
                  <DropdownItem v-if="currentVersion.uuid && referenceCount > 0" @click.native.stop="quoteList(1)">
                    <div class="tsfont-formstaticlist referenceCount">{{ $t('page.referencelist') }}[{{ referenceCount }}]</div>
                  </DropdownItem>
                  <DropdownItem v-else-if="currentVersion.uuid">
                    <div class="action-item tsfont-formstaticlist referenceCount disable">{{ $t('page.referencelist') }}</div>
                  </DropdownItem>
                  <DropdownItem @click.native="$refs.uploadDialog.showDialog">
                    <span class="tsfont-import">{{ $t('page.import') }}</span>
                    <UploadDialog
                      ref="uploadDialog"
                      :beforeUpload="beforeUpload"
                      :actionUrl="importUrl + (formUuid || null)"
                      :formatList="formatList"
                      @on-success="uploadSuccess"
                    />
                  </DropdownItem>
                  <DropdownItem v-if="currentVersion.uuid" @click.native.stop="exportFile">
                    <div class="tsfont-export">{{ $t('page.export') }}</div>
                  </DropdownItem>
                  <DropdownItem>
                    <div
                      :title="showActiveTooltip ? $t('message.framework.activedversiontip') : ''"
                      class="action-item tsfont-check-square-o"
                      :class="activeVersionUuid == currentVersion.uuid && currentVersion.uuid ? 'disable' : ''"
                      @click="activeFormVersion(currentVersion.uuid)"
                      @mouseenter="haveChangeData"
                    >{{ $t('page.enable') }}</div>
                  </DropdownItem>
                  <DropdownItem>
                    <span class="action-item tsfont-trash-o" :class="activeVersionUuid == currentVersion.uuid && currentVersion.uuid ? 'disable' : ''" @click="delVersionModal(currentVersion.uuid, currentVersion.text)">{{ $t('page.delete') }}</span>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div class="action-item">
              <Button type="primary" ghost @click="saveForm('saveother')">{{ $t('term.framework.saveothernewversion') }}</Button>
            </div>
            <div class="action-item last">
              <Button type="primary" @click="handleSaveForm()">{{ $t('page.save') }}</Button>
            </div>
          </template>
          <template v-else>
            <div class="action-item last">
              <Button type="primary" @click="backPreFormData(formDataQueue[formDataQueue.length-2])">确认</Button>
            </div>
          </template>
        </div>
      </template>
      <template v-slot:sider>
        <div class="formitem-container pr-sm">
          <Collapse v-model="formGroup" simple>
            <Panel v-for="category in formItemCategoryList" :key="category.value" :name="category.value">
              {{ category.text }}
              <div slot="content">
                <TsRow :gutter="8">
                  <Col
                    v-for="(item, index) in getFormCategoryList(category.value)"
                    :key="index"
                    :span="8"
                    class="form-item mt-md"
                  >
                    <div
                      draggable="true"
                      @ondrop="
                        event => {
                          drop(event, item);
                        }
                      "
                      @dragend="
                        event => {
                          dragEnd(event);
                        }
                      "
                      @dragstart="
                        event => {
                          dragStart(event, item);
                        }
                      "
                    >
                      <div :class="item.icon" style="font-size:24px"></div>
                      <div class="item-text overflow" :title="item.label">{{ item.label }}</div>
                    </div>
                  </Col>
                </TsRow>
              </div>
            </Panel>
            <Panel name="custom">
              {{ $t('term.framework.customitem') }}
              <div slot="content">
                <TsRow :gutter="8">
                  <Col :span="8" class="form-item mt-md custom-formitem">
                    <div class="text-href" @click="addCustomItem()">
                      <div class="tsfont-plus" style="font-size:24px"></div>
                      <div class="item-text">{{ $t('dialog.title.addtarget',{'target':$t('page.component')}) }}</div>
                    </div>
                  </Col>
                  <Col
                    v-for="(item, index) in customItemList"
                    :key="index"
                    :span="8"
                    class="form-item mt-md custom-formitem"
                  >
                    <span style="right:15px;" class="text-action customitem-btn cursor tsfont-edit" @click.stop="editCustomItem(item)"></span>
                    <span style="right:0px;" class="text-action customitem-btn cursor tsfont-trash-o" @click.stop="removeCustomItem(item)"></span>
                    <div
                      draggable="true"
                      @ondrop="
                        event => {
                          drop(event, item);
                        }
                      "
                      @dragend="
                        event => {
                          dragEnd(event);
                        }
                      "
                      @dragstart="
                        event => {
                          dragStart(event, item);
                        }
                      "
                    >
                      <div :class="item.icon" style="font-size:24px"></div>
                      <div class="item-text overflow" :title="item.label">{{ item.label }}</div>
                    </div>
                  </Col>
                </TsRow>
              </div>
            </Panel>
          </Collapse>
        </div>
      </template>
      <template v-slot:content>
        <div v-if="isFormLoaded" style="position:relative">
          <div v-if="formDataQueue && formDataQueue.length > 1" class="pb-sm">
            <Breadcrumb separator="<span class='tsfont-arrow-right'></span>">
              <BreadcrumbItem
                v-for="(item,index) in formDataQueue"
                :key="index"
              ><span
                :class="index == formDataQueue.length - 2?'text-href':index != formDataQueue.length - 1?'text-tip':''"
                @click="backPreFormData(item,index)"
              >{{ item.label }}</span>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
          <TsSheet
            ref="sheet"
            v-model="formData.formConfig"
            @selectCell="selectCell"
            @removeComponent="removeComponent"
            @updateResize="updateResize"
          ></TsSheet>
          <FormItemConfig
            v-if="currentFormItem"
            :formItem="currentFormItem"
            :formItemList="cellFormItemList"
            :error="currentFormItemError"
            class="form-item-config bg-grey border-base-left"
            @close="currentFormItem = null"
            @editSubForm="editSubForm"
          ></FormItemConfig>
          <FormPreview v-if="isPreviewShow" :data="previewFormData" @close="closePreview"></FormPreview>
        </div>
      </template>
    </TsContain>
    <ReactionDialog
      v-if="isReactionShow"
      :reaction="formData.formConfig.reaction"
      :rowcount="formData.formConfig.lefterList.length"
      :formItemList="cellFormItemList"
      @close="closeReactionDialog"
    ></ReactionDialog>
    <CustomItemDialog v-if="isCustomItemDialogShow" :id="currentCustomItemId" @close="closeCustomItemDialog"></CustomItemDialog>
    <FormReferenceDialog v-if="referenceModel" :formUuid="formUuid" @close="referenceModel = false"></FormReferenceDialog>
    <TsDialog
      :isShow="isFormOldDialog"
      :title="$t('page.tip')"
      type="modal"
      :showCloseIcon="false"
      :hasFooter="false"
      maskClose
    >
      <template v-slot>
        <div>
          <div class="pb-sm">
            当前表单为旧数据，
            <span class="text-href" @click.stop="openOldForm">请点击查看</span>
          </div>
          <div class="text-href" @click="$back('/form-overview')">返回表单管理</div>
        </div>
      </template>
    </TsDialog>
    <FormWidthDialog v-if="isShowEditFormWidth" :formWidth="formData.formConfig.formWidth" @close="closeEditFormWidth"></FormWidthDialog>
    <FormSceneDialog
      v-if="isFormSceneDialog"
      :uuid="formUuid"
      :currentVersionUuid="currentVersion.uuid"
      :data="initData"
      :formConfig="$utils.deepClone(initFormConfig)"
      :sceneUuid="sceneUuid"
      @close="closeScene"
      @deleteScene="deleteScene"
      @updateDefaultSceneUuid="updateDefaultSceneUuid"
    ></FormSceneDialog>
  </div>
</template>
<script>
let needToChangeVersion = {};
import subformconfig from './subformconfig.vue';
import $frameworkUtils from '@/views/pages/framework/matrix/utils/utils';
import download from '@/resources/mixins/download.js';
import { FORMITEMS, FORMITEM_CATEGORY } from './form/formitem-list.js';

export default {
  name: '',
  components: {
    FormItemConfig: resolve => require(['./form-item-config.vue'], resolve),
    TsSheet: resolve => require(['./TsSheet.vue'], resolve),
    FormPreview: resolve => require(['./form-preview.vue'], resolve),
    ReactionDialog: resolve => require(['./form-row-reaction-dialog.vue'], resolve),
    CustomItemDialog: resolve => require(['./customitem-edit-dialog.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    FormReferenceDialog: resolve => require(['./form-reference-dialog.vue'], resolve),
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve),
    FormWidthDialog: resolve => require(['./form-width-dialog.vue'], resolve),
    FormSceneDialog: resolve => require(['./form-scene-dialog.vue'], resolve)
  },
  extends: subformconfig,
  mixins: [download],
  props: {},
  data() {
    return {
      initData: {},
      formItemList: FORMITEMS,
      formItemCategoryList: FORMITEM_CATEGORY,
      currentFormItem: null, //当前设置的表单组件
      formData: { formConfig: {} },
      isPreviewShow: false,
      errorData: {}, //异常信息
      isReactionShow: false,
      customItemList: [],
      isCustomItemDialogShow: false,
      currentCustomItemId: null,
      nameValidateList: [
        { name: 'required', message: ' ' },
        { name: 'name-special', message: ' ' },
        {
          name: 'searchUrl',
          url: 'api/rest/form/save',
          key: 'name',
          params: () => ({ uuid: this.formUuid }),
          message: ' ',
          validSearchUrl: (isValid, msg) => {
            if (isValid) {
              this.nameMsg = '';
            } else {
              this.nameMsg = this.$t('form.validate.repeat', {'target': this.$t('page.formname')});
            }
          }
        }
      ],
      nameMsg: '',
      isFormLoaded: false,
      versionList: [],
      currentVersion: { uuid: '', text: '' },
      activeVersionUuid: '', //激活版本uuid
      referenceCount: 0, //引用列表个数
      isActive: 1, //表单激活，不会涉及到表单版本激活
      isnew: false, //标志是否是新建的表单
      formUuid: null,
      showActiveTooltip: false,
      referenceModel: false,
      importUrl: BASEURLPREFIX + '/api/binary/form/version/import?uuid=',
      formatList: ['formversion'], //导入文件格式
      initFormName: '',
      initFormConfig: {},
      isFormOldDialog: false,
      isShowValidList: false,
      previewFormData: {}, //预览数据
      isShowEditFormWidth: false, //表单宽度设置
      formGroup: ['basic', 'layout', 'autoexec', 'cmdb', 'custom'],
      isFormSceneDialog: false,
      sceneUuid: null
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.name) {
      this.formData.name = this.$route.query.name;
    }
    this.formUuid = this.$route.query.uuid || null;
    this.isnew = this.$route.query.isnew || false;
    this.currentVersion.uuid = this.$route.query.currentVersionUuid || null;
    this.searchCustomItem();
    this.getFormByVersionUuid(this.currentVersion.uuid);
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
    beforeLeaveCompare(oldData) {
      // 离开当前页面，数据对比
      let newData = this.$refs.sheet.getFormConfig();
      return this.compareData(oldData, newData);
    },
    async beforeLeave() {
      //离开页面，二次弹窗，点击'确认按钮'，存储数据,
      return await this.saveForm('back');
    },
    compareData(oldData, newData) { //对比数据
      let isSame = true;
      let oldLefterList = this.$utils.deepClone(oldData.lefterList);
      let newLefterList = this.$utils.deepClone(newData.lefterList);
      let oldHeaderList = this.$utils.deepClone(oldData.headerList);
      let newHeaderList = this.$utils.deepClone(newData.headerList);
      if (this.initFormName != this.formData.name) {
        isSame = false;
      }
      if (isSame) {
        this.filterFormData(oldData);
        this.filterFormData(newData);
        isSame = this.$utils.isSame(oldData, newData);
      }
      if (isSame) {
        isSame = this.contrastError(oldLefterList, newLefterList, 'height');
      }
      if (isSame) {
        isSame = this.contrastError(oldHeaderList, newHeaderList, 'width');
      }
      return isSame;
    },
    filterFormData(data) { //删除不需要对比的数据
      this.$delete(data, 'lefterList');
      this.$delete(data, 'headerList');
      this.$delete(data, 'lcd');
      this.$delete(data, 'lcu');
      data.tableList.forEach(item => {
        if (item.component && item.component.formData && item.component.formData.formConfig) {
          this.filterFormData(item.component.formData.formConfig); 
        }
      });
    },
    contrastError(oldData, newData, type) {
      let isSame = true;
      let num = 10;//对比：误差高度在5px内可忽略
      if (oldData && newData) {
        for (let i = 0; i < newData.length; i++) {
          let oldNum = 0;
          if (oldData && oldData[i] && oldData[i][type]) {
            oldNum = oldData[i][type] + num; 
          }
          if (newData[i] && (newData[i][type] > oldNum)) { 
            isSame = false;
            break;
          }
        }
      }
      return isSame;
    },
    addCustomItem() {
      this.currentCustomItemId = null;
      this.isCustomItemDialogShow = true;
    },
    closeCustomItemDialog(needRefresh) {
      this.isCustomItemDialogShow = false;
      if (needRefresh) {
        this.searchCustomItem();
      }
    },
    editCustomItem(customItem) {
      this.currentCustomItemId = customItem.id;
      this.isCustomItemDialogShow = true;
    },
    removeCustomItem(customItem) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: customItem.label}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.form.deleteCustomItem(customItem.id).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchCustomItem();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    searchCustomItem() {
      this.customItemList = [];
      this.$api.framework.form.searchCustomItem({ isActive: 1 }).then(res => {
        if (res.Return.tbodyList && res.Return.tbodyList.length > 0) {
          res.Return.tbodyList.forEach(element => {
            let {
              id,
              name,
              icon,
              label,
              type = 'custom',
              name: handler,
              config: { hasValue },
              config: { config },
              config: { reaction }
            } = element;
            const formItem = { id, name, icon, label, type, handler, hasValue, config, reaction };
            this.customItemList.push(formItem);
          });
        }
      });
    },
    openReactionDialog() {
      this.isReactionShow = true;
    },
    closeReactionDialog(reactionConf) {
      this.isReactionShow = false;
      if (reactionConf) {
        this.$set(this.formData.formConfig, 'reaction', reactionConf);
      }
    },
    closePreview() {
      this.isPreviewShow = false;
    },
    async saveForm(type) {
      //type 值为saveother(另存为)  exportFile(导出的保存)  upload(导入数据)
      let isSuccess = false;
      if (this.valid()) {
        this.isShowValidList = false;
        let data = {
          name: this.formData.name,
          isActive: this.isActive,
          uuid: this.formUuid || null,
          formConfig: {}
        };
        let formConfig = this.$refs.sheet.getFormConfig();

        type != 'saveother' && (data.currentVersionUuid = this.currentVersion.uuid);
        // 场景uuid,name
        !formConfig.uuid && (formConfig.uuid = this.$utils.setUuid());
        !formConfig.name && (formConfig.name = this.$t('page.defaultscenario'));
        this.$set(formConfig, 'sceneList', this.initFormConfig.sceneList || []);
        this.$set(formConfig, 'defaultSceneUuid', this.initFormConfig.defaultSceneUuid || formConfig.uuid);
        if (type === 'saveother') {
          this.$set(formConfig, 'uuid', this.$utils.setUuid());
          formConfig.sceneList.forEach(item => {
            this.$set(item, 'uuid', this.$utils.setUuid());
          });
        }
        formConfig.sceneList.forEach(i => {
          i.tableList.forEach(t => {
            if (t.component) {
              let findItem = formConfig.tableList.find(s => s.component && s.component.uuid === t.component.uuid);
              if (!findItem) {
                this.$delete(t, 'component');
              }
            }
          });
        });
        this.$set(data, 'formConfig', formConfig);
        await this.$api.framework.form.saveForm(data).then(res => {
          if (res.Status == 'OK') {
            isSuccess = true;
            this.initFormName = this.formData.name;
            this.initFormConfig = this.$utils.deepClone(formConfig);
            if (type == 'saveother' || !(this.formUuid && this.currentVersion.uuid)) {
              //this.formUuid为空代表从其他地方跳过来进行新增
              this.currentVersion.uuid = res.Return.currentVersionUuid;
              this.currentVersion.text = res.Return.currentVersion;
              this.versionList.unshift({
                isActive: this.formUuid && this.currentVersion.uuid ? 1 : 0,
                uuid: res.Return.currentVersionUuid,
                version: res.Return.currentVersion
              });
              this.formUuid = res.Return.uuid;
            } else if (type == 'exportFile') {
              //保存之后导出
              this.okExportFile();
            } else if (type == 'upload') {
              //保存之后再导入
              // _this.$refs.uploadDialog.$refs.upload.handleClick();
            } else if (type == 'changeVersion') {
              //改变版本
              this.currentVersion.uuid = needToChangeVersion.uuid;
              this.currentVersion.text = needToChangeVersion.text;
              this.getFormByVersionUuid(this.currentVersion.uuid);
            }
            this.$addWatchData(formConfig);
            this.$Message.success(this.$t('message.savesuccess'));
            if (type != 'back' && ((res.Return.uuid != this.$route.query.uuid) || (res.Return.currentVersionUuid != this.$route.query.currentVersionUuid))) {
              this.$router.replace({
                path: '/form-edit',
                query: {
                  uuid: res.Return.uuid,
                  currentVersionUuid: res.Return.currentVersionUuid
                }
              });
            }
          }
        });
      } else if (!this.$utils.isEmpty(this.errorData)) {
        this.isShowValidList = true;
      }
      return isSuccess;
    },
    previewForm() {
      const sheet = this.$refs['sheet'];
      const data = sheet.getFormConfig();
      this.previewFormData = data;
      this.isPreviewShow = true;
    },
    selectCell(cell, component) {
      if (!component) {
        component = cell.component;
      }
      if (component) {
        if (this.currentFormItem != component) {
          //重置组件，刷新数据
          this.currentFormItem = null;
          this.$nextTick(() => {
            this.currentFormItem = component;
          });
        }
      } else {
        this.currentFormItem = null;
      }
    },
    removeComponent(uuid) {
      if (this.currentFormItem && this.currentFormItem.uuid === uuid) {
        this.currentFormItem = null;
      }
    },
    dragStart(event, item) {
      event.dataTransfer.setData('item', JSON.stringify(item));
    },
    dragEnd(event) {
      event.dataTransfer.clearData();
    },
    deleteCell(row, col) {
      if (row || col) {
        for (let i = this.components.length - 1; i >= 0; i--) {
          const c = this.components[i];
          if ((row == null || c.row === row) && (col == null || c.col === col)) {
            this.components.splice(i, 1);
          }
        }
      }
    },
    getFormByVersionUuid(val) {
      this.showActiveTooltip = false;
      this.isFormLoaded = false;
      this.isFormOldDialog = false;
      if (!this.currentVersion.uuid || this.isnew) {
        //缺少版本uuid或者新建过来的，不带任何数据
        this.currentFormItem = null;
        const formConfig = {};
        this.$set(this.formData, 'formConfig', formConfig);
        this.formDataQueue = [{
          ...this.formData,
          label: this.formData.name
        }];
        this.isFormLoaded = true;
        this.$addWatchData(formConfig);
        return false;
      }
      let data = {
        uuid: this.formUuid,
        currentVersionUuid: val
      };
      this.$api.framework.form
        .getFormByVersionUuid(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.initData = res.Return;
            this.formUuid = res.Return.uuid;
            this.initFormName = res.Return.name || '';
            this.referenceCount = res.Return.referenceCount;
            this.isActive = res.Return.isActive;
            this.versionList = res.Return.versionList || [];
            let formConfig = res.Return.formConfig || {};
            this.sceneUuid = formConfig.uuid;
            this.$set(this.formData, 'name', res.Return.name);
            if (this.versionList.length > 0) {
              this.versionList.forEach(item => {
                if (item.uuid == val) {
                  this.currentVersion.text = item.version;
                }
              });
              let findActiveVersion = this.versionList.find(v => v.isActive);
              this.activeVersionUuid = findActiveVersion.uuid || '';
            }
            if (!formConfig._type || formConfig._type != 'new') {
              this.isFormOldDialog = true;
              return;
            }

            this.$set(this.formData, 'formConfig', formConfig);
            this.initFormConfig = this.$utils.deepClone(formConfig);
            this.formDataQueue = [{
              ...this.formData,
              label: this.formData.name
            }];
            this.currentFormData = {
              ...this.formData
            };
            this.$addWatchData(this.initFormConfig);
          }
        })
        .finally(() => {
          this.isFormLoaded = true;
        });
    },
    openOldForm() {
      window.open(HOME + '/framework.html#/form-edit-old?uuid=' + this.formUuid + '&currentVersionUuid=' + this.currentVersion.uuid, '_blank');
    },
    changeVersion(uuid, text) {
      //改变版本时触发事件
      let formConfig = this.$refs.sheet.getFormConfig();
      this.currentFormItem = null;
      if (this.compareData(this.initFormConfig, formConfig)) {
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
            this.saveForm('changeVersion');
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
    haveChangeData() {
      let formConfig = this.$refs.sheet ? this.$refs.sheet.getFormConfig() : {};
      if (this.compareData(this.initFormConfig, formConfig)) {
        //数据没有变化时直接导出
        this.showActiveTooltip = false;
      } else {
        this.showActiveTooltip = true;
      }
      return this.showActiveTooltip;
    },
    handleActiveFormVersion(uuid) {
      // 处理激活表单版本
      if (this.showActiveTooltip) {
        return;
      }
      this.$api.framework.form.setFormActionVersion({ uuid: this.formUuid, versionUuid: uuid }).then(res => {
        if (res.Status == 'OK') {
          this.activeVersionUuid = uuid;
          this.versionList.forEach(item => {
            item.isActive === 1 && (item.isActive = 0);
            item.uuid == uuid && (item.isActive = 1);
          });
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    activeFormVersion(uuid) {
      //激活表单版本
      if (uuid && uuid == this.activeVersionUuid) {
        return;
      }
      this.handleSaveForm(uuid);
    },
    async handleSaveForm(uuid) {
      // 检查当前表单是否有被进行中的工单引用，若被引用，需要弹窗二次确认
      let _this = this;
      let isTip = await $frameworkUtils.isDependency(this.formUuid, 'form');
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
    delVersionModal(uuid, version) {
      if (uuid && this.activeVersionUuid == uuid) {
        return;
      }
      // '确定要删除' + (uuid == this.currentVersion.uuid ? '当前' : version) + '版本的表单',

      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: version + this.$t('page.versions')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.form.delFormVersion({ uuid: uuid }).then(res => {
            if (res.Status === 'OK') {
              if (uuid == this.currentVersion.uuid && (this.currentVersion.uuid = this.activeVersionUuid)) {
                this.getFormByVersionUuid(this.activeVersionUuid);
              }
              if (this.versionList.length > 0) {
                //删除对应的版本数据
                for (let i = 0; i < this.versionList.length; i++) {
                  if (this.versionList[i].uuid == uuid) {
                    this.$delete(this.versionList, i);
                  }
                }
              }
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
            }
          });
        }
      });
    },
    quoteList() {
      this.referenceModel = true;
    },
    uploadSuccess(data) {
      if (data.Status === 'OK') {
        if (this.currentVersion.uuid == data.Return.versionUuid) {
          //覆盖已有版本，就直接刷新
          this.getFormByVersionUuid(this.currentVersion.uuid);
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
    beforeUpload(e) {
      let _this = this;
      if (this.$utils.isEmpty(this.$refs.sheet.validConfig()) && this.$refs.formName.valid()) {
        //当验证通过时 当没有改动时直接跳转页面
        let formConfig = this.$refs.sheet ? this.$refs.sheet.getFormConfig() : {};
        if (this.compareData(this.initFormConfig, formConfig)) {
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
    exportFile() {
      //导出逻辑判断
      if (this.$utils.isEmpty(this.$refs.sheet.validConfig()) && this.$refs.formName.valid()) {
        //当验证通过时 当没有改动时直接跳转页面
        let formConfig = this.$refs.sheet ? this.$refs.sheet.getFormConfig() : {};
        if (this.compareData(this.initFormConfig, formConfig)) {
          //数据没有变化时直接导出
          this.okExportFile();
        } else {
          //数据有变化时，先保存在导出
          this.saveForm('exportFile');
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
            this.okExportFile();
          }
        });
      }
    },
    okExportFile() {
      //导出具体的数据
      const data = {
        url: '/api/binary/form/version/export',
        params: {
          uuid: this.formUuid,
          formVersionUuid: this.currentVersion.uuid
        }
      };
      this.download(data);
    },
    formValid() {
      if (this.valid()) {
        this.$Notice.success({title: this.$t('message.validatesuccess') });
      }
    },
    valid() { //整个表单校验
      this.errorData = {};
      const sheet = this.$refs['sheet'];
      let isValid = this.$refs['formName'].valid();
      if (!isValid || this.nameMsg) {
        this.$set(this.errorData, 'form', [{
          field: 'name',
          error: !isValid ? this.$t('page.formname') + '：' + this.$t('form.validate.requiredname') : this.nameMsg
        }]);
        this.$nextTick(() => {
          this.$refs.formName.focus();
        });
      } else {
        this.errorData.form && this.$delete(this.errorData, 'form');
      }
      this.errorData = Object.assign(this.errorData, sheet.validConfig()); 
      if (isValid && !this.$utils.isEmpty(this.errorData)) {
        isValid = false;
      }
      return isValid;
    },
    jumpToItem(uuid) {
      this.currentFormItem = null;
      this.$nextTick(() => {
        this.formData.formConfig.tableList.forEach(d => {
          let component = d.component;
          if (!this.$utils.isEmpty(component) && component.uuid === uuid) {
            this.currentFormItem = component;
            this.$refs.sheet.selectCell(d);
          }
        });
      });
    },
    editFormWidth() {
      this.isShowEditFormWidth = true;
    },
    closeEditFormWidth(data) {
      if (data) {
        this.$set(this.formData.formConfig, 'formWidth', data);
      }
      this.isShowEditFormWidth = false;
    },
    openScene() {
      this.isFormSceneDialog = true;
    },
    closeScene() {
      this.isFormSceneDialog = false;
    },
    deleteScene(uuid) {
      let findIndex = this.initFormConfig.sceneList.findIndex(item => item.uuid === uuid);
      if (findIndex > -1) {
        this.$delete(this.initFormConfig.sceneList, findIndex);
      }
    },
    updateResize() {
      this.isFormLoaded = false;
      this.$nextTick(() => {
        this.isFormLoaded = true;
      });
    },
    updateDefaultSceneUuid(uuid) {
      this.$set(this.initData, 'defaultsceneUuid', uuid);
    }
  },
  filter: {},
  computed: {
    currentFormItemError() {
      if (this.currentFormItem && this.errorData && this.errorData.hasOwnProperty(this.currentFormItem.uuid)) {
        return this.errorData[this.currentFormItem.uuid];
      }
      return null;
    },
    cellFormItemList() {
      const formItemList = [];
      this.formData.formConfig.tableList.forEach(d => {
        let component = d.component;
        while (component && !this.$utils.isEmpty(component)) {
          if (!Array.isArray(component)) {
            formItemList.push(component);
          } else {
            formItemList.push(...component);
          }
          if (component.isContainer && component.component) {
            component = component.component;
          } else {
            component = null;
          }
        }
      });
      return formItemList;
    },
    getFormCategoryList() {
      return (category) => {
        return this.formItemList.filter(d => d.category === category);
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
.form-item-config {
  position: absolute;
  z-index: 999;
  right: 0px;
  top: 0px;
  width: 380px;
  height: 100%;
  overflow: auto;
}
.form-item {
  text-align: center;
  cursor: move;
  // width: 50%;
  display: inline-block;
}
.customitem-btn {
  position: absolute;
  top: 0px;
  display: none;
}
.custom-formitem {
  position: relative;
}
.custom-formitem:hover .customitem-btn {
  display: inline;
}
.valid-list {
  position: relative;
  padding-left: 20px;
  .valid-icon {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>
