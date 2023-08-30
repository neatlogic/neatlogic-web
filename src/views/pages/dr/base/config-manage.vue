<template>
  <div>
    <TsContain hideHeader>
      <template v-slot:content>
        <div class="pt-nm">
          <Divider orientation="start">{{ $t('term.inspect.datacenter') }}</Divider>
          <div class="pt-nm pb-nm">
            <DataConfig></DataConfig>
          </div>
          <Divider orientation="start">{{ $t('term.dr.scenarioconfig') }}</Divider>
          <div class="pt-nm pb-nm">
            <ScenarioConfig></ScenarioConfig>
          </div>
          <Divider orientation="start">{{ $t('term.dr.assetconfig') }}</Divider>
          <div class="pt-nm pb-nm">
            <AssetConfig></AssetConfig>
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
    return {};
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
    getBaseData() {
      this.$api.dr.dr.getBaseData().then(res => {
        
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
