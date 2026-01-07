
<template>
  <div class="timerNode">
    <!-- 表单场景 -->
    <FormsceneSetting
      :value="configData.stepConfig"
      :formConfig="formConfig"
      :toSetting="toSetting"
      :nodeConfig="nodeConfig"
      @updateScene="changeFormScene"
    ></FormsceneSetting>
    <div class="permission-list require-label text-grey">
      {{ $t('term.process.circulationtime') }}
    </div>
    <div class="permission-list">
      <TsFormSelect
        ref="timerAttributeUuid"
        v-model="timerConfig.attributeUuid"
        :dataList="formDataList"
        :validateList="validateList"
        border="border"
        textName="label"
        valueName="uuid"
        :firstSelect="false"
      ></TsFormSelect>
      <div class="fz10 tsfont-info-o text-tip tip-time">{{ $t('term.process.circulationtimetip') }}</div>
    </div>
    <!-- 初步处理人 -->
    <div class="pt-md">
      <AssignSetting
        id="assignData"
        ref="assignData"
        :prevNodes="prevNodes"
        :formUuid="formUuid"
        :defaultWorkerPolicyConfig="workerPolicyConfig"
        :toSetting="toSetting"
      ></AssignSetting>
    </div>
  </div>
</template>
<script>
import AssignSetting from './nodesetting/assign-setting';
import nodemixin from './nodemixin.js';
import {store} from '../floweditState.js';

export default {
  name: 'Timer',
  components: {
    FormsceneSetting: () => import('./nodesetting/formscene-setting'), // 表单场景
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    AssignSetting
  },
  filters: {
  },
  mixins: [nodemixin],
  props: {
  },
  data() {
    let _this = this;
    return {
      formUuid: _this.formConfig && _this.formConfig.uuid ? _this.formConfig.uuid : '', //表单id
      configData: {stepConfig: {}}, //当前节点数据
      timerConfig: {
        type: 'form', //选择类型（暂时只有表单类型）
        value: '', //自定义的默认值
        attributeUuid: '' //表单组件的uuid
      },
      validateList: ['required'],
      formDataList: [],
      workerPolicyConfig: {},
      isFirst: true
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.keyList = ['workerPolicyConfig'];//stepConfig 需要包含的数据
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
      let defaultData = this.nodeConfig.stepConfig || {};
      let config = this.configData = this.$utils.deepClone(this.nodeConfig);
      this.initNodeData(config, this.keyList);//初始化数据
      if (!this.$utils.isEmptyObj(defaultData)) {
        Object.keys(defaultData).forEach(key => {
          this.timerConfig[key] = defaultData[key];
        });
      }
      if (this.isFirst) {
        this.getFormTimeList();
        this.isFirst = false;
      }
    },
    saveNodeData() {
      let stepConfig = Object.assign({}, this.timerConfig);
      //分派处理人
      if (this.$refs.assignData) {
        stepConfig.workerPolicyConfig = this.$refs.assignData.saveAssignData();
      }
      stepConfig['formSceneUuid'] = this.configData.stepConfig.formSceneUuid || '';
      return stepConfig;
    },
    nodeValid(href) {
      let querySelect = href.substring(1);
      this.$nextTick(() => {
        if (querySelect != 'assignData') {
          this.$refs[`${querySelect}`].valid();
        } else {
          this.$refs.assignData && this.$refs.assignData.assignValid();
        }
      });
    },
    getFormTimeList() {
      let formItemList = [];
      const formConfig = this.currentFormConfig;
      if (this.$utils.isEmpty(formConfig)) {
        this.formDataList = [];
        this.timerConfig.attributeUuid = '';
        return;
      }

      const currentSceneUuid = this.configData?.stepConfig?.formSceneUuid || formConfig.defaultSceneUuid || formConfig.uuid;

      //如果场景不是默认场景，需要遍历场景下的所有组件
      if (currentSceneUuid && currentSceneUuid != formConfig.uuid) {
        let sceneConfig = formConfig.sceneList.find(item => item.uuid === currentSceneUuid);
        if (sceneConfig) {
          sceneConfig.tableList.forEach(item => {
            if (item.component) {
              if (item.component.inherit) {
                let component = this.allFormitemList.find(c => c.uuid === item.component.uuid);
                if (component) {
                  this.$set(item, 'component', component);
                }
              }
            
              if (item.component.hasValue) {
                formItemList.push(item.component);
              } else if (item.component.component && Array.isArray(item.component.component)) {
                if (!this.$utils.isEmpty(item.component.component)) {
                  formItemList.push(...item.component.component);
                }
              }
            }
          });
        }
      } 
      if (!formItemList.length && this.allFormitemList.length) {
        formItemList = this.allFormitemList;
      }
     
      this.formDataList = formItemList.filter(item => item.handler == 'formdate' && item.config.isRequired);
      if (this.timerConfig.attributeUuid) {
        let attributeUuid = this.formDataList.find(f => f.uuid == this.timerConfig.attributeUuid);
        !attributeUuid && (this.timerConfig.attributeUuid = '');
      }
    },
    changeFormScene(sceneConfig) {
      this.$set(this.configData.stepConfig, 'formSceneUuid', sceneConfig.value);
      this.getFormTimeList();
    }
  },
  computed: {
    allFormitemList() {
      return store.allFormitemList;
    },
    currentFormConfig() {
      return store.currentFormConfig;
    }
  },
  watch: {
    currentFormConfig: {
      handler(val) {
        if (!this.isFirst) {
          if (this.$utils.isEmpty(val)) {
            this.$set(this.configData.stepConfig, 'formSceneUuid', '');
          }
          this.getFormTimeList();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.permission-list{
  .tip-time {
    padding-top: 8px;
  }
}
</style>
