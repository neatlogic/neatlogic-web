
<template>
  <div class="argument-view pb-nm">
    <div class="title">
      {{ $t('term.autoexec.freeparameter') }}
    </div>
    <div v-if="!$utils.isEmpty(config)" class="bg-op radius-lg padding">
      <div class="detail">
        <div class="detail-name overflow">
          <span class="name-icon tsfont-forminput"></span>
          <span>{{ config.name }}</span>
        </div>
        <div class="text-tip overflow">
          <div>
            {{ config.defaultValue || $t('page.notarget', {target: $t('page.defaultvalue')}) }}
          </div>
          <div class="overflow detail-des" :title="config.description?config.description:''">{{ config.description || $t('page.notarget', {target: $t('page.description')}) }}</div>
        </div>
        <div class="text-tip">
          <TsFormSwitch
            v-model="config.isRequired"
            :disabled="true"
            :trueText="$t('page.require')"
            :falseText="$t('page.optional')"
            :showStatus="true"
          ></TsFormSwitch>
        </div>
      </div>
    </div>
    <div v-else class="text-tip">
      {{ $t('page.notarget', {target: $t('term.autoexec.freeparameter')}) }}
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  filters: {
  },
  props: {
    config: Object
  },
  data() {
    return {
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
  methods: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.argument-view {
  .title {
    font-size: 14px;
    padding-bottom: 10px;
  }
  .detail{
    display: grid;
    grid-template-columns: 160px auto 62px;
    column-gap: 10px;
    .name-icon {
      padding-right: 6px;
    }
    .detail-des{
      padding-top: 10px;
    }
  }
}
</style>
