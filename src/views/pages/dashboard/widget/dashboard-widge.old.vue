<!--仪表板组件 -->
<template>
  <div class="dashboard-li bg-op radius-lg" :class="[{'padTop54': myChartType !=='numberchart'}, {'heightNumberChart': myChartType ==='numberchart'}]">
    <div class="dashboard-title">
      <span v-for="(history, i) in historyList" :key="history.widgetUuid">
        <a href="javascript:void(0)" @click="resumeComponent(i)">{{ history.widgetName }}</a>
        /
      </span>
      <span class="textTitle">{{ myWidgetName }}</span>
      <div v-if="editable == 'true'" class="dashboard-action action-group">
        <div class="action-item tsfont-edit" @click="editWidget(myWidgetUuid)"></div>
        <div class="action-item tsfont-trash-o" @click="removeWidget(myWidgetUuid)"></div>
      </div>
    </div>
    <div v-if="isShow" class="showType" :class="[{'pad1016': myChartType ==='numberchart'}, {'padding overflowAuto': myChartType ==='tablechart'}]">
      <component
        :is="myChartType"
        ref="chart"
        :class="myChartType"
        :chartdata="chartData"
        :widgetuuid="myWidgetUuid"
        :detailwidgetuuid="myDetailWidgetUuid"
        :index="index"
        @changeComponent="changeComponent"
      ></component>
      <Loading
        v-if="isLoading"
        :loading-show="isLoading"
        class="loadingclass"
        type="fix"
      ></Loading>
    </div>
    <div v-else class="nodaaheight text-grey">
      {{ $t('page.nodata') }}
    </div>
  </div>
</template>

<script>
import * as components from './charts';

