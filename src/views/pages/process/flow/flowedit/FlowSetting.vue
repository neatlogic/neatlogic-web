<template>
  <form class="flowSetting setting-box">
    <div class="flow-panel name">
      <p class="panel-title text-title require-label">{{ $t('term.process.flowname') }}</p>
      <div class="panel-contain input-border">
        <keep-alive>
          <TsFormInput
            ref="name"
            v-model="currentName"
            name="name"
            :validateList="nameValidateList"
            :maxlength="30"
          ></TsFormInput>
        </keep-alive>
      </div>
    </div>
    <div class="flow-panel permission-list">
      <div class="list list-bottom">
        <div class="panel-title text-title">
          {{ $t('term.process.relform') }}
          <div class="title-btn-contain action-group">
            <span
              v-if="relateList.uuid"
              class="tsfont-eye text-tip-active action-item"
              :title="$t('page.preview')"
              @click="previewForm"
            ></span>
            <span
              v-if="relateList.uuid"
              class="tsfont-edit text-tip-active action-item"
              :title="$t('page.edit')"
              @click="editForm"
            ></span>
            <span class="tsfont-refresh text-tip-active action-item" :title="$t('page.refreshtarget',{target:$t('term.process.formlist')})" @click="refreshRelateList()"></span>
          </div>
        </div>
        <div class="panel-contain input-border">
          <TsFormSelect
            v-model="relateList.uuid"
            v-bind="relateSelectConfig"
            @on-change="onChangeForm"
          >
            <template slot="first-ul">
              <li style="text-align:center;" @click.stop="stopPropagation($event)">
                <a class="tsfont-plus text-href add-integration" href="javascript:void(0);" @click="gotoFormEdit">{{ $t('page.form') }}</a>
              </li>
            </template>
          </TsFormSelect>
        </div>
      </div>
    </div>

    <!-- 权限 -->
    <AuthoritySetting
      :list="flowAuthorityConifig.authorityList"
      :defaultIsActive="activeSetting.permission"
      :hasGlobal="false"
      @updateauthority="updateauthority"
    ></AuthoritySetting>

    <!-- 通知设置 -->
    <NoticeSetting
      ref="NoticeSetting"
      v-model="activeSetting.informSetting"
      :formUuid="formUuid"
      :config="notifyPolicyConfig"
    ></NoticeSetting>
    <!-- 动作设置 -->
    <ActionSetting
      v-bind="actionConfig"
      :formConfig="formConfig"
      :defaultIsActive="activeSetting.actionSetting"
      @updateaction="updateaction"
      @updateActionSetting="updateActionSetting"
    ></ActionSetting>
    <!-- 标记重复事件 -->
    <div class="control-box">
      <div class="control-setting">
        <span class="label">
          <span>{{ $t('term.process.markrepeat') }}</span>
        </span>
        <span class="control-btn">
          <TsFormSwitch v-model="activeSetting.enableMarkRepeat" :true-value="1" :false-value="0"></TsFormSwitch>
        </span>
      </div>
    </div>
    <!-- <button @click="getJsonValue" type="button">获取json数据</button> -->
    <TsDialog
      type="silder"
      :isShow.sync="isPrevview"
      :maskClose="true"
      :hasFooter="false"
      width="1000px"
      :bgOp="true"
    >
      <div slot="header">{{ $t('page.preview') }}</div>
      <div>

        <TsSheet
          v-if="previewFormContent && previewFormContent._type == 'new'"
          ref="formSheet"
          mode="read"
          :value="previewFormContent"
        ></TsSheet>
        <FormPreview v-else :content="previewFormContent"></FormPreview>
      </div>
    </TsDialog>
  </form>
</template>

