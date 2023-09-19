<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <div class="flex-start mb-nm">
      <TsFormSelect
        v-bind="dateConfig"
        @on-change="() => searchVersionUpdateData"
      ></TsFormSelect>
      <span
        v-for="(item, index) in sortList"
        :key="index"
        class="ml-nm cursor-pointer"
        :class="[item.value == sortValue ? 'text-href' : '', getOrderIcon(item.value)]"
        @click.stop="selectedOrder(item)"
      >{{ item.text }}</span>
    </div>
    <NoData v-if="$utils.isEmpty(timeLineList)"></NoData>
    <Timeline v-else style="margin-left: 100px;margin-top: 30px;">
      <TimelineItem v-for="(item, index) of timeLineList" :key="index">
        <span slot="dot" :class="index == isActive ? 'tsfont-check-s text-success' : 'tsfont-circle'"></span>
        <div>
          <span class="timeline-left-text">{{ item.text }}</span>
          <div class="bg-grey padding ml-nm" style="margin-top: -16px;">
            <div class="flex-between cursor-pointer" @click.stop="expandContent(index)">
              <span>{{ item.text }}</span>
              <span :class="index == isActive ? 'tsfont-up' : 'tsfont-down'"></span>
            </div>
            <div v-if="index == isActive" class="mt-nm">{{ item.value }}</div>
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
      sortValue: 'descendingOrder',
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
      },
      sortList: [
        {
          text: this.$t('page.descendingorder'),
          value: 'descendingOrder'
        },
        {
          text: this.$t('page.ascendingorder'),
          value: 'ascendingOrder'
        }
      ]
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
      this.$api.framework.module.searchVersionUpdateData({sort: this.sortValue, timeValue: this.dateConfig.value}).then(res => {
        if (res.Status == 'OK') {
          this.timeLineList = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    selectedOrder(item) {
      this.sortValue = item.value;
    },
    expandContent(index) {
      this.isActive = index == this.isActive ? -1 : index;
    }
  },
  filter: {},
  computed: {
    getOrderIcon() {
      return (value) => {
        const obj = {
          ascendingOrder: 'tsfont-arrow-up',
          descendingOrder: 'tsfont-arrow-down'
        };
        return obj[value];
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
/deep/ .ivu-timeline-item-head-custom {
  font-size: 22px;
}
.timeline-left-text {
  position: absolute;
  top: 0;
  left: -100px;
  width: 80px;
}
</style>
