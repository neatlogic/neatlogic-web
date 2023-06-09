<template>
  <div class="padding-md" style="max-height: calc(100vh - 140px);overflow: auto;" @scroll="scroll($event)">
    <div v-if="currentPage">
      <Timeline v-if="activeList && activeList.length>0">
        <TimelineItem
          v-for="(active,aindex) in activeList"
          :key="active.startTime+'_'+aindex"
          class="active-li"
          :color="colorConfig[active.status]?colorConfig[active.status]:'#999999'"
        >
          <Icon slot="dot" custom="ts-round-s"></Icon>
          <div class="time">
            <div>{{ active.endTime|formatDate }}</div>
            <div style="font-weight: normal;"><span class="ts-user user-name">{{ active.userName || active.userId }}</span></div>
          </div>
          <div class="content">
            <div class="border-color active-div" :class="aindex%2==0?'':'bg-grey'">
              <h3 class="clearfix">
                <span class="d_f">{{ active.actionSubjectName || active.actionSubject }}</span>
                <span class="d_f text-tip ml-10" style="font-size: 10px;line-height: 26px;font-weight: normal;">{{ active.actionTypeName ||active.actionType }}{{ active.actionSubjectName || active.actionSubject }}</span>
                <span
                  v-if="active.status"
                  class="ml-10 text-tip d_f_r"
                  style="font-size:10px;font-weight:normal;"
                  :style="colorConfig[active.status]?('color:'+colorConfig[active.status]):''"
                >{{ active.statusName }}</span>
              </h3>
              <div v-if="active.detail && getDetail(active.detail) && getDetail(active.detail).length" style="margin-top:10px;">
                <table class="table table-small">
                  <colgroup>
                    <col width="120" />
                    <col />
                  </colgroup>
                  <tbody>
                    <tr v-for="(detail,dindex) in getDetail(active.detail)" :key="dindex">
                      <td class="text-tip" style="background:transparent;padding-left:0">{{ detail.label }}</td>
                      <td style="background:transparent;">
                        <div v-if="typeof detail.text =='object'">
                          {{ detail.text.toString() }}
                        </div>
                        <div v-else-if="detail.text" v-html="detail.text"></div>
                        <div v-else>-</div>
                      </td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem v-if="pageCount>currentPage" class="active-li">
          <Icon slot="dot" custom="ts-round-s"></Icon>
          <div class="time"></div>
          <div class="content"><div class="text-href" @click="getNext">{{ $t('page.viewmore') }}</div></div>
        </TimelineItem>
      </Timeline>
      <NoData v-else></NoData>
    </div>
    <Loading v-else loadingShow style="height:100px"></Loading>
  </div>
</template>
<script>
import mixins from './tabmixins.js';
export default {
  name: '',
  components: {
  },
  filters: {},
  mixins: [mixins],
  props: [''],
  data() {
    return {
      loading: false,
      activeList: [],
      colorConfig: {//状态需要加颜色的
        merged: '#2ed373',
        conflict: '#e42332',
        failed: '#e42332',
        add: '#336eff',
        finish: '#2ed373',
        open: '#336eff'
      },
      currentPage: 0, //当前页面
      pageCount: 0//总页数
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {
    this.activeList = [];
    this.getList();
  },
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getList(page) {
      let param = {
        belongId: this.id,
        belongType: 'mr'
      };
      page && Object.assign(param, {
        currentPage: page
      });
      //第一次进来没有当前页面，需要加一个加载中的全局动画
      this.loading = true;
      this.$api.codehub.merge.getActive(param).then((res) => {
        this.loading = false;
        if (res.Status == 'OK') {
          let newlist = res.Return.list || [];
          this.activeList = this.$utils.concatArr(this.activeList, newlist);
          this.currentPage = res.Return.currentPage || 1;
          this.pageCount = res.Return.pageCount || 1;
        } else {
          this.activeList = [];
          this.currentPage = 0;
        }
      }).catch((e) => {
        this.loading = false;
        this.activeList = [];
      });
    },
    showdetail(item, value) {
      this.$set(item, 'hidedetail', value);
    },
    scroll(e) {
      //向下滚动时调用分页接口,预留100像素高度差缓存,当上次滚动完成后再调用接口
      let isNext = (e.target.scrollHeight - e.target.scrollTop - 100) < e.target.clientHeight;
      if (isNext && !this.loading && (this.pageCount > this.currentPage)) {
        this.getNext();
      }
    },
    getNext() {
      if (this.pageCount > this.currentPage) {
        this.getList(this.currentPage + 1);
      }
    }
  },
  computed: {
    getDetail() {
      return function(list) {
        let filterList = [];//需要过滤掉源分支、目标分支
        let excludeName = [];
        if (list) {
          if (typeof list == 'object') {
            filterList = list.filter(s => {
              return !excludeName.includes(s.label);
            });
          } else {
            let json = JSON.parse(list);
            filterList = json.filter(s => {
              return !excludeName.includes(s.label);
            });
          }
        }

        return filterList;
      };
    }
  },
  watch: {}
};

</script>
<style lang='less' scoped>
/deep/.active-li{
  padding-left: 200px;
  .ivu-timeline-item-tail{
    left: 218px;
  }
  .ivu-timeline-item-head{
    left: 200px;
  }
  .time{
    position: absolute;
    right: 100%;
    top: 0;
    width: 190px;
    text-align: right;
    padding-right: 20px;
    font-weight: bold;
    font-size: 14px;
  }
  .content{
    padding-left: 30px;
    .active-div{
      padding: 10px 16px;
      border: 1px solid;
      width: 90%;
      border-radius: 4px;
      min-height:70px;
    }
  }
  .user-name{
    margin-top: 10px;
    &:before{
      margin-right: 6px;
    }
  }

}

</style>