<script>
import FormPreview from '@/resources/components/FormMaker/formview/form-view.vue';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: 'FlowSetting',
  components: {
    TsFormInput,
    TsFormSelect,
    FormPreview,
    NoticeSetting: () => import('./components/nodesetting/notice-setting.vue'),
    AuthoritySetting: () => import('./components/nodesetting/authority-setting.vue'),
    ActionSetting: () => import('./components/nodesetting/action-setting.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsSheet: () => import('@/resources/plugins/TsSheet/TsSheet.vue')
  },
  props: {
    uuid: {
      //流程uuid
      type: String,
      default: null
    },
    name: {
      //流程名字
      type: String,
      default: ''
    },
    formUuid: {
      //表单uuid
      type: String,
      default: ''
    },
    formConfig: {
      type: Object
    },
    typedata: Object,
    actionAuthorityConfig: Object, //表单各种动作对应的权限组件数据
    processConfig: Object//流程设置数据
  },
  data() {
    let _this = this;
    return {
      configData: null, //当前节点数据
      activeSetting: {//开关设置
        permission: 0, //权限设置开关
        informSetting: 0, //通知设置
        enableMarkRepeat: 0, //标记重复事件
        actionSetting: 0 // 动作设置
      },
      currentVersionUuid: '', //选择表单版本uuid
      currentName: _this.name || '', //流程名称
      nameValidateList: ['required', 'name-special', {
        name: 'searchUrl',
        url: 'api/rest/process/save',
        key: 'name',
        params: () => ({uuid: this.uuid})
      }],
      relateList: {
        //表单对应的组件列表
        uuid: _this.formUuid || '',
        dataList: []
      },
      isPrevview: false, //预览表单
      formContent: {}, //已选表单数据
      previewFormContent: null, //用来预览表单数据
      nodeList: [], //获取外层所有节点，然后需要过滤开始结束
      excludeNodetypeList: ['start', 'end'], //不可以配置表单授权的节点类型
      notifyPolicyConfig: {//通知设置的数据
        policyId: undefined,
        paramMappingList: [],
        handler: ''
      },
      actionConfig: {//动作数据
        handler: '',
        actionList: []
      },
      flowAuthorityConifig: {
        authorityList: [] //权限数据
      },
      relateSelectConfig: {
        dynamicUrl: '/api/rest/form/search',
        params: {
          isActive: 1,
          needPage: false
        },
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        clearable: true,
        transfer: true
      }
    };
  },
  created() {
    this.formUuid && this.getFormItem(this.formUuid);
    this.initNodeData();
  },
  destroyed() {},
  methods: {
    onChangeForm(val) {
      //修改关联表单
      if (val) {
        this.getFormItem(val);
      } else {
        this.$emit('updateformitemList', []);
      }
      this.$emit('update:formUuid', val);
      this.$emit('changeRelateForm', val);
    },
    onChangePermissionType(config) {
      this.$set(config, 'attributeUuidList', []);
      this.$set(config, 'type', 'component');
    },
    previewForm() {
      //预览表单
      this.isPrevview = true;
    },
    editForm() {
      //编辑表单
      window.open(HOME + '/framework.html#/form-edit?uuid=' + this.relateList.uuid + '&currentVersionUuid=' + this.currentVersionUuid, '_blank');
    },
    //刷新关联表单信息
    refreshRelateList() {
      this.relateSelectConfig.dynamicUrl = '/api/rest/form/search?refuuid=' + this.$utils.setUuid();
      this.$nextTick(() => {
        this.relateList.uuid && this.getFormItem(this.relateList.uuid);
        this.$Message.success(this.$t('message.executesuccess'));
      });
    },
    getFormItem(uuid) {
      //获取表单指定版本的数据，渲染表单
      let data = {
        uuid: uuid
      };
      this.$api.framework.form.getFormByVersionUuid(data).then(res => {
        if (res.Status == 'OK') {
          this.currentVersionUuid = res.Return.currentVersionUuid;
          if (!this.$utils.isEmpty(res.Return.formConfig)) {
            this.formContent = res.Return.formConfig;
            this.previewFormContent = this.$utils.deepClone(this.formContent);
            let plugin = [];
            if (this.formContent._type == 'new') { //新的表单
              let controllerList = [];
              this.previewFormContent.tableList.forEach(item => {
                if (!this.$utils.isEmpty(item.component)) {
                  if (item.component.hasValue) {
                    controllerList.push(item.component);
                  } else if (item.component.component && Array.isArray(item.component.component)) {
                    if (!this.$utils.isEmpty(item.component.component)) {
                      controllerList.push(...item.component.component);
                    }
                  }
                }
              });
              if (!this.$utils.isEmpty(this.formContent.hideComponentList)) {
                controllerList.push(...this.formContent.hideComponentList);
              }
              plugin = controllerList;
            } else {
              plugin = this.formContent.controllerList;
            }
            this.$emit('updateformitemList', this.$utils.deepClone(plugin)); //表单组件
          }
        }
      });
    },
    getJsonValue() { //获取流程设置的数据
      this.notifyPolicyConfig = this.$refs.NoticeSetting ? this.$refs.NoticeSetting.getData() : this.notifyPolicyConfig;
      if (!this.activeSetting.actionSetting) {
        this.$set(this.actionConfig, 'actionList', []);
      }

      let json = {
        processConfig: {
          name: this.currentName,
          uuid: this.uuid,
          notifyPolicyConfig: this.notifyPolicyConfig,
          actionConfig: this.actionConfig,
          enableAuthority: this.configData.enableAuthority || 0,
          authorityList: this.flowAuthorityConifig.authorityList,
          enableMarkRepeat: this.activeSetting.enableMarkRepeat
        },
        formConfig: {
          uuid: ''
        },
        isValid: !(this.$refs.name && this.$refs.name.validMesage),
        validMessage: this.$t('message.validatesuccess')
      };
      if (this.relateList.uuid) {
        Object.assign(json, {
          formConfig: {
            uuid: this.relateList.uuid
          }
        });
      }
      json.isValid == false && (json.validMessage = this.$t('message.targetvalidfailed', {target: this.$t('term.process.flowname')}));
      return JSON.parse(JSON.stringify(json));
    },
    stopPropagation(event) {
      return false;
    },
    gotoFormEdit() {
      let uuid = this.$utils.setUuid();
      window.open(HOME + '/framework.html#/form-edit?uuid=' + uuid, '_blank');
    },
    toggleType(type, config) {
      this.$set(config, 'attributeUuidList', []);
      this.$set(config, 'processStepUuidList', []);
    },
    clearNotifyPolicy(val) {
      this.notifyPolicyConfig.policyId = '';
      this.notifyPolicyConfig.paramMappingList = [];
    },
    initNodeData() {
      if (!this.processConfig) {
        return;
      }
      let config = this.configData = this.$utils.deepClone(this.processConfig);
      if (this.activeSetting) {
        this.activeSetting.permission = config.enableAuthority || 0;
        this.activeSetting.informSetting = config.notifyPolicyConfig && config.notifyPolicyConfig.isCustom || 0;
        this.activeSetting.actionSetting = config.actionConfig && config.actionConfig.actionList && config.actionConfig.actionList.length ? 1 : 0;
      }
      this.actionConfig = config.actionConfig || {};
      this.notifyPolicyConfig = config.notifyPolicyConfig || {};
      this.flowAuthorityConifig.authorityList = config.authorityList || []; //权限列表
      this.activeSetting.enableMarkRepeat = config.enableMarkRepeat;
    },
    updateauthority(permission, list) {
      this.$set(this.flowAuthorityConifig, 'permission', permission);
      this.configData.enableAuthority = permission;
      this.flowAuthorityConifig.authorityList = list || [];
    },
    updateaction(type, data, index) {
      if (type == 'add') {
        this.actionConfig.actionList.push(data);
      } else if (type == 'empty') {
        this.actionConfig.actionList = [];
      } else if (type == 'remove') {
        this.$delete(this.actionConfig.actionList, index);
      } else {
        this.$set(this.actionConfig.actionList, index, data);
      }
    },
    updateActionSetting(val) {
      this.activeSetting.actionSetting = val;
    }
  },
  watch: {
    formConfig: {
      handler(val, oldval) {
        val && val.uuid && this.getFormItem(val.uuid) && (this.relateList.uuid = val.uuid); // 解决重置关联表单预览失败
      },
      deep: true
    },
    name(val) {
      this.currentName = val || '';
    },
    currentName(val) {
      this.$emit('changeFlowName', val);
    },
    processConfig: {
      handler(newVal, oldVal) {
        this.initNodeData();
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

<style lang="less">
@import '~@/resources/assets/css/variable.less';

.flowSetting {
  width: 100%;
  overflow-y: auto;
  height: calc(100vh - 147px);
  -ms-overflow-style: none;
  overflow: -moz-scrollbars-none;

  &::-webkit-scrollbar {
    width: 0 !important;
  }

  .flow-panel {
    .panel-title {
      position: relative;
      margin-bottom: 8px;

      .title-btn-contain {
        float: right;

        > span {
          font-size: 12px;
        }
      }
    }

    .panel-contain {
      .col-2 {
        width: 50%;
        float: left;
        min-height: 40px;
      }
    }

    &:last-of-type {
      border-bottom: none;
    }
  }

  .border {
    .ivu-input,
    .ivu-select-selection {
      border: 1px solid @border-color-base;
      padding-left: 8px;
    }
  }

  .span-add-permission {
    cursor: pointer;
    margin: auto;
    border: 1px dashed @dividing-color;
    display: block;
    width: 100%;
    text-align: center;
    line-height: 1.6;
    margin-top: 10px;
    margin-bottom: 5px;
  }

  .ivu-select-item > .select-in-add {
    padding: 7px 16px;
    margin: -7px -16px;
    text-align: center;
  }

  .div-relate {
    position: relative;
    padding: 8px 16px 16px;
    margin-bottom: 8px;

    > .removePermission {
      display: none;
      cursor: pointer;
      position: absolute;
      top: -8px;
      right: 0;
      font-size: 12px;
    }

    &:hover {
      > .removePermission {
        display: block;
      }
    }
  }

  .span-btn-line {
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
  }
}
</style>
