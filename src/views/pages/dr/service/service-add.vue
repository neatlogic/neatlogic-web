<template>
  <div>
    <TsContain>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <Button>{{ $t('page.cancel') }}</Button>
          </div>
          <div v-if="current > 0" class="action-item">
            <Button type="primary" ghost @click="next((current -= 1), true)">{{ $t('page.previousstep') }}</Button>
          </div>
          <div v-if="current === dataCenterList.length + 2" class="action-item">
            <Button type="primary" @click="save()">{{ $t('page.save') }}</Button>
          </div>
          <div v-if="current < dataCenterList.length + 2" class="action-item">
            <Button type="primary" ghost @click="next(current + 1)">{{ $t('page.thenextstep') }}</Button>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div class="service-add">
          <div v-if="!isShowSteps" class="pb-nm">
            <Steps :current="current">
              <Step :title="$t('page.basicinfo')"></Step>
              <template v-if="!$utils.isEmpty(dataCenterList)">
                <Step
                  v-for="(item, index) in dataCenterList"
                  :key="index"
                  :title="item.datacenterName"
                ></Step>
              </template>
              <Step title="场景"></Step>
              <Step title="服务依赖"></Step>
            </Steps>
          </div>
          <!-- 基本信息 -->
          <template v-if="!loadingShow">
            <div v-if="current === 0">
              <Baseinfo
                ref="baseinfo"
                :config="baseSettings"
                :dataCenterList="dataCenterList"
                @updateApplicationType="updateApplicationType"
                @updateDataCenter="changeDataCenter"
              ></Baseinfo>
            </div>
            <!-- 数据中心 -->
            <div v-if="current > 0 && current < dataCenterList.length + 1">
              <DatacenterEdit
                ref="datacenter"
                :data="currentDataCenter"
                :applicationType="applicationType"
                :ciList="ciList"
              ></DatacenterEdit>
            </div>
            <!-- 场景 -->
            <div v-if="current === (dataCenterList.length + 1)">
              <Scene ref="scene" :sceneList="sceneList" @deleteScene="deleteScene"></Scene>
            </div>
            <!-- 服务依赖 -->
            <div v-if="current === (dataCenterList.length + 2)">
              <Service
                :baseSettings="baseSettings"
                :firstBtn="true"
                :sceneList="sceneList"
                @update="updateServiceList"
                @delete="deleteServiceRelationship"
              ></Service>
            </div>
          </template>
        </div>
        <div class="flex-center pt-nm footer-btn">
          <div class="action-group">
            <div class="action-item">
              <Button @click="cancel()">{{ $t('page.cancel') }}</Button>
            </div>
            <div v-if="current > 0" class="action-item">
              <Button type="primary" ghost @click="next((current -= 1), true)">{{ $t('page.previousstep') }}</Button>
            </div>
            <div v-if="current === dataCenterList.length + 2" class="action-item">
              <Button type="primary" @click="save()">{{ $t('page.save') }}</Button>
            </div>
            <div v-if="current < dataCenterList.length + 2" class="action-item">
              <Button type="primary" ghost @click="next(current + 1)">{{ $t('page.thenextstep') }}</Button>
            </div>
          </div>
        </div>
        <!-- 校验 -->
        <ServiceValid v-model="validVisible" :validList="validList" @on-click="jumpToItem"></ServiceValid>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    Baseinfo: resolve => require(['./detail/baseinfo.vue'], resolve),
    Scene: resolve => require(['./detail/scene.vue'], resolve),
    Service: resolve => require(['./detail/service.vue'], resolve),
    DatacenterEdit: resolve => require(['./detail/datacenter-edit.vue'], resolve),
    ServiceValid: resolve => require(['./detail/service-valid-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: false,
      current: 0,
      baseSettings: {},
      dataCenterList: [],
      sceneList: [],
      applicationDependencyList: [], //服务依赖
      isShowSteps: false,
      validList: [],
      validVisible: false,
      basicservicesTypeIdList: [], //基础服务选的配置
      networkTypeIdList: [], ///网络选的配置
      applicationType: '',
      currentDataCenter: {} //当前编辑的数据中心
    };
  },
  beforeCreate() {},
  created() {
    this.getCiList();
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
    getCiList() {
      this.$api.dr.ci.getCiList().then(res => {
        if (res && res.Status == 'OK') {
          this.ciList = res.Return || [];
          let basicservicesConfig = res.Return.find(item => item.name === 'basicservices');
          let networkConfig = res.Return.find(item => item.name === 'network');
          this.basicservicesTypeIdList = basicservicesConfig.ciIdList;
          this.networkTypeIdList = networkConfig.ciIdList;
        }
      });
    },
    next(current) {
      if (this.$refs.baseinfo) {
        if (!this.$refs.baseinfo.valid()) {
          return;
        } else {
          this.baseSettings = this.$refs.baseinfo.getData() || {};
        }
      }
      if (this.$refs.scene) {
        this.sceneList = this.$refs.scene.getData();
      }
      if (current < this.current) {
        //校验资源中心
        if (this.$refs.datacenter && !this.$refs.datacenter.valid()) {
          this.$Notice.error({
            title: '错误信息',
            desc: '请选择服务'
          });
          return;
        }
        //场景必须添加一个
        if (this.$refs.scene && this.$utils.isEmpty(this.sceneList)) {
          this.$Notice.error({
            title: '错误信息',
            desc: '场景列表不能为空'
          });
          return;
        }
      }
      if (current > 0) {
        if (this.$refs.datacenter) {
          this.dataCenterList[current - 2] = this.$refs.datacenter.getData();
        }
        if (current <= this.dataCenterList.length) {
          this.currentDataCenter = this.dataCenterList[current - 1];
        }
      }
      this.loadingShow = true;
      this.current = current;
      this.$nextTick(() => {
        this.loadingShow = false;
      });
    },
    deleteScene(item, index) {
      this.sceneList.splice(index, 1);
    },
    updateApplicationType(val) {
      this.applicationType = val;
      if (!this.$utils.isEmpty(this.dataCenterList)) {
        this.dataCenterList.forEach(item => {
          let config = {
            filter: {},
            publicApplicationIdList: [],
            customParamList: [],
            highAvailabilitySceneList: []
          };
          if (!this.$utils.isEmpty(item.config)) {
            this.$set(config, 'publicApplicationIdList', config.publicApplicationIdList || []);
            this.$set(config, 'customParamList', config.customParamList || []);
            this.$set(config, 'highAvailabilitySceneList', config.highAvailabilitySceneList || []);
          }
          this.$set(item, 'config', config);
          if (val === 'basicservices') {
            this.$set(item.config.filter, 'typeIdList', this.basicservicesTypeIdList);
          } else if (val === 'network') {
            this.$set(item.config.filter, 'typeIdList', this.networkTypeIdList);
          }
        });
      }
    },
    updateServiceList(list) {
      this.applicationDependencyList = list;
    },
    deleteServiceRelationship(item, index) {
      this.applicationDependencyList.splice(index, 1);
    },
    getValid() {
      let validList = [];
      return validList;
    },
    getData() {
      let data = {
        ...this.baseSettings,
        dataCenterList: this.dataCenterList,
        sceneList: this.sceneList,
        applicationDependencyList: this.applicationDependencyList
      };
      return data;
    },
    save() {
      this.validList = this.getValid();
      if (!this.$utils.isEmpty(this.validList)) {
        this.validVisible = true;
        return;
      }
      let data = this.getData();
      this.$api.dr.service.saveService(data).then((res) => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$router.push({
            path: '/service-manage'
          });
        }
      });
    },
    changeDataCenter(selectedItem) {
      //改变关联数据中心需要更新步骤的数据
      this.isShowSteps = true;
      this.dataCenterList = [];
      selectedItem.forEach(item => {
        this.dataCenterList.push({
          datacenterId: item.id,
          datacenterName: item.name,
          config: {}
        });
      });
      this.$nextTick(() => {
        this.isShowSteps = false;
      });
    },
    cancel() {
      this.$createDialog({
        title: this.$t('dialog.title.cancelconfirm'),
        content: this.$t('dialog.content.cancelconfirm'),
        'on-ok': vnode => {
          vnode.isShow = false;
          this.$router.push({
            path: './service-manage'
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    jumpToItem() {

    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.service-add {
  width: 80%;
  margin: 0 auto;
}
.footer-btn {
  width: 100%;
}
</style>
