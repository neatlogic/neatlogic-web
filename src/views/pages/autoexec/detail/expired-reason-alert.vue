<template>
  <div>
    <Alert type="warning" show-icon>
      <div>
        <span class="text-danger">{{ $t('term.autoexec.combophasexpired') }}</span>
        <div class="mt-sm">{{ $t('page.reason') }}</div>
        <div
          v-for="(item, index) in configExpiredReason.reasonList"
          :key="index"
          class="mt-sm"
        >
          {{ item.description }}
        </div>
        <div 
          class="mt-sm text-href"
          @click.stop="gotoCombopDetailPage()"
        >{{ $t('term.autoexec.pleasereedit') }}</div>
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
    combopId: {
      type: Number,
      default: null
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
  methods: {
    gotoCombopDetailPage() {
      if (this.type == 'openNewWindow') {
        window.open(HOME + '/autoexec.html#/action-detail?id=' + this.combopId, '_blank');
      } else {
        window.open(HOME + '/autoexec.html#/action-detail?id=' + this.combopId, '_self');
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
