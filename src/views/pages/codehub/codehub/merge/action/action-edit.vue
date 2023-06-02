<template>
  <div>
    <TsDialog
      v-if="actionData"
      v-bind="actionDialogConfig"
      :is-show="isShow"
      @on-close="close"
    >
      <template v-slot:header>
        <div v-if="actionData.id">{{ $t('dialog.title.edittarget',{'target':$t('page.config')}) }}</div>
        <div v-if="!actionData.id">{{ $t('dialog.title.addtarget',{'target':$t('page.config')}) }}</div>
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
          <template slot="subSystemUuid">
            <TsFormSelect v-model="actionData.subSystemUuid" v-bind="subSystemConfig" :dataList="subSystemList" />
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
    uuid: { type: Number },
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
      subSystemList: [],
      actionDialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: false,
        width: '900px'
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
          validateList: ['required'],
          width: '30%',
          onChange: (name) => {
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
          name: 'systemUuid',
          label: this.$t('term.codehub.triggersystem'),
          width: '30%',
          url: '/api/rest/codehub/appsystem/search',
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          search: true,
          onChange: (val) => {
            this.actionData.systemUuid = val;
            this.actionData.subSystemUuid = '';
            this.actionData.versionUuid = '';
            this.actionFormConfig.forEach(element => {
              if (element.name == 'versionUuid') {
                element.params = {
                  systemUuid: val || -1,
                  subSystemUuid: 0
                };
              }
            });
            this.changeSubsys();
          }
        },
        { 
          type: 'slot', 
          name: 'subSystemUuid', 
          label: this.$t('term.codehub.triggersubsystem') 
        },
        {
          type: 'select',
          name: 'versionUuid',
          label: this.$t('term.codehub.triggerversion'),
          width: '30%',
          url: '/api/rest/codehub/version/search',
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          search: true,
          params: {
            systemUuid: -1,
            subSystemUuid: -1
          },
          onChange: (val) => {
            this.actionData.versionUuid = val;
          }
        },
        {
          type: 'text',
          name: 'targetBranch',
          label: this.$t('page.targetbranch'),
          width: '30%',
          desc: this.$t('term.codehub.targetbranchdesc'),
          clearable: true,
          onChange: (val) => {
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
          onChange: (isActive) => {
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
      subSystemConfig: {
        search: true,
        width: '30%',
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        onChange: (val) => {
          this.actionData.versionUuid = '';
          this.actionFormConfig.forEach(element => {
            if (element.name == 'versionUuid') {
              element.params = {
                systemUuid: this.actionData.systemUuid || -1,
                subSystemUuid: val || 0
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
            this.changeSubsys();
            this.actionData.triggerStatus = JSON.parse(this.actionData.triggerStatus);
            this.actionFormConfig.forEach(element => {
              element.value = this.actionData[element.name];
            });
          }
        });
      } else {
        this.subSystemList = [];
        this.actionData = {
          id: null,
          name: '',
          triggerStatus: null,
          systemUuid: '',
          subSystemUuid: '',
          versionUuid: '',
          targetBranch: null,
          isActive: 1,
          arguments: {}
        };
        this.actionFormConfig.forEach(element => {
          element.value = this.actionData[element.name];
        });
      }
    },
    changeSubsys() {
      if (this.actionData.systemUuid) {
        this.$axios({
          method: 'post',
          url: '/api/rest/codehub/appmodule/search',
          data: {
            systemId: this.actionData.systemUuid
          }
        }).then(res => {
          this.subSystemList = res.data.Return.list;

          this.actionFormConfig.forEach(element => {
            if (element.name == 'versionUuid') {
              element.value = this.actionData.versionUuid;
            }
          });
        });
      } else {
        this.subSystemList = [];
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
    uuid: {
      handler: function(val) {
        this.getAction(val);
      },
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
