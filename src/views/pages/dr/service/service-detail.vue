<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain v-if="!loadingShow" enableDivider>
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
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
          <Divider orientation="start">{{ $t('term.dr.scenarioplan') }}</Divider>
          <div class="pt-nm pb-nm">
            <Scene
              :sceneList="serviceData.sceneList"
              :serviceId="serviceId"
              @update="updateSceneList"
            ></Scene>
          </div>
          <Divider orientation="start">{{ $t('term.inspect.datacenter') }}</Divider>
          <div class="pt-nm pb-nm">
            <Datacenter
              :serviceId="serviceId"
              :list="serviceData.dataCenterList"
              :ciList="ciList"
              :applicationType="serviceData.applicationType"
              @update="getServiceData()"
            ></Datacenter>
          </div>
          <Divider orientation="start">{{ $t('term.dr.servicerelyon') }}</Divider>
          <div class="pt-nm pb-nm">
            <ServiceRelationship
              :serviceId="serviceId"
              :list="serviceData.dependencyOnServiceList"
              :sceneList="serviceData.sceneList"
              @update="getServiceData()"
            ></ServiceRelationship>
          </div>
          <Divider orientation="start">{{ $t('term.dr.relyonmyservices') }}</Divider>
          <div class="pt-nm pb-nm">
            <ServiceRelationship :list="serviceData.dependencyOnMeServiceList" readonly></ServiceRelationship>
          </div>
        </div>
      </template>
    </TsContain>
    <BaseinfoDialog
      v-if="isShowBaseInfo"
      :serviceData="serviceData"
      @saveBaseInfo="saveBaseInfo()"
      @close="closeBaseInfoDialog()"
    ></BaseinfoDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    Scene: resolve => require(['./detail/scene.vue'], resolve),
    ServiceRelationship: resolve => require(['./detail/service-relationship.vue'], resolve),
    Datacenter: resolve => require(['./detail/datacenter.vue'], resolve),
    BaseinfoDialog: resolve => require(['./detail/baseinfo-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      serviceId: null,
      loadingShow: true,
      serviceData: {},
      isShowBaseInfo: false,
      ciList: []
    };
  },
  beforeCreate() {},
  async created() {
    if (this.$route.query && this.$route.query.id) {
      this.serviceId = parseInt(this.$route.query.id);
      await this.getCiList();
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
      this.loadingShow = true;
      this.$api.dr.service.getService({
        id: this.serviceId
      }).then((res) => {
        if (res.Status === 'OK') {
          this.serviceData = res.Return || {};
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getCiList() {
      return this.$api.dr.ci.getCiList().then(res => {
        if (res && res.Status == 'OK') {
          this.ciList = res.Return || [];
        }
      });
    },
    editBaseInfo() {
      this.isShowBaseInfo = true;
    },
    saveBaseInfo() {
      this.isShowBaseInfo = false;
      this.getServiceData();
    },
    closeBaseInfoDialog() {
      this.isShowBaseInfo = false;
    },
    updateSceneList(list) {
      this.serviceData.sceneList = list;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
