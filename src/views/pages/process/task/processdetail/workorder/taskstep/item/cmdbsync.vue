<template>
  <div>
    <Timeline>
      <TimelineItem v-if="!$utils.isEmpty(errorList)">
        <div v-if="time" class="text-grey date-text">{{ time | formatDate }}</div>
        <CmdbsyncDetail :errorList="errorList"></CmdbsyncDetail>
      </TimelineItem>
      <template v-if="!$utils.isEmpty(tableList)">
        <TimelineItem v-for="(t, index) in tableList" :key="index">
          <div class="comment-list-box">
            <div class="pb-xs avatar-date-box">
              <div class="ml-sm pr-nm">
                <span class="text-grey date-text">{{ t.time | formatDate }}</span>
              </div>
            </div>
            <div class="bottom-content-box">
              <CmdbsyncDetail :tbodyList="t.tbodyList"></CmdbsyncDetail>
            </div>
          </div>
        </TimelineItem>
      </template>
    </Timeline>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CmdbsyncDetail: () => import('@/views/pages/process/task/processdetail/workorder/cmdbsync/cmdbsync-detail.vue')

  },
  props: {
    item: Object
  },
  data() {
    return {
      errorList: [],
      time: null,
      tableList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.item && !this.$utils.isEmpty(this.item.handlerStepInfo)) {
        if (!this.$utils.isEmpty(this.item.handlerStepInfo.errorList)) {
          this.errorList = this.item.handlerStepInfo.errorList;
          this.time = this.item.handlerStepInfo.time;
        }
        if (!this.$utils.isEmpty(this.item.handlerStepInfo.tableList)) {
          this.tableList = this.item.handlerStepInfo.tableList;
        }
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
