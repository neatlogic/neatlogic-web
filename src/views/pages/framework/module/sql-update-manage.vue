<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <div class="flex-end">
      <TsFormDatePicker
        v-model="dateValue"
        type="datetimerange"
        :transfer="true"
        format="yyyy-MM-dd"
        @on-change="() => searchSqlUpdateData"
      ></TsFormDatePicker>
      <div class="action-group">
        <span class="action-item ml-nm">
          <Button icon="ios-search" type="primary" @click="searchSqlUpdateData">{{ $t('page.search') }}</Button>
        </span>
        <span class="action-item">
          <Button
            v-download="exportSql"
            :loading="donwloadLoading"
            icon="md-cloud-download"
            type="default"
          >{{ $t('page.export') }}</Button> 
        </span>
      </div>
    </div>
    <NoData v-if="$utils.isEmpty(timeLineList)"></NoData>
    <Timeline v-else style="margin-top: 30px;">
      <TimelineItem v-for="(item, index) of timeLineList" :key="index">
        <span slot="dot" :class="index == isActive ? 'tsfont-check-s text-success' : 'tsfont-circle'"></span>
        <div class="bg-grey padding ml-nm" style="margin-top: -16px;">
          <div class="flex-between cursor-pointer" @click.stop="expandContent(index)">
            <span>{{ item.text }}</span>
            <span :class="index == isActive ? 'tsfont-up' : 'tsfont-down'"></span>
          </div>
          <Loading
            v-if="item.loadingShow"
            :loadingShow="item.loadingShow"
            type="fix"
          ></Loading>
          <div v-else-if="index == isActive" class="mt-nm">{{ item.value }}</div>
          <NoData v-else-if="!item.value"></NoData>
        </div>
      </TimelineItem>
    </Timeline>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
  },
  directives: { download },
  props: {},
  data() {
    return {
      isActive: -1,
      loadingShow: false,
      donwloadLoading: false,
      dateValue: '',
      timeLineList: []
    };
  },
  beforeCreate() {},
  created() {
    this.searchSqlUpdateData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchSqlUpdateData() {
      this.loadingShow = true;
      this.$api.framework.module.searchSqlUpdateData({time: this.dateValue}).then(res => {
        if (res.Status == 'OK') {
          this.timeLineList = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    expandContent(index) {
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
  computed: {
    exportSql() {
      return {
        url: '/api/binary/autoexec/script/version/export',
        method: 'post',
        params: {},
        changeStatus: status => {
          if (status == 'start') {
            this.donwloadLoading = true;
          } else if (status == 'success' || status == 'error') {
            this.donwloadLoading = false;
          }
        }
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
</style>
