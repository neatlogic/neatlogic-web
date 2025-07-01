<template>
  <div class="flex-start">
    <div class="left-label-text text-grey">{{ config.typeName }}</div>
    <div v-if="newContentList && newContentList.length > 0">
      <div v-for="(newContentObj, i) in newContentList" :key="i">
        <span v-if="newContentObj.workerList && newContentObj.workerList.length > 0">
          <span>{{ newContentObj.processTaskStepName }}</span>
          <span class="text-grey pl-xs pr-xs">{{ $t('term.process.stepishandledby') }}</span>
          <span v-for="(item,index) in newContentObj.workerList" :key="index" style="display: inline-block;">
            <UserCard v-bind="item"></UserCard>
            <span v-if="newContentObj.workerList.length - 1 > index">&nbsp;&nbsp;&nbsp;&nbsp;</span>
          </span>
        </span>
      </div>
    </div>
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
    return {
      newContentList: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    console.log(this.config.newContent, 'config.newContent');
    if (this.config.newContent) {
      this.newContentList = JSON.parse(this.config.newContent);
    }
  },
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
