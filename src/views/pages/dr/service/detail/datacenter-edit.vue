<template>
  <div class="datacenter-edit">
    <TsFormItem :label="$t('term.process.catalog')" required>
      <template v-if="!$utils.isEmpty(baseServiceConfig)">
        {{ baseServiceConfig.resourceName }}
      </template>
      <template v-else-if="!$utils.isEmpty(appServiceConfig)">
        {{ appServiceConfig.appSystemName }}/{{ appServiceConfig.appModuleName }}/{{ appServiceConfig.envName }}
      </template>
      <Button
        v-if="$utils.isEmpty(baseServiceConfig) && $utils.isEmpty(appServiceConfig)"
        type="primary"
        ghost
        @click="addService()"
      >
        <span class="tsfont-plus">服务</span>
      </Button>
      <span v-else class="tsfont-edit text-href pl-xs" @click="addService()"></span>
    </TsFormItem>
    <TsFormItem :label="$t('page.node')">
      <div v-if="!$utils.isEmpty(nodeList)">
        <Tag v-for="(item, index) in nodeList" :key="index">
          <span>{{ item.typeLabel }}
            <span v-if="item.typeName">({{ item.typeName }})</span>
            <span v-if="item.ip">[{{ item.ip }}{{ item.port?':'+item.port:'' }}]</span>
          </span>
        </Tag>
      </div>
      <div v-else>-</div>
    </TsFormItem>
    <TsFormItem label="公共服务">
      <div v-for="(item, i) in publicApplicationList" :key="i" class="pb-sm">
        <Tag closable @on-close="delpublicApp(item,i )">
          <span>{{ item.typeLabel }}
            <span v-if="item.typeName">({{ item.typeName }})</span>
            <span v-if="item.ip">[{{ item.ip }}{{ item.port?':'+item.port:'' }}]</span>
          </span>
        </Tag>
      </div>
      <Button type="primary" ghost @click="addPublicService()">
        <span class="tsfont-plus">公共服务</span>
      </Button>
    </TsFormItem>
    <TsFormItem :label="$t('term.deploy.customparameter')">
      <div v-for="(item,index) in customParamList" :key="index" class="pb-sm params">
        <TsRow :gutter="0">
          <Col span="12" class="pr-xs">
            <TsFormInput v-model="item.key" border="border"></TsFormInput>
          </Col>
          <Col span="12">
            <TsFormInput v-model="item.value" border="border"></TsFormInput>
          </Col>
        </TsRow>
        <div v-if="customParamList.length > 0" class="tsfont-trash-o text-tip-active del-icon" @click="delParam(index)"></div>
      </div>
      <Button type="primary" ghost>
        <span class="tsfont-plus" @click="addParam()">{{ $t('page.param') }}</span>
      </Button>
    </TsFormItem>
    <TsFormItem label="HA场景">
      <div v-if="highAvailabilitySceneList.length">
        <Tag
          v-for="(item, i) in highAvailabilitySceneList"
          :key="i"
          closable
          class="pr-xs pb-sm"
          @on-close="delScene(item,i )"
        >
          <span>{{ item.sceneName }}[{{ item.combopName }}]</span>
        </Tag>
      </div>
      <Button type="primary" ghost @click="addScene()">
        <span class="tsfont-plus">{{ $t('page.scene') }}</span>
      </Button>
    </TsFormItem>
    <HaSceneDialog v-if="isShowSceneDialog" :list="highAvailabilitySceneList" @close="closeSceneDialog"></HaSceneDialog>
    <AddServiceDialog
      v-if="isShowServiceDialog"
      :typeIdList="typeIdList"
      :multiple="isMultipleService"
      :selectNodeList="selectNodeList"
      @close="closeService"
    ></AddServiceDialog>
    <AppServiceDialog v-if="isShowAppServiceDialog" :data="appServiceConfig" @close="closeAppService"></AppServiceDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    AddServiceDialog: resolve => require(['./add-service-dialog.vue'], resolve),
    HaSceneDialog: resolve => require(['./ha-scene-dialog.vue'], resolve),
    AppServiceDialog: resolve => require(['./app-service-dialog.vue'], resolve)
  },
  props: {
    applicationType: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: () => {}
    },
    ciList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      filter: {}, //服务条件
      publicApplicationIdList: [], //公共服务id
      publicApplicationList: [],
      customParamList: [
        {
          value: '',
          key: ''
        }
      ], //自定义参数
      highAvailabilitySceneList: [], //HA场景
      isShowSceneDialog: false,
      isShowServiceDialog: false,
      isMultipleService: false,
      typeIdList: [], //模型类型
      baseServiceConfig: {},
      appServiceConfig: {},
      allBaseTypeIdList: [],
      nodeList: [], //选中的节点
      selectNodeList: [],
      isShowAppServiceDialog: false,
      basicservicesTypeIdList: [],
      networkTypeIdList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      let findItem = this.ciList.find(item => item.name === this.applicationType);
      if (findItem) {
        this.typeIdList = findItem.ciIdList;
      }
      let basicservicesConfig = this.ciList.find(item => item.name === 'basicservices');
      let networkConfig = this.ciList.find(item => item.name === 'network');
      this.basicservicesTypeIdList = basicservicesConfig.ciIdList || [];
      this.networkTypeIdList = networkConfig.ciIdList || [];
      let allList = this.basicservicesTypeIdList.concat(this.networkTypeIdList);
      this.allBaseTypeIdList = this.$utils.uniqueArr(allList);
    },
    addService() {
      this.selectNodeList = [];
      this.typeIdList = [];
      if (this.applicationType === 'basicservices' || this.applicationType === 'network') {
        if (this.applicationType === 'basicservices') {
          this.typeIdList = this.basicservicesTypeIdList;
        } else {
          this.typeIdList = this.networkTypeIdList;
        }
        if (!this.$utils.isEmpty(this.baseServiceConfig)) {
          this.selectNodeList.push({
            id: this.baseServiceConfig.resourceId
          });
        }
        this.isMultipleService = false;
        this.isShowServiceDialog = true;
      } else {
        this.isShowAppServiceDialog = true;
      }
    },
    addPublicService() {
      this.typeIdList = this.allBaseTypeIdList;
      this.selectNodeList = this.publicApplicationList;
      this.isMultipleService = true;
      this.isShowServiceDialog = true;
    },
    closeService(list) {
      if (this.isMultipleService) {
        list && (this.publicApplicationList = list);
      } else {
        if (list && list[0]) {
          this.nodeList = list;
          this.baseServiceConfig = {
            resourceId: list[0].id,
            resourceName: list[0].name,
            ip: list[0].ip,
            port: list[0].port,
            typeLabel: list[0].typeLabel,
            typeName: list[0].typeName
          };
        }
      }
      this.isShowServiceDialog = false;
    },
    delpublicApp(item, i) {
      this.publicApplicationList.splice(i, 1);
    },
    addScene() {
      this.currentScene;
      this.isShowSceneDialog = true;
    },
    closeSceneDialog(item) {
      if (item) {
        this.highAvailabilitySceneList.push(item);
      }
      this.isShowSceneDialog = false;
    },
    delScene(item, i) {
      this.highAvailabilitySceneList.splice(i, 1);
    },
    addParam() {
      this.customParamList.push({
        value: '',
        key: ''
      });
    },
    delParam(index) {
      this.customParamList.splice(index, 1);
    },
    getData() {
      let data = {
        datacenterId: this.data.datacenterId,
        datacenterName: this.data.datacenterName,
        config: {
          filter: {},
          publicApplicationIdList: this.$utils.mapArray(this.publicApplicationList, 'id'),
          publicApplicationList: this.publicApplicationList,
          customParamList: this.customParamList,
          highAvailabilitySceneList: this.highAvailabilitySceneList,
          nodeList: this.nodeList
        }
      };
      if (this.applicationType === 'basicservices' || this.applicationType === 'network') {
        this.$set(data.config, 'filter', this.baseServiceConfig);
      } else {
        this.$set(data.config, 'filter', this.appServiceConfig);
      }
      return data;
    },
    valid() {
      let isValid = true;
      if (this.applicationType === 'basicservices' || this.applicationType === 'network') {
        if (!this.baseServiceConfig.resourceId) {
          isValid = false;
        }
      } else {
        if (this.$utils.isEmpty(this.appServiceConfig.typeIdList)) {
          isValid = false;
        }
      }
      return isValid;
    },
    closeAppService(data, nodeList) {
      data && (this.appServiceConfig = data);
      nodeList && (this.nodeList = nodeList);
      this.isShowAppServiceDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {
    data: {
      handler(val) {
        if (val && val.config) {
          this.publicApplicationIdList = val.config.publicApplicationIdList || [];
          this.publicApplicationList = val.config.publicApplicationList || [];
          this.customParamList = val.config.customParamList || [];
          this.highAvailabilitySceneList = val.config.highAvailabilitySceneList || [];
          this.filter = val.config.filter || {};
          if (this.applicationType === 'basicservices' || this.applicationType === 'network') {
            this.baseServiceConfig = this.filter;
          } else {
            this.appServiceConfig = this.filter;
          }
          this.nodeList = val.config.nodeList || [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.datacenter-edit {
  padding-right: 24px;
}
.params {
  position: relative;
  .del-icon {
    position: absolute;
    right: -20px;
    top: 0;
  }
}
</style>
