<template>
  <div>
    <TsDialog
      v-if="actionData"
      v-bind="actionDialogConfig"
      :is-show="isShow"
      @on-close="close"
    >
      <template v-slot:header>
        <div v-if="actionData.id">编辑配置</div>
        <div v-if="!actionData.id">添加配置</div>
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
          <!--<template v-slot:targetBranch>
            <TsFormSelect
              ref="targetBranch"
              v-model="actionData.targetBranch"
              v-bind="branchConfig"
              :dataList="targetBranchList"
            />
          </template>-->
          <template v-slot:arguments>
            <Tabs v-model="activedTab" name="actionEditTabs">
              <TabPane label="参数设置" name="arguments" tab="actionEditTabs">
                <Argument ref="argument" :action="actionData" @setArguments="setArguments"></Argument>
              </TabPane>
              <TabPane label="参数说明" name="param" tab="actionEditTabs">
                <Helpparam></Helpparam>
              </TabPane>
            </Tabs>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" :loading="isSaving" @click="saveAction()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import Argument from './argument-edit.vue';
import Helpparam from './helpparam.vue';

export default {
  components: {
    TsForm,
    TsFormSelect,
    Argument,
    Helpparam
  },
  props: {
    uuid: { type: Number },
    isShow: { type: Boolean, default: false }
  },
  data() {
    var _this = this;
    return {
      isSaving: false,
      activedTab: 'arguments',
      allowEditParam: 0,
      actionData: { arguments: {} },
      triggerStatusList: [
        { value: 'conflict', text: '冲突' },
        { value: 'failed', text: '失败' },
        { value: 'finish', text: '结束' },
        { value: 'closed', text: '已关闭' }
      ],
      subSystemList: [],
      //targetBranchList: [],
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
          label: '动作名称：',
          maxlength: 50,
          validateList: ['required'],
          width: '30%',
          onChange: function(name) {
            _this.actionData.name = name;
          }
        },
        { type: 'slot', name: 'triggerStatus', label: '触发状态：', validateList: ['required'] },
        {
          type: 'select',
          name: 'systemUuid',
          label: '触发系统：',
          width: '30%',
          url: '/api/rest/codehub/system/search',
          rootName: 'list',
          valueName: 'uuid',
          textName: 'name',
          search: true,
          onChange: function(val) {
            _this.actionData.systemUuid = val;
            _this.actionData.subSystemUuid = '';
            _this.actionData.versionUuid = '';
            _this.actionFormConfig.forEach(element => {
              if (element.name == 'versionUuid') {
                element.params = {
                  systemUuid: val || -1,
                  subSystemUuid: 0
                };
              }
            });
            _this.changeSubsys();
          }
        },
        { type: 'slot', name: 'subSystemUuid', label: '触发子系统：' },
        {
          type: 'select',
          name: 'versionUuid',
          label: '触发版本：',
          width: '30%',
          url: '/api/rest/codehub/version/search',
          rootName: 'list',
          valueName: 'uuid',
          textName: 'name',
          search: true,
          params: {
            systemUuid: -1,
            subSystemUuid: -1
          },
          onChange: function(val) {
            _this.actionData.versionUuid = val;
            //_this.actionData.targetBranch = '';
            //_this.getTargetBranch();
          }
        },
        {
          type: 'text',
          name: 'targetBranch',
          label: '目标分支：',
          width: '30%',
          desc: '用英文逗号分隔输入多个分支，支持通配符匹配',
          clearable: true,
          onChange: function(val) {
            _this.actionData.targetBranch = val;
          }
        },
        {
          type: 'radio',
          name: 'isActive',
          label: '激活：',
          default: 1,
          dataList: [
            { text: '是', value: 1 },
            { text: '否', value: 0 }
          ],
          onChange: function(isActive) {
            _this.actionData.isActive = isActive;
          }
        },
        { type: 'slot', name: 'arguments', label: '发送邮件：' }
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
        rootName: 'list',
        valueName: 'uuid',
        textName: 'name',
        onChange: function(val) {
          _this.actionData.versionUuid = '';
          _this.actionFormConfig.forEach(element => {
            if (element.name == 'versionUuid') {
              element.params = {
                systemUuid: _this.actionData.systemUuid || -1,
                subSystemUuid: val || 0
              };
            }
          });
        }
      }
      /*branchConfig: {
        clearable: false,
        search: true,
        width: '30%',
        multiple: true
      }*/
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
            //this.getTargetBranch();
            this.actionData.triggerStatus = JSON.parse(this.actionData.triggerStatus);
            //this.actionData.targetBranch = JSON.parse(this.actionData.targetBranch);
            this.actionFormConfig.forEach(element => {
              element.value = this.actionData[element.name];
            });
          }
        });
      } else {
        this.subSystemList = [];
        //this.targetBranchList = [];
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
      let _this = this;
      if (_this.actionData.systemUuid) {
        this.$axios({
          method: 'post',
          url: '/balantflow/api/rest/codehub/subsystem/search',
          data: {
            systemId: this.actionData.systemUuid
          }
        }).then(res => {
          _this.subSystemList = res.data.Return.list;

          this.actionFormConfig.forEach(element => {
            if (element.name == 'versionUuid') {
              element.value = _this.actionData.versionUuid;
            }
          });
        });
      } else {
        this.subSystemList = [];
      }
    },
    /*getTargetBranch: function() {
      var _this = this;
      if (this.actionData.versionUuid) {
        let param = { uuid: this.actionData.versionUuid, expandBranch: true };
        _this.$api.codehub.version.getDetail(param, {}).then(res => {
          if (res && res.Status == 'OK') {
            _this.versionData = res.Return;
            if (_this.versionData.targetBranchList) {
              _this.targetBranchList = _this.versionData.targetBranchList || [];
            }
          } else {
            _this.targetBranchList = [];
          }
        });
      }
    },*/

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
              this.$Message.success('保存成功');
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
