<template>
  <div v-if="config">
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <span v-if="config.oldContent">
      <UserCard
        v-bind="setData(config.oldContent)"
        hideAvatar
        style="display: inline-block;"
      ></UserCard>
    </span>
    <span v-if="config.newContent && config.oldContent" class="text-grey change-text">{{ $t('term.process.changeto') }}</span>
    <span v-if="config.newContent">
      <UserCard
        v-bind="setData(config.newContent)"
        hideAvatar
      ></UserCard>
    </span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  filters: {},
  props: {
    config: Object
  },
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
    setData(str) {
      let data = JSON.parse(str);
      return data;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
