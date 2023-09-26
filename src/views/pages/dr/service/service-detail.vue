<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain v-if="!loadingShow" enableDivider>
      <template v-slot:navigation>
        <span class="ts-angle-left text-action" @click="$back('/service-manage')">{{ $getFromPage('服务清单') }}</span>
      </template>
      <template v-slot:top>
        <div>
          <span>{{ serviceData.name }}</span>
          <Divider type="vertical" />
          <span class="pr-sm">RTO <span v-if="serviceData.recoveryTimeObjective" class="pl-xs">{{ serviceData.recoveryTimeObjective }}min</span></span>
          <span class="pr-sm">RPO <span v-if="serviceData.recoveryPointObjective" class="pl-xs">{{ serviceData.recoveryPointObjective }}min</span></span>
          <span class="tsfont-edit text-action" @click="editBaseInfo()"></span>
        </div>
      </template>
      <template v-slot:content>
        <div class="pt-nm">
          <Divider orientation="start">场景预案</Divider>
          <div class="pt-nm pb-nm">
            <Scene :sceneList="serviceData.sceneList" @editScene="editScene" @deleteScene="deleteScene"></Scene>
          </div>
          <Divider orientation="start">{{ $t('term.inspect.datacenter') }}</Divider>
          <div class="pt-nm pb-nm">
            <Datacenter :list="serviceData.dataCenterList" @update="getServiceData()"></Datacenter>
          </div>
          <Divider orientation="start">我依赖的服务</Divider>
          <div class="pt-nm pb-nm">
            <Service
              :serviceId="id"
              :list="serviceData.dependencyOnServiceList"
              :sceneList="serviceData.sceneList"
              @editService="editService"
              @update="getServiceData()"
            ></Service>
          </div>
          <Divider orientation="start">依赖我的服务</Divider>
          <div class="pt-nm pb-nm">
            <Service :list="serviceData.dependencyOnMeServiceList" readonly></Service>
          </div>
        </div>
      </template>
    </TsContain>
    <TsDialog
      title="编辑"
      type="modal"
      :isShow.sync="isShowBaseInfo"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div v-if="isShowBaseInfo">
          <Baseinfo ref="baseinfo" type="edit" :config="$utils.deepClone(serviceData)"></Baseinfo>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    Scene: resolve => require(['./detail/scene.vue'], resolve),
    Service: resolve => require(['./detail/service.vue'], resolve),
    Datacenter: resolve => require(['./detail/datacenter.vue'], resolve),
    Baseinfo: resolve => require(['./detail/baseinfo.vue'], resolve)
    
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      serviceData: {},
      isShowBaseInfo: false
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query && this.$route.query.id) {
      this.id = parseInt(this.$route.query.id);
      this.getServiceData();
    }
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
    getServiceData() {
      this.$api.dr.service.getService({
        id: this.id
      }).then((res) => {
        if (res.Status === 'OK') {
          console.log(res); 
          this.serviceData = res.Return || {};
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    editBaseInfo() {
      this.isShowBaseInfo = true;
    },
    saveServiceBaseinfo() {
      let baseSettings = this.$refs.baseinfo.getData();
      let data = {
        id: this.serviceData.id,
        name: baseSettings.name || '',
        orgId: baseSettings.orgId || '',
        recoveryTimeObjective: baseSettings.recoveryTimeObjective || null,
        recoveryPointObjective: baseSettings.recoveryPointObjective || null,
        configFilePathList: baseSettings.configFilePathList
      };
      this.$api.dr.service.saveServiceBaseinfo(data).then((res) => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.getServiceData();
        }
      });
    },
    okDialog() {
      this.saveServiceBaseinfo();
      this.closeDialog();
    },
    closeDialog() {
      this.isShowBaseInfo = false;
    },
    editScene(item) {
      if (item) {
        this.$api.dr.service.saveServiceScene({
          serviceId: this.id,
          sceneId: item.sceneId,
          combopId: item.combopId
        }).then((res) => {
          if (res.Status === 'OK') {
            this.getServiceData();
          }
        });
      }
    },
    deleteScene(item) {
      if (item) {
        this.$api.dr.service.deleteServiceScene({
          serviceId: this.id,
          sceneId: item.sceneId,
          combopId: item.combopId
        }).then((res) => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
            this.getServiceData();
          }
        });
      }
    },
    editService(item) {
      if (item) {
        this.$api.dr.service.saveServiceRelationship(item).then((res) => {
          if (res.Status === 'OK') {
            this.getServiceData();
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
