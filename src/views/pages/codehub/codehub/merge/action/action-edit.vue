<template>
  <div>
    <TsDialog
      v-if="actionData"
      v-bind="actionDialogConfig"
      :is-show="isShow"
      @on-close="close"
    >
      <template v-slot:header>
        <div v-if="actionData.id">{{ $t('dialog.title.edittarget', { target: $t('page.config') }) }}</div>
        <div v-if="!actionData.id">{{ $t('dialog.title.addtarget', { target: $t('page.config') }) }}</div>
      </template>
      <template v-slot>
        <TsForm ref="actionForm" :item-list="actionFormConfig">
          <template v-slot:triggerStatus>
            <TsFormSelect
              ref="triggerStatus"
              v-model="actionData.triggerStatus"
              v-bind="statusConfig"
              :dataList="triggerStatusList"
            />
          </template>
          <template slot="appModuleId">
            <TsFormSelect v-model="actionData.appModuleId" v-bind="appModuleConfig" :dataList="appModuleList" />
          </template>
          <template v-slot:arguments>
            <Tabs v-model="activedTab" name="actionEditTabs">
              <TabPane :label="$t('term.pbc.paramconfig')" name="arguments" tab="actionEditTabs">
                <Argument ref="argument" :action="actionData" @setArguments="setArguments"></Argument>
              </TabPane>
              <TabPane :label="$t('page.paramdesc')" name="param" tab="actionEditTabs">
                <Helpparam></Helpparam>
              </TabPane>
            </Tabs>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :loading="isSaving" @click="saveAction()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    Argument: resolve => require(['./argument-edit.vue'], resolve),
    Helpparam: resolve => require(['./helpparam.vue'], resolve)
  },
  props: {
    id: { type: Number },
    isShow: { type: Boolean, default: false }
  },
  data() {
    return {
      isSaving: false,
      activedTab: 'arguments',
      allowEditParam: 0,
      actionData: { arguments: {} },
      triggerStatusList: [
        { value: 'conflict', text: this.$t('page.conflict') },
        { value: 'failed', text: this.$t('page.fail') },
        { value: 'finish', text: this.$t('page.finish') },
        { value: 'closed', text: this.$t('term.rdm.isclosed') }
      ],
      appModuleList: [],
      actionDialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: false,
        width: '65%'
      },
      actionFormConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('term.codehub.actionname'),
          maxlength: 50,
          validateList: [
            'required', 
            'name-special',
            { name: 'searchUrl',
              url: '/api/rest/codehub/mergerequest/action/save', 
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('page.name')}),
              params: { id: this.id}
            }],
          onChange: name => {
            this.actionData.name = name;
          }
        },
        {
          type: 'slot',
          name: 'triggerStatus',
          label: this.$t('term.deploy.triggerstate'),
          validateList: ['required']
        },
        {
          type: 'select',
          name: 'appSystemId',
          label: this.$t('term.codehub.triggersystem'),
          url: '/api/rest/codehub/appsystem/search',
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          search: true,
          onChange: val => {
            this.actionData.appSystemId = val;
            this.actionData.appModuleId = null;
            this.actionData.versionId = null;
            this.actionFormConfig.forEach(element => {
              if (element.name == 'versionId') {
                element.params = {
                  appSystemId: val || -1,
                  appModuleId: null
                };
              }
            });
            this.changeAppModule();
          }
        },
        {
          type: 'select',
          label: this.$t('term.codehub.triggerappmodule'),
          name: 'appModuleId',
          isHidden: false,
          transfer: true,
          value: this.appModuleId,
          dealDataByUrl: this.$utils.getAppForselect,
          dynamicUrl: '/api/rest/deploy/app/config/module/list',
          onChange: val => {
            this.actionData.appModuleId = val;
          }
        },
        {
          type: 'select',
          name: 'versionId',
          label: this.$t('term.codehub.triggerversion'),
          dynamicUrl: '/api/rest/codehub/version/search',
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'version',
          search: true,
          value: null,
          params: {
            appSystemId: null,
            appModuleId: null
          },
          onChange: val => {
            this.actionData.versionId = val;
          }
        },
        {
          type: 'text',
          name: 'targetBranch',
          label: this.$t('page.targetbranch'),
          desc: this.$t('term.codehub.targetbranchdesc'),
          clearable: true,
          onChange: val => {
            this.actionData.targetBranch = val;
          }
        },
        {
          type: 'radio',
          name: 'isActive',
          label: this.$t('page.enable'),
          default: 1,
          dataList: [
            { text: this.$t('page.yes'), value: 1 },
            { text: this.$t('page.no'), value: 0 }
          ],
          onChange: isActive => {
            this.actionData.isActive = isActive;
          }
        },
        { type: 'slot', name: 'arguments', label: this.$t('term.inspect.sendanemail') }
      ],
      statusConfig: {
        validateList: ['required'],
        search: true,
        width: '55%',
        multiple: true
      },
      appModuleConfig: {
        search: true,
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        onChange: val => {
          this.actionData.versionId = null;
          this.actionFormConfig.forEach(element => {
            if (element.name == 'versionId') {
              element.params = {
                appSystemId: this.actionData.appSystemId || -1,
                appModuleId: val || 0
              };
            }
          });
        }
      }
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
    getAction: function(id) {
      if (id) {
        this.$api.codehub.merge.getActionById({ id: id }).then(res => {
          if (res.Status == 'OK') {
            this.actionData = res.Return;
            this.changeAppModule();
            this.actionData.triggerStatus = JSON.parse(this.actionData.triggerStatus);
            this.actionFormConfig.forEach(element => {
              element.value = this.actionData[element.name];
            });
          }
        });
      } else {
        this.appModuleList = [];
        this.actionData = {
          id: null,
          name: '',
          triggerStatus: null,
          appSystemId: null,
          appModuleId: null,
          versionId: null,
          targetBranch: null,
          isActive: 1,
          arguments: {}
        };
        this.actionFormConfig.forEach(element => {
          element.value = this.actionData[element.name];
        });
      }
    },
    changeAppModule() {
      if (this.actionData.appSystemId) {
        this.actionFormConfig.forEach(fo => {
          if (fo.name == 'appModuleId') {
            this.$set(fo, 'params', { appSystemId: this.actionData.appSystemId });
            this.$set(fo, 'dynamicUrl', '/api/rest/deploy/app/config/module/list');
          }
        });
        this.actionFormConfig.forEach(element => {
          if (element.name == 'versionId') {
            this.$set(element, 'params', { appSystemId: this.actionData.appSystemId, appModuleId: this.actionData.appModuleId });
            this.$set(element, 'dynamicUrl', '/api/rest/codehub/version/search');
          }
        });
      } else {
        this.actionFormConfig.forEach(fo => {
          if (fo.name == 'appModuleId') {
            this.$set(fo, 'params', {});
            this.$set(fo, 'dynamicUrl', '');
            // this.showSub(true);
          }
        });
      }
    },
    setArguments: function(argumentSettingForm) {
      this.actionData.arguments = JSON.stringify(argumentSettingForm);
    },
    saveAction: function() {
      let form = this.$refs['actionForm'];
      let form2 = this.$refs.argument.$refs['argumentSettingForm'];
      if (form.valid() && form2.valid()) {
        this.isSaving = true;
        this.$api.codehub.merge
          .saveAction(this.actionData)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.close(true);
            }
          })
          .finally(() => {
            this.isSaving = false;
          });
      }
    },
    isReset() {
      this.actionData = { arguments: {} };
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
      this.$refs.actionForm && this.$refs.actionForm.resetForm();
      this.actionData = { arguments: {} };
      this.actionData.isActive = 1;
    }
  },
  filter: {},
  computed: {},
  watch: {
    id: {
      handler: function(val) {
        this.getAction(val);
      },
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
