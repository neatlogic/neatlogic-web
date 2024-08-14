<template>
  <div>
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <span v-if="config.oldContent">
      <span v-for="(item,index) in setData(config.oldContent)" :key="index">
        <UserCard
          v-bind="item"
          style="display: inline-block;"
        ></UserCard>
        <span v-if="setData(config.oldContent).length -1 >index">&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </span>
    </span>
    <span v-if="config.newContent && config.oldContent" class="text-grey change-text">{{ $t('term.process.changeto') }}</span>
    <span v-if="config.newContent">
      <span v-for="(item,index) in setData(config.newContent)" :key="index" style="display: inline-block;">
        <UserCard v-bind="item"></UserCard>
        <span v-if="setData(config.newContent).length -1 >index">&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </span>
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
