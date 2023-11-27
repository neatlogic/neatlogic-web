<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="gotoFormEdit()">{{ $t('page.mainscene') }}</span>
      </template>
      <template v-slot:topLeft>
        <TsRow>
          <Col span="12">
            <TsFormInput
              ref="sceneName"
              v-model="sceneName"
              :placeholder="$t('term.framework.cusscenename')"
              maxlength="50"
              border="border"
              :validateList="validateList"
            ></TsFormInput>
          </Col>
        </TsRow>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <div class="flex-start">
              <span>
                <Poptip
                  word-wrap
                  width="350"
                  transfer
                  :content="$t('term.framework.globalreadonlytip')"
                >
                  <span>{{ $t('term.framework.globalreadonly') }}</span>
                  <span class="text-href tsfont-info-o"></span>
                </Poptip>
              </span>
              <TsFormSwitch
                v-model="readOnly"
                :falseValue="false"
                :trueValue="true"
                @on-change="(val)=>changeReadOnly(val)"
              ></TsFormSwitch>
            </div>
          </div>
          <div class="action-item">
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
          <div class="action-item text-action tsfont-scene" @click="openScene()">{{ $t('page.scene') }}</div>
          <div class="action-item text-action tsfont-circulation-s" @click="openPreview()">{{ $t('page.preview') }}</div>
          <div class="action-item last">
            <Button type="primary" @click.stop="saveForm()">{{ $t('page.save') }}</Button>
          </div>
        </div>
      </template>
      <template v-slot:sider>
        <div class="formitem-container pr-sm">
          <Alert show-icon>
            <div>{{ $t('message.framework.cusscenecomptip') }}</div>
          </Alert>
          <div>
            <TsRow :gutter="16">
              <Col
                v-for="(item, index) in formItemList"
                :key="index"
                :span="12"
                class="form-item mt-md"
              >
                <div
                  draggable="true"
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
        </div>
      </template>
      <template v-slot:content>
        <div v-if="isFormLoaded" style="position:relative">
          <TsSheet
            ref="sheet"
            v-model="formData.formConfig"
            @selectCell="selectCell"
            @removeComponent="removeComponent"
            @updateItemList="updateItemList"
          ></TsSheet>
          <FormItemConfig
            v-if="currentFormItem"
            :formItem="currentFormItem"
            :formItemList="cellFormItemList"
            :error="currentFormItemError"
            :disabled="disabled"
            :initFormItemList="initFormItemList"
            class="form-item-config bg-grey border-base-left"
            @close="currentFormItem = null"
            @inheritFormItem="inheritFormItem"
          ></FormItemConfig>
          <FormPreview
            v-if="isPreviewShow"
            :data="previewFormData"
            @close="closePreview"
          ></FormPreview>
        </div>
      </template>
    </TsContain>
    <FormSceneDialog
      v-if="isFormSceneDialog"
      :uuid="uuid"
      :currentVersionUuid="currentVersionUuid"
      :sceneUuid="sceneUuid"
      :data="initFormData"
      :formConfig="initFormConfig"
      @close="closeScene"
      @deleteScene="deleteScene"
      @updateDefaultSceneUuid="updateDefaultSceneUuid"
      @updateSceneReadOnly="updateSceneReadOnly"
    ></FormSceneDialog>
    <ReactionDialog
      v-if="isReactionShow"
      :reaction="formData.formConfig.reaction"
      :rowcount="formData.formConfig.lefterList.length"
      :formItemList="cellFormItemList"
      @close="closeReactionDialog"
    ></ReactionDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsSheet: resolve => require(['./TsSheet.vue'], resolve),
    FormItemConfig: resolve => require(['./form-item-config.vue'], resolve),
    FormPreview: resolve => require(['./form-preview.vue'], resolve),
    FormSceneDialog: resolve => require(['./form-scene-dialog.vue'], resolve),
    ReactionDialog: resolve => require(['./form-row-reaction-dialog.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {},
  data() {
    return {
      uuid: '', //表单uuid
      currentVersionUuid: '', //表单版本uuid
      sceneUuid: '', //场景uuid,
      sceneName: '',
      type: 'add', //add/edit/copy
      isFormLoaded: false,
      initFormData: {},
      initFormConfig: {},
      initFormItemList: [],
      formData: {},
      validateList: [
        { name: 'required', message: ' ' },
        { name: 'name-special', message: ' ' }
      ],
      isShowValidList: false,
      errorData: {}, //异常信息
      isReactionShow: false,
      isPreviewShow: false,
      formItemList: [],
      currentFormItem: null,
      previewFormData: {},
      isFormSceneDialog: false,
      disabled: false,
      sceneList: [],
      deleteSceneUuid: '',
      readOnly: false
    };
  },
  beforeCreate() {},
  created() {
    this.uuid = this.$route.query.uuid || null;
    this.currentVersionUuid = this.$route.query.currentVersionUuid || null;
    this.sceneUuid = this.$route.query.sceneUuid || null;
    this.type = this.$route.query.type || 'add';
    if (this.type === 'add') {
      this.sceneUuid = this.$utils.setUuid();
    }
    this.initData();
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
      let isSame = true;
      if (this.deleteSceneUuid !== this.sceneUuid) {
        let newData = this.$refs.sheet.getFormConfig();
        newData = this.getCompareData(newData);
        let oldLefterList = oldData.lefterList;
        let newLefterList = newData.lefterList;
        let oldHeaderList = oldData.headerList;
        let newHeaderList = oldData.headerList;
        this.$delete(oldData, 'lefterList');
        this.$delete(oldData, 'headerList');
        this.$delete(newData, 'lefterList');
        this.$delete(newData, 'headerList');
        isSame = this.$utils.isSame(oldData, newData);
        if (this.formData.formConfig.name != this.sceneName) {
          isSame = false;
        }
        if (isSame) {
          isSame = this.contrastError(oldLefterList, newLefterList, 'height');
        }
        if (isSame) {
          isSame = this.contrastError(oldHeaderList, newHeaderList, 'width');
        }
      }
      return isSame;
    },
    async beforeLeave() {
      //离开页面，二次弹窗，点击'确认按钮'，存储数据,
      return await this.saveForm('back');
    },
    contrastError(oldData, newData, type) {
      let isSame = true;
      let num = 2;//对比：误差高度在2px内可忽略
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
    getCompareData(config) {
      let data = {};
      if (config) {
        data = {
          headerList: config.headerList,
          lefterList: config.lefterList,
          reaction: config.reaction,
          tableList: config.tableList
        };
        if (data.tableList) {
          data.tableList.forEach(item => {
            if (item.component && item.component.inherit) {
              item.component = {
                uuid: item.component.uuid,
                inherit: item.component.inherit
              };
            }
          });
        }
      }
      return data;
    },
    initData() {
      this.isFormLoaded = false;
      let data = {
        uuid: this.formUuid,
        currentVersionUuid: this.currentVersionUuid
      };
      this.$api.framework.form.getFormByVersionUuid(data).then(res => {
        if (res.Status == 'OK') {
          this.initFormData = res.Return;
          let formConfig = res.Return.formConfig || {};
          this.initFormConfig = this.$utils.deepClone(formConfig);
          this.sceneList = formConfig.sceneList || [];
          let sceneConfig = {};
          let formItemList = [];
          if (formConfig.tableList) {
            formConfig.tableList.forEach(item => {
              if (item.component) {
                let component = item.component;
                component.inherit = true;
                formItemList.push(item.component);
              }
            });
          }
          this.formItemList = this.$utils.deepClone(formItemList);
          this.initFormItemList = this.$utils.deepClone(formItemList);
          if (this.type !== 'add') {
            sceneConfig = this.sceneList.find(s => s.uuid === this.sceneUuid) || {};
            if (this.type === 'copy') {
              this.sceneUuid = this.$utils.setUuid();
              this.sceneName = '';
              if (this.$utils.isEmpty(sceneConfig)) {
                sceneConfig = {
                  name: '',
                  headerList: formConfig.headerList,
                  lefterList: formConfig.lefterList,
                  reaction: formConfig.reaction,
                  tableList: formConfig.tableList
                };
              }
            } else {
              this.sceneName = sceneConfig.name;
            }
            if (sceneConfig) { 
              sceneConfig.tableList.forEach(item => {
                if (item.component && item.component.inherit) {
                  let component = formItemList.find(c => c.uuid === item.component.uuid);
                  if (component) {
                    this.$set(item, 'component', component);
                  }
                }
              });
              this.formItemList = this.formItemList.filter((f) => {
                return !sceneConfig.tableList.find(t => t.component && t.component.uuid === f.uuid);
              });
              this.formData.formConfig = this.$utils.deepClone(sceneConfig);
              this.readOnly = sceneConfig.readOnly || false;
            }
          }
          this.$addWatchData(this.getCompareData(sceneConfig));
        }
      }).finally(() => {
        this.isFormLoaded = true;
      });
    },
    formValid() {
      if (this.valid()) {
        this.$Notice.success({title: this.$t('message.validatesuccess') });
      }
    },
    valid() { //整个表单校验
      this.errorData = {};
      const sheet = this.$refs['sheet'];
      let isValid = true;
      if (!this.sceneName) {
        this.$set(this.errorData, 'scene', [{
          field: 'name',
          error: this.$t('page.scenarioname') + '：' + this.$t('form.validate.requiredname')
        }]);
        this.$nextTick(() => {
          this.$refs.sceneName.focus();
        });
      } else {
        let findName = this.sceneList.find(s => s.uuid !== this.sceneUuid && s.name === this.sceneName);
        if (findName || this.sceneName === this.$t('page.mainscene')) {
          this.$set(this.errorData, 'scene', [{
            field: 'name',
            error: this.$t('message.cannotrepeat', {'target': this.$t('page.scenarioname')})
          }]);
          this.$nextTick(() => {
            this.$refs.sceneName.focus();
          });
        } else {
          this.errorData.scene && this.$delete(this.errorData, 'scene');
        }
      }
      this.errorData = Object.assign(this.errorData, sheet.validConfig()); 
      if (isValid && !this.$utils.isEmpty(this.errorData)) {
        isValid = false;
      }
      return isValid;
    },
    jumpToItem(uuid) {
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
    openReactionDialog() {
      this.isReactionShow = true;
    },
    closeReactionDialog(reactionConf) {
      this.isReactionShow = false;
      if (reactionConf) {
        this.$set(this.formData.formConfig, 'reaction', reactionConf);
      }
    },
    openPreview() {
      const data = this.$refs.sheet.getFormConfig();
      this.$set(data, 'formWidth', this.initFormConfig.formWidth);
      this.$set(data, 'readOnly', this.readOnly);
      this.previewFormData = data;
      this.isPreviewShow = true;
    },
    closePreview() {
      this.isPreviewShow = false;
    },
    openScene() {
      this.isFormSceneDialog = true;
    },
    closeScene() {
      this.isFormSceneDialog = false;
    },
    dragStart(event, item) {
      event.dataTransfer.setData('item', JSON.stringify(item));
    },
    dragEnd(event) {
      event.dataTransfer.clearData();
    },
    updateItemList(uuid, oldUuid, config) {
      if (uuid) {
        let index = this.formItemList.findIndex(i => i.uuid === uuid);
        index > -1 && this.$delete(this.formItemList, index);
        if (oldUuid) {
          this.removeComponent(oldUuid);
        }
      } else if (config) {
        let itemUuidList = [];
        if (config.tableList && config.tableList.length > 0) {
          config.tableList.forEach(item => {
            if (item.component && item.component.uuid) {
              itemUuidList.push(item.component.uuid);
            }
          });
        }
        if (itemUuidList.length > 0) {
          let newFormItemList = [];
          this.initFormItemList.forEach(item => {
            if (!itemUuidList.includes(item.uuid)) {
              newFormItemList.push(item);
            } 
          });
          this.formItemList = newFormItemList;
        } else {
          this.formItemList = this.$utils.deepClone(this.initFormItemList);
        }
      }
    },
    selectCell(cell, component) {
      this.disabled = false;
      if (component && cell.component && cell.component.hasOwnProperty('inherit') && component.uuid !== cell.component.uuid) {
        this.disabled = true;
      }
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
      let config = this.initFormItemList.find(i => i.uuid === uuid);
      config && this.formItemList.push(this.$utils.deepClone(config));
    },
    inheritFormItem(uuid) {
      let config = this.initFormItemList.find(i => i.uuid === uuid);
      this.currentFormItem = null;
      this.$nextTick(() => {
        this.currentFormItem = this.$utils.deepClone(config);
      });
    },
    saveForm(type) {
      if (this.valid()) {
        this.isShowValidList = false;
        let data = {
          uuid: this.uuid,
          currentVersionUuid: this.currentVersionUuid,
          name: this.initFormData.name,
          isActive: this.initFormData.isActive,
          formConfig: this.$utils.deepClone(this.initFormConfig)
        };
        let formConfig = this.$refs.sheet.getFormConfig();
        this.$set(formConfig, 'name', this.sceneName);
        this.$set(formConfig, 'uuid', this.sceneUuid);
        this.$set(formConfig, 'readOnly', this.readOnly);
        if (formConfig.tableList) {
          formConfig.tableList.forEach(item => {
            if (item.component && item.component.inherit) {
              item.component = {
                uuid: item.component.uuid,
                inherit: item.component.inherit
              };
            }
          });
        }
        let findIndex = data.formConfig.sceneList.findIndex(item => item.uuid === formConfig.uuid);
        if (findIndex > -1) {
          data.formConfig.sceneList.splice(findIndex, 1, formConfig);
        } else {
          data.formConfig.sceneList.push(formConfig);
        }
        this.$api.framework.form.saveForm(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            if (type != 'back') {
              if (this.$route.query.sceneUuid !== this.sceneUuid) {
                this.$router.replace({
                  path: '/form-scene-edit',
                  query: {
                    uuid: this.uuid,
                    currentVersionUuid: this.currentVersionUuid,
                    sceneUuid: this.sceneUuid,
                    type: 'edit'
                  }
                });
              } else {
                this.initData();
              }
            }
          }
        });
      } else if (!this.$utils.isEmpty(this.errorData)) {
        this.isShowValidList = true;
        return false;
      }
    },
    deleteScene(uuid) {
      this.deleteSceneUuid = uuid;
      if (uuid === this.sceneUuid) {
        this.$router.replace({
          path: '/form-edit',
          query: {
            uuid: this.uuid,
            currentVersionUuid: this.currentVersionUuid
          }
        });
      } else {
        let findIndex = this.initFormConfig.sceneList.findIndex(item => item.uuid === uuid);
        if (findIndex > -1) {
          this.$delete(this.initFormConfig.sceneList, findIndex);
        }
      }
    },
    gotoFormEdit() {
      this.$router.replace({
        path: '/form-edit',
        query: {
          uuid: this.uuid,
          currentVersionUuid: this.currentVersionUuid
        }
      });
    },
    updateDefaultSceneUuid(uuid) {
      this.$set(this.initFormConfig, 'defaultSceneUuid', uuid);
    },
    updateSceneReadOnly(readOnly, sceneUuid) {
      if (sceneUuid === this.initFormConfig.uuid) {
        this.$set(this.initFormConfig, 'readOnly', readOnly);
      } else {
        this.initFormConfig.sceneList.forEach(item => {
          if (item.uuid === sceneUuid) {
            this.$set(item, 'readOnly', readOnly);
          }
        });
      }
      if (sceneUuid === this.sceneUuid) {
        this.readOnly = readOnly;
      }
    },
    changeReadOnly(readOnly) {
      this.defaultSceneUuid = this.selectSceneUuid;
      this.$api.framework.form.saveFormSceneReadonly({
        versionUuid: this.currentVersionUuid,
        sceneUuid: this.sceneUuid,
        readOnly: readOnly
      }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.initFormConfig.sceneList.forEach(item => {
            if (item.uuid === this.sceneUuid) {
              this.$set(item, 'readOnly', readOnly);
            }
          });
        }
      });
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
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
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
