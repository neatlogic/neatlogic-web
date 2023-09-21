<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <div class="flex-end mb-nm">
      <TsFormSelect
        v-bind="dateConfig"
        @on-change="() => searchVersionUpdateData"
      ></TsFormSelect>
    </div>
    <NoData v-if="$utils.isEmpty(timeLineList)"></NoData>
    <Timeline v-else style="margin-top: 30px;">
      <TimelineItem v-for="(item, index) of timeLineList" :key="index">
        <span slot="dot" :class="index == isActive ? 'tsfont-check-s text-success' : 'tsfont-circle'"></span>
        <div>
          <div class="bg-grey padding ml-nm" style="margin-top: -16px;">
            <div class="flex-between cursor-pointer" @click.stop="expandContent(item, index)">
              <span>{{ item.text }}</span>
              <span :class="index == isActive ? 'tsfont-up' : 'tsfont-down'"></span>
            </div>
            <Loading
              v-if="item.loadingShow"
              :loadingShow="item.loadingShow"
              type="fix"
            ></Loading>
            <div v-if="index == isActive" class="mt-nm">{{ item.value }}</div>
            <NoData v-else-if="!item.value"></NoData>
          </div>
        </div>
      </TimelineItem>
    </Timeline>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {},
  data() {
    return {
      isActive: -1,
      loadingShow: false,
      timeLineList: [],
      dateConfig: {
        value: '',
        width: 300,
        transfer: true,
        dataList: [
          {
            text: '近半年',
            value: 1
          },
          {
            text: '近一年',
            value: 2
          },
          {
            text: '近两年',
            value: 3
          },
          {
            text: '所有',
            value: 'all'
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchVersionUpdateData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchVersionUpdateData() {
      this.loadingShow = true;
      this.$api.framework.module.searchVersionUpdateData({timeValue: this.dateConfig.value}).then(res => {
        if (res.Status == 'OK') {
          this.timeLineList = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    expandContent(row, index) {
      this.isActive = index == this.isActive ? -1 : index;
      if (this.isActive != -1 && !this.$utils.isEmpty(row)) {
        row.loadingShow = true;
        this.$api.framework.module.searchVersionUpdateData({id: row.id}).then(res => {
          if (res.Status == 'OK') {
            row.value = res.Return;
          }
        }).finally(() => {
          row.loadingShow = false;
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
/deep/ .ivu-timeline-item-head-custom {
  font-size: 22px;
}
</style>
