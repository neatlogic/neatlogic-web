<template>
  <div class="autonode-setting">
    <!-- 表单场景 -->
    <FormsceneSetting
      v-model="configData.stepConfig"
      :formConfig="formConfig"
      :toSetting="toSetting"
      @updateScene="updateScene"
    ></FormsceneSetting>
    <AuthoritySetting
      :list="authorityList"
      :defaultIsActive="activeSetting.permission"
      :nodeConfig="nodeConfig"
      @updateauthority="updateauthority"
    ></AuthoritySetting>
    <NoticeSetting
      ref="NoticeSetting"
      v-model="activeSetting.informSetting"
      :formUuid="formUuid"
      :config="notifyPolicyConfig"
      :nodeConfig="nodeConfig"
    ></NoticeSetting>
    <ButtonSetting
      :defaultIsActive="activeSetting.buttonStatus"
      :defaultCustomButtonList="customButtonList"
      :defaultCustomStatusList="customStatusList"
      :defaultReplaceableTextList="replaceableTextList"
      :nodeConfig="nodeConfig"
      @updatebutton="updatebutton"
    ></ButtonSetting>

    <div class="permission-list">
      <div v-if="formConfig && formConfig.uuid" class="list">
        <div class="second-title text-grey require-label">{{ $t('page.invokeformcomponent') }}</div>
        <div>
          <TsFormSelect
            ref="handlerList"
            v-model="handlerList"
            :dataList="getHandlerlist(previewFormContent,cientityDisabledlist)"
            v-bind="handlerConfig"
          ></TsFormSelect>
        </div>
      </div>
      <div v-else class="text-tip">
        当前流程未关联任何表单，请前往
        <a href="javascript:void(0);" @click="toSetting">流程设置</a>
        关联表单
      </div>
    </div>
    <AssignSetting
      id="assignData"
      ref="assignData"
      :prevNodes="prevNodes"
      :formUuid="formUuid"
      :defaultWorkerPolicyConfig="workerPolicyConfig"
      :toSetting="toSetting"
    ></AssignSetting>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import nodemixin from '@/views/pages/process/flow/flowedit/components/nodemixin.js';
import itemmixin from '@/views/pages/process/flow/flowedit/components/itemmixin.js';
export default {
  name: '',
  components: {
    TsFormSelect,
    AssignSetting: () => import('@/views/pages/process/flow/flowedit/components/nodesetting/assign-setting'),
    NoticeSetting: () => import('@/views/pages/process/flow/flowedit/components/nodesetting/notice-setting.vue'),
    AuthoritySetting: () => import('@/views/pages/process/flow/flowedit/components/nodesetting/authority-setting.vue'),
    ButtonSetting: () => import('@/views/pages/process/flow/flowedit/components/nodesetting/button-setting.vue'),
    FormsceneSetting: () => import('@/views/pages/process/flow/flowedit/components/nodesetting/formscene-setting') // 表单场景
  },
  filters: {},
  mixins: [nodemixin, itemmixin],
  props: [''],
  data() {
    let _this = this;
    return {
      configData: {stepConfig: {}}, //当前节点数据
      handlerConfig: {
        valueName: 'uuid',
        textName: 'label',
        clearable: false,
        multiple: true,
        transfer: true,
        validateList: ['required'],
        border: 'border'
      },
      handlerList: [],
      previewFormContent: null,
      formUuid: _this.formConfig && _this.formConfig.uuid ? _this.formConfig.uuid : '', //表单id
      activeSetting: {
        //开关设置
        permission: 0, //权限设置开关
        buttonStatus: 0, //按钮状态设置
        informSetting: 0 //通知设置
      },
      authorityList: [], //权限
      notifyPolicyConfig: {}, //通知
      customButtonList: [], //按钮
      customStatusList: [], //工单状态映射
      replaceableTextList: [], //文案映射
      workerPolicyConfig: {}, //预设处理人
      cientityDisabledlist: [] //不能选择的表单组件列表
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.keyList = ['authorityList', 'customStatusList', 'customButtonList', 'replaceableTextList', 'notifyPolicyConfig', 'workerPolicyConfig'];//stepConfig 需要包含的数据
    this.getNodeSetting();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getNodeSetting() {
      //初始化节点数据
      if (!this.nodeConfig) {
        return;
      }
      let config = this.configData = this.$utils.deepClone(this.nodeConfig);
      this.initNodeData(config, this.keyList);//初始化数据
    },
    saveNodeData() {
      //保存数据
      let stepConfig = Object.assign({}, this.configData.stepConfig);
      if (this.keyList && this.keyList.length) {
        this.keyList.forEach(item => {
          stepConfig[item] = this[item] || undefined;
        });
      }

      Object.assign(stepConfig, {
        handlerList: this.handlerList || []
      });

      if (this.activeSetting.informSetting == 1) {
        //通知
        stepConfig.notifyList = this.notifyList;
        let data = this.$refs.NoticeSetting.getData();
        stepConfig.notifyPolicyConfig = data;
      }
      if (this.$refs.assignData) {
        stepConfig.workerPolicyConfig = this.$refs.assignData.saveAssignData();
      }
      return stepConfig;
    },

    nodeValid(href) {
      //校验
      let querySelect = href.substring(1);
      this.$nextTick(() => {
        if (querySelect != 'assignData') {
          this.$refs[`${querySelect}`] && this.$refs[`${querySelect}`].valid();
        } else {
          this.$refs.assignData.assignValid();
        }
      });
    }
  },
  computed: {
    getHandlerlist() {
      return function(config, lists) {
        let list = [];
        if (config) {
          if (config.controllerList && config.controllerList.length > 0) {
            let alllist = JSON.parse(JSON.stringify(config.controllerList));
            list = alllist.filter((c) => {
              if (lists.length > 0 && lists.indexOf(c.uuid) > -1) {
                this.$set(c, '_disabled', true);
              }
              return c.handler == 'formcientityselector';
            });
          } else if (config._type === 'new') {
            //新表单
            let tableList = JSON.parse(JSON.stringify(config.tableList));
            list = tableList.filter((c) => {
              if (lists.length > 0 && c.component && lists.indexOf(c.component.uuid) > -1) {
                this.$set(c, '_disabled', true);
              }
              return c.component && c.component.handler == 'formcientitymodify';
            })
              .map(item => {
                return item.component;
              })
            ;
          }
        }

        return list;
      };
    }
  },
  watch: {
    'configData.stepConfig': {
      handler: function(val) {
        if (val && val.handlerList) {
          this.handlerList = val.handlerList || [];
        }
      },
      immediate: true,
      deep: true
    },
    stepList: {
      handler: function(val) {
        this.cientityDisabledlist = [];
        if (val && val.length > 0) {
          let sameList = val.filter((v) => {
            return v.handler == this.configData.handler && this.configData.uuid != v.uuid;
          });
          if (sameList.length > 0) {
            sameList.forEach((s) => {
              if (s.stepConfig && s.stepConfig.handlerList && s.stepConfig.handlerList.length > 0) {
                let oldList = JSON.parse(JSON.stringify(this.cientityDisabledlist));
                this.$set(this, 'cientityDisabledlist', this.$utils.concatArr(oldList, s.stepConfig.handlerList));
              }
            });
          }
        }
      },
      immediate: true,
      deep: true
    },
    formUuid: {
      handler: function(val) {
        if (val) {
          this.getFormItem(val);
        } else {
          this.previewFormContent = null;
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.permission-list {
  > .notice {
    padding: 8px 16px;
  }
}
</style>
