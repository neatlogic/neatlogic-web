<template>
  <div class="basic-edit">
    <TsDialog
      :title="$t('dialog.title.edittarget', {target: $t('page.basicinfo')})"
      type="modal"
      :isShow="true"
      @on-ok="save"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="settingForm"
            v-model="settingConfig"
            labelPosition="top"
            :item-list="settingForm"
          >
            <template v-slot:defaultProfileId>
              <div>
                <TsFormSelect v-model="settingConfig.defaultProfileId" v-bind="profileForm" @first="gotoProfile()"></TsFormSelect>
                <div class="action-icon">
                  <span class="tsfont-rotate-right text-tip-active" @click="refreshProfile"></span>
                  <span
                    v-if="settingConfig.defaultProfileId"
                    class="tsfont-edit text-tip-active pl-sm"
                    @click="gotoProfile(settingConfig.defaultProfileId)"
                  ></span>
                </div>
              </div>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    id: { //工具id
      type: Number
    },
    config: {type: Object, default: () => {}},
    settingList: {
      type: Array,
      default: () => []
    },
    operationType: String
    
  },
  data() {
    return {
      list: this.$utils.deepClone(this.settingList),
      settingForm: [],
      settingConfig: {},
      formList: [
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          width: '100%',
          validateList: [
            'required', 
            'name-special',
            { name: 'searchUrl',
              url: '/api/rest/autoexec/script/save', 
              params: {id: this.id || this.$route.query.versionId || ''},
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('page.name')})
            }
          ],
          disabled: this.operationType == 'tool',
          onChange: (val) => {
            this.changeLabel(val, 'name');
          }
        },
        {
          type: 'select',
          name: 'typeId',
          value: '',
          dataList: [],
          label: this.$t('term.autoexec.toolclassification'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          validateList: ['required'],
          search: true,
          dynamicUrl: '/api/rest/autoexec/type/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getToolClassificationList,
          transfer: true,
          width: '100%',
          disabled: this.operationType == 'tool',
          onChangelabel: (val) => {
            this.changeLabel(val, 'typeName');
          }
        },
        {
          type: 'tree',
          name: 'catalogId',
          value: '',
          dataList: [],
          label: this.$t('term.autoexec.directorytool'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          validateList: ['required'],
          search: false,
          textName: 'name',
          valueName: 'id',
          transfer: true,
          width: '100%',
          disabled: this.operationType == 'tool',
          onChangelabel: (val) => {
            this.changeLabel(val, 'catalogName');
          }
        },
        {
          name: 'isLib',
          type: 'radio',
          label: this.$t('term.autoexec.islibraryfile'),
          dataList: [
            {
              text: this.$t('page.yes'),
              value: 1
            },
            {
              text: this.$t('page.no'),
              value: 0
            }
          ],
          disabled: true,
          validateList: ['required'],
          transfer: true,
          onChange: (val) => {
            if (val && val == 1) {
              this.settingForm = this.formList.concat(this.isLibSettingForm);
              this.settingConfig.isLib = 1;
              this.deleteSettingList();
            } else {
              this.settingForm = this.formList.concat(this.isNotLibSettingForm);
              this.settingConfig.isLib = 0;
              this.addSettingList();
            }
            this.changeLabel(val == 1 ? this.$t('page.yes') : this.$t('page.no'), 'isLibName');
          }
        }

      ],
      isNotLibSettingForm: [
        {
          type: 'select',
          name: 'execMode',
          value: '',
          label: this.$t('page.executionmode'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          width: '100%',
          dynamicUrl: '/api/rest/universal/enum/get',
          params: {enumClass: 'ScriptExecMode'},
          dealDataByUrl: this.dealExecModeList,
          validateList: ['required'],
          transfer: true,
          disabled: this.operationType == 'tool',
          onChangelabel: (val) => {
            this.changeLabel(val, 'execModeText');
          }
        },
        {
          type: 'select',
          name: 'riskId',
          value: '',
          label: this.$t('term.autoexec.risklevel'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          width: '100%',
          dynamicUrl: '/api/rest/autoexec/risk/list',
          validateList: ['required'],
          transfer: true,
          disabled: this.operationType == 'tool',
          onChangelabel: (val) => {
            this.changeLabel(val, 'riskName');
          }
        },
        {
          type: 'select',
          name: 'customTemplateId',
          label: this.$t('page.customtemplate'),
          value: '',
          dynamicUrl: '/api/rest/autoexec/customtemplate/search',
          params: {isActive: 1},
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          tooltip: this.$t('term.autoexec.jobdetailspecialinfo'),
          with: '100%',
          transfer: true,
          onChangelabel: (val) => {
            this.changeLabel(val, 'customTemplateName');
          }
        },
        {
          type: 'slot',
          name: 'defaultProfileId',
          label: this.$t('term.autoexec.presetparameterset')
        },
        {
          type: 'textarea',
          name: 'description',
          value: '',
          maxlength: 500,
          label: this.$t('page.description'),
          width: '100%',
          disabled: this.operationType == 'tool',
          onChange: (val) => {
            this.changeLabel(val, 'description');
          }
        }
      ],
      isLibSettingForm: [
        {
          type: 'slot',
          name: 'defaultProfileId',
          label: this.$t('term.autoexec.presetparameterset')
        },
        {
          type: 'textarea',
          name: 'description',
          value: '',
          maxlength: 500,
          label: this.$t('page.description'),
          width: '100%',
          disabled: this.operationType == 'tool',
          onChange: (val) => {
            this.changeLabel(val, 'description');
          }
        }
      ],
      profileForm: {
        dynamicUrl: '/api/rest/autoexec/profile/search',
        params: {
          operationId: this.id
        },
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        border: 'border',
        transfer: true,
        firstSelect: false,
        firstText: this.$t('term.autoexec.presetparameterset'),
        firstLi: true,
        disabled: this.operationType == 'tool',
        onChangelabel: (val) => {
          this.changeLabel(val, 'defaultProfileName');
        }
      },
      customTemplateId: null
    };
  },
  beforeCreate() {},
  created() {
    this.getTreeListSync();
    for (let i = 0; i < this.formList.length; i++) {
      if (this.formList[i].name == 'isLib') {
        if (this.config.isLib == 1) {
          this.settingForm = this.formList.concat(this.isLibSettingForm);
        } else {
          this.settingForm = this.formList.concat(this.isNotLibSettingForm);
        }
      }
    }
    this.init();
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
    async init() {
      this.settingConfig = this.$utils.deepClone(this.config);
      if (this.config.isLib == 0) {
        await this.searchCustomtemplate();
        this.$set(this.settingConfig, 'customTemplateId', this.customTemplateId);
      }
    },
    async getTreeListSync() {
      for (let i = 0; i < this.formList.length; i++) {
        if (this.formList[i].name == 'catalogId') {
          this.formList[i].dataList = await this.$toolCatalogUtils.getTreeList();
        }
      }
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
    gotoProfile(id) { //新增预置参数集
      if (id) {
        window.open(HOME + '/autoexec.html#/tool-profile-manage?id=' + id, '_blank');
      } else {
        window.open(HOME + '/autoexec.html#/tool-profile-manage?isAdd=true', '_blank');
      }
    },
    refreshProfile() { //刷新
      this.profileForm.dynamicUrl = '/api/rest/autoexec/profile/search?uuid=' + this.$utils.setUuid();
      this.$Message.success(this.$t('message.refreshsuccess'));
    },
    changeLabel(label, type) {
      this.list.forEach(item => {
        if (item.name == type) {
          item.text = label || '-';
        }
      });
    },
    deleteSettingList() {
      let deleteList = ['execModeText', 'riskName', 'customTemplateName'];
      this.list = this.list.filter(item => !deleteList.includes(item.name));
      this.$set(this.settingConfig, 'execMode', null);
      this.$set(this.settingConfig, 'riskId', null);
      this.$set(this.settingConfig, 'customTemplateId', null);
    },
    addSettingList() {
      let findItem = this.list.findIndex(item => item.name == 'isLibName');
      this.list.splice(findItem + 1, 0, {name: 'execModeText', text: '', label: this.$t('page.executionmode'), isRequired: true});
      this.list.splice(findItem + 2, 0, {name: 'riskName', text: '', label: this.$t('term.autoexec.risklevel'), isRequired: true});
      this.list.splice(findItem + 3, 0, {name: 'customTemplateName', text: '-', label: this.$t('page.customtemplate'), isRequired: false });
    },
    save() {
      if (!this.$refs.settingForm.valid()) {
        return;
      }
      let data = {
        id: this.id
      };
      if (this.operationType == 'tool') {
        Object.assign(data, {customTemplateId: this.settingConfig.customTemplateId ? this.settingConfig.customTemplateId : null});
        this.$api.autoexec.tool.updateToolCustomtemplate(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess')); //保存成功
            this.$emit('close', this.list, this.settingConfig);
          }
        });
      } else {
        data = Object.assign(data, this.settingConfig);
        if (data && data.catalogId) {
          data.catalogId = this.$toolCatalogUtils.handleCatalogIdAlltoZero(data);
        }
        if (data.isLib == 1) {
          delete data.execMode;
          delete data.riskId;
        }
        this.$api.autoexec.script.saveBaseinfo(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess')); //保存成功
            this.$emit('close', this.list, this.settingConfig);
          }
        });
      }
    },
    closeDialog() {
      this.$emit('close');
    },
    searchCustomtemplate() {
      return this.$api.autoexec.customtemplate.searchCustomTemplate({  
        defaultValue: [this.config.customTemplateId]
      }).then(res => {
        if (res.Return && res.Return.tbodyList && res.Return.tbodyList.length) {
          this.customTemplateId = this.config.customTemplateId;
        } else {
          this.customTemplateId = null;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.action-icon{
  position: absolute;
  top: -30px;
  right: 0;
}
</style>