export default {
  name: 'DashboardWidget',
  components: { ...components },
  props: {
    widgetuuid: String,
    dashboarduuid: String,
    widgetname: String,
    charttype: String,
    detailwidgetuuid: String,
    index: Number,
    refreshinterval: [Number, String],
    chartconfig: Object,
    conditionconfig: Object,
    handler: String,
    editable: String
  },
  data() {
    return {
      isLoading: true,
      chartData: {},
      myChartType: this.charttype,
      myWidgetUuid: this.widgetuuid,
      myWidgetName: this.widgetname,
      myDetailWidgetUuid: this.detailwidgetuuid,
      myChartConfig: this.chartconfig,
      myConditionConfig: this.conditionconfig,
      myHandler: this.handler,
      historyList: [],
      isShow: true,
      showEdit: false
    };
  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    resumeComponent(index) {
      if (this.historyList.length > 0) {
        const widget = this.historyList[index];
        const delCount = this.historyList.length - index;
        this.historyList.splice(index, delCount);
        this.$api.dashboard.dashboard.getWidget({ uuid: widget.widgetUuid }).then(res => {
          if (res && res.Return) {
            this.myWidgetUuid = res.Return['uuid'];
            this.myWidgetName = res.Return['name'];

            if (this.myChartType != res.Return['chartType']) {
              this.myDetailWidgetUuid = res.Return['detailWidgetUuid'];
              this.myChartType = res.Return['chartType'];
              this.loadData();
            } else {
              this.myDetailWidgetUuid = res.Return['detailWidgetUuid'];
              this.changeData();
            }
          }
        });
      }
    },
    changeComponent(detailWidgetUuid, action) {
      this.$api.dashboard.dashboard.getWidget({ uuid: detailWidgetUuid }).then(res => {
        if (res && res.Return) {
          this.myWidgetUuid = res.Return['uuid'];
          this.myWidgetName = res.Return['name'];
          this.historyList.push({
            widgetUuid: this.myWidgetUuid,
            widgetName: this.myWidgetName
          });

          if (this.myChartType != res.Return['chartType']) {
            this.myDetailWidgetUuid = res.Return['detailWidgetUuid'];
            this.myChartType = res.Return['chartType'];
            this.loadData();
          } else {
            this.myDetailWidgetUuid = res.Return['detailWidgetUuid'];
            this.changeData();
          }
        }
      });
    },
    reloadConponent(data) {
      if (data) {
        this.myWidgetUuid = data.widgetData.uuid;
        this.myWidgetName = data.widgetData.name;
        this.myDetailWidgetUuid = data.widgetData.detailWidgetUuid;
        this.myChartType = data.chartType;
        this.myChartConfig = data.chartConfig;
        this.myConditionConfig = data.conditionConfig;
        this.loadData();
      }
    },
    resize() {
      this.$refs['chart'].resize();
    },
    getChartData() {
      return this.chartData;
    },
    changeData(action) {
      if (action === 'init') {
        this.isLoading = true;
      }

      // 调整，统一通过配置项去查
      let data = {
        chartType: this.myChartType,
        conditionConfig: this.myConditionConfig || {},
        handler: this.myHandler,
        chartConfig: this.myChartConfig
      };
      if (this.conditionconfig) {
        this.conditionconfig.conditionGroupList = this.$utils.deepClone(this.myConditionConfig.conditionGroupList);
        this.conditionconfig.conditionGroupRelList = this.$utils.deepClone(this.myConditionConfig.conditionGroupRelList);
      }
      
      this.$api.dashboard.dashboard
        .getWidgetData(data)
        .then(res => {
          if (res && res.Return) {
            this.chartData = res.Return;
            if (this.myChartType === 'tablechart') {
              if (this.chartData.tableDataList.length === 0) {
                this.isShow = false; 
              }
              this.chartData.dataList = this.chartData.tableDataList;
            } else {
              if (this.chartData.dataList.length === 0) {
                this.isShow = false;
              }
            }
            
            if (!this.chartData.configObj) {
              this.chartData.configObj = {
                unit: ''
              };
            } else {
              if (!this.chartData.configObj.unit) {
                this.chartData.configObj.unit = '';
              }
            }
            
            if (action === 'init') {
              if (this.$refs['chart']) {
                this.$refs['chart'].loadData();
              }
              this.setChartInterval();
              this.isLoading = false;
            } else {              
              if (this.$refs['chart']) this.$refs['chart'].changeData();
              if (this.refreshinterval > 0) {
                this.$refs['chart'].loadData();
              }
            }
          }
        })
        .catch(error => {
          console.error(error);
          this.$Message.error(this.$t('term.dashboard.getwidgetdatafail'));
        });
    },
    loadData() {
      this.changeData('init');
    },
    setChartInterval() {
      if (this.refreshinterval > 0) {
        clearInterval(this.timeInterval);
        this.timeInterval = setInterval(() => {
          if (!this.$refs['chart']) {
            alert(this.$t('page.stop'));
            clearInterval(this.timeInterval);
            return;
          }
          this.changeData();
        }, Number(this.refreshinterval) * 1000);
      }
    },
    editWidget(uuid) {
      this.$emit('chartedit', {
        chartData: this.chartData,
        chartType: this.myChartType,
        widgetUuid: this.myWidgetUuid
      });
    },
    removeWidget(uuid) {
      // 获取当前组件的index，调用父组件删除
      this.$createDialog({
        title: this.$t('page.warning'),
        // content: '确定删除该组件【' + this.myWidgetName + '】？',
        content: this.$t('term.dashboard.deletewidgetconfirm', {target: this.myWidgetName}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$emit('removeWidget', uuid);
          this.$Message.success({
            content: this.$t('message.deletesuccess'),
            duration: 3,
            closable: true
          });
          vnode.isShow = false;
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
/deep/.ivu-spin-fix{
  background:transparent!important;
}
.dashboard-title {
  height: 54px;
  position: absolute;
  top: 0px;
  left: 0px;
  line-height: 23px;
  width: 100%;
  padding: 16px 24px;
  .textTitle{
    font-size: 16px;
  }

  .dashboard-action {
    position: absolute;
    right: 16px;
    top: 16px;

    .action-item {
      &:after {
        top: 8px;
        bottom: 8px;
      }
    }
  }
}
.pad1016{
  padding: 0px 16px 10px 16px;
  // height: 140px!important;
}
.overflowAuto{
  overflow: auto;
  padding-top: 0px;
}

.dashboard-li {
  height: 100%;
  width: 100%;
  position: relative;
  padding-top: 40px;
  .dashboard-action {
    display: none;
  }
  &:hover {
    .dashboard-action {
      display: block;
    }
  }
}
.heightNumberChart{
  .dashboard-title{
    padding: 10px 24px;
    height: 42px;
    line-height: 23px;
  }
  // .numberchart{
  //   height:120px!important;
  // }
  // .dashboard-li{
  //   height: 170px;
  // }
}
.showType{
  width:100%;
  height:100%; 
  position: relative; 
  // overflow: hidden;
}
.padTop54{
  padding-top: 54px;
}
.noPaddingTop{
  padding-top: 0px!important;
}
.nodaaheight{
  align-items: center;
  display: grid;
  height: 100%;
  text-align: center;
}
</style>
