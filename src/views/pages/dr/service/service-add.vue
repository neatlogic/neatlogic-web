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
        <div v-if="!loadingShow" class="service-add">
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
              <Step :title="$t('page.scene')"></Step>
              <Step :title="$t('term.dr.servicedependency')"></Step>
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
              <ServiceRelationship
                :baseSettings="baseSettings"
                :firstBtn="true"
                :sceneList="sceneList"
                @update="updateServiceList"
              ></ServiceRelationship>
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
    ServiceRelationship: resolve => require(['./detail/service-relationship.vue'], resolve),
    DatacenterEdit: resolve => require(['./detail/datacenter-edit.vue'], resolve)
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
      if (this.$refs.datacenter) {
        let datacenterConfig = this.$refs.datacenter.getData();
        this.dataCenterList.forEach(d => {
          if (d.datacenterId === datacenterConfig.datacenterId) {
            this.$set(d, 'config', datacenterConfig.config || {});
          }
        });
      }
      if (current > this.current) {
        //校验资源中心
        if (this.$refs.datacenter && !this.$refs.datacenter.valid()) {
          this.$Notice.error({
            title: this.$t('term.framework.errorinfo'),
            desc: this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.process.catalog')})
          });
          return;
        }
        //场景必须添加一个
        if (this.$refs.scene && this.$utils.isEmpty(this.sceneList)) {
          this.$Notice.error({
            title: this.$t('term.framework.errorinfo'),
            desc: this.$t('form.validate.required', {'target': this.$t('page.scene')})
          });
          return;
        }
      }
      if (current > 0) {
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
      let list = [];
      selectedItem.forEach(item => {
        let findItem = this.dataCenterList.find(d => d.datacenterId === item.id);
        if (findItem) {
          list.push(findItem);
        } else {
          list.push({
            datacenterId: item.id,
            datacenterName: item.name,
            config: {}
          });
        }
      });
      this.dataCenterList = list;
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
