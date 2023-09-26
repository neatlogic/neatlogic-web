<template>
  <div class="datacenter-edit">
    <TsFormItem :label="$t('term.process.catalog')" required>
      <template v-if="applicationType === 'basicservices' || applicationType === 'network'">
        {{ baseServiceConfig.resourceName }}
        <Button type="primary" ghost @click="addService()">
          <span class="tsfont-plus">服务</span>
        </Button>
      </template>
      <template v-else>
        <Button type="primary" ghost @click="addService()">
          <span class="tsfont-plus">服务</span>
        </Button>
      </template>
    </TsFormItem>
    <TsFormItem :label="$t('page.node')">
      <div v-if="applicationType === 'basicservices' || applicationType === 'network'">
        <Tag v-if="!$utils.isEmpty(baseServiceConfig)">
          <span>{{ baseServiceConfig.typeLabel }}({{ baseServiceConfig.typeName }})[{{ baseServiceConfig.ip }}{{ baseServiceConfig.port?':'+baseServiceConfig.port:'' }}]</span>
        </Tag>
      </div>
    </TsFormItem>
    <TsFormItem label="公共服务">
      <div v-for="(item, i) in publicApplicationList" :key="i" class="pb-sm">
        <Tag closable @on-close="delpublicApp(item,i )">
          <span>{{ item.typeLabel }}({{ item.typeName }})[{{ item.ip }}{{ item.port?':'+item.port:'' }}]</span>
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
      @close="closeService"
    ></AddServiceDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    AddServiceDialog: resolve => require(['./add-service-dialog.vue'], resolve),
    HaSceneDialog: resolve => require(['./ha-scene-dialog.vue'], resolve)
  },
  props: {
    data: {
      type: Object,
      default: () => {}
    },
    applicationType: {
      type: String,
      default: ''
    },
    basicservicesTypeIdList: Array,
    networkTypeIdList: Array,
    allBaseTypeIdList: {
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
      appServiceConfig: {}
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
    addService() {
      if (this.applicationType === 'basicservices' || this.applicationType === 'network') {
        this.isMultipleService = false;
        if (this.applicationType === 'basicservices') {
          this.typeIdList = this.basicservicesTypeIdList || [];
        } else {
          this.typeIdList = this.networkTypeIdList || [];
        }
      }
      this.isShowServiceDialog = true;
    },
    addPublicService() {
      this.typeIdList = this.allBaseTypeIdList;
      this.isMultipleService = true;
      this.isShowServiceDialog = true;
    },
    closeService(list) {
      if (this.isMultipleService) {
        list && (this.publicApplicationList = list);
      } else {
        if (list && list[0]) {
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
      console.log(index, 'index', this.customParamList);
      this.customParamList.splice(index, 1);
    },
    getData() {
      let data = {
        datacenterId: this.data.id,
        datacenterName: this.data.name,
        config: {
          filter: {},
          publicApplicationIdList: this.$utils.mapArray(this.publicApplicationList, 'id'),
          publicApplicationList: this.publicApplicationList,
          customParamList: this.customParamList,
          highAvailabilitySceneList: this.highAvailabilitySceneList
        }
      };
      if (this.applicationType === 'basicservices' || this.applicationType === 'network') {
        this.$set(data.config, 'filter', this.baseServiceConfig);
      } else {
        this.$set(data.config, 'filter', this.appServiceConfig);
      }
      return data;
    }
   
  },
  filter: {},
  computed: {},
  watch: {
    data: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.publicApplicationIdList = val.publicApplicationIdList || [];
          this.customParamList = val.customParamList || [];
          this.highAvailabilitySceneList = val.highAvailabilitySceneList || [];
          this.filter = val.filter || {};
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
