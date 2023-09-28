<template>
  <div>
    <Alert type="warning" show-icon>
      <div>
        <span class="text-danger">{{ $t('term.autoexec.combophasexpired') }}</span>
        <div class="mt-sm">{{ $t('page.reason') }}：</div>
        <div
          v-for="(item, index) in configExpiredReason.reasonList"
          :key="index"
          class="mt-sm"
        >
          {{ item.description }}
        </div>
        <div class="mt-sm">{{ $t('term.autoexec.pleasereedit') }}</div>
      </div>
    </Alert>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    configExpiredReason: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String, // 可选 openNewWindow || location
      default: 'openNewWindow'
    }
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
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
