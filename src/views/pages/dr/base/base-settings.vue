<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain hideHeader>
      <template v-slot:content>
        <div class="pt-nm">
          <Divider orientation="start">{{ $t('term.inspect.datacenter') }}</Divider>
          <div class="pt-nm pb-nm">
            <DataConfig :drDataCenterList="drDataCenterList" @update="getBaseSettings()"></DataConfig>
          </div>
          <Divider orientation="start">{{ $t('term.dr.scenarioconfig') }}</Divider>
          <div class="pt-nm pb-nm">
            <ScenarioConfig :drDataCenterList="drDataCenterList" :drSceneList="drSceneList" @update="getBaseSettings()"></ScenarioConfig>
          </div>
          <Divider orientation="start">{{ $t('term.dr.assetconfig') }}</Divider>
          <div class="pt-nm pb-nm">
            <AssetConfig :drCiList="drCiList"></AssetConfig>
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
    DataConfig: resolve => require(['./config/data-config.vue'], resolve),
    ScenarioConfig: resolve => require(['./config/scenario-config.vue'], resolve),
    AssetConfig: resolve => require(['./config/asset-config.vue'], resolve)
    
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      drDataCenterList: [],
      drSceneList: [],
      drCiList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getBaseSettings();
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
    getBaseSettings() {
      this.$api.dr.baseSettings.getBaseSettings().then(res => {
        if (res && res.Status == 'OK') {
          this.drDataCenterList = res.Return.drDataCenterList;
          this.drSceneList = res.Return.drSceneList;
          this.drCiList = res.Return.drCiList;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
