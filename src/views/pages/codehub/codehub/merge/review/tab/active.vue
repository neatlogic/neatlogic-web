<template>
  <div class="merge-request-box pt-nm" @scroll="scroll($event)">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <Timeline v-if="activeList && activeList.length>0">
      <TimelineItem
        v-for="(active,aindex) in activeList"
        :key="active.startTime+'_'+aindex"
        class="active-li"
      >
        <template slot="dot">
          <span v-if="active.status == 'merged' || active.status == 'finish'" class="tsfont-check-s text-success text-icon-font-size"></span>
          <span
            v-else-if="active.status == 'failed' || active.status == 'conflict'"
            class="tsfont-info-s text-error text-icon-font-size"
          ></span>
          <span v-else-if="active.status == 'add' || active.status == 'open'" class="tsfont-circle-o text-primary text-icon-font-size"></span>
          <span v-else class="tsfont-circle-o text-icon-font-size"></span>
        </template>
        <div class="time">
          <div>{{ active.endTime | formatDate }}</div>
        </div>
        <div class="content">
          <div class="active-div pb-sm pr-nm">
            <div class="flex-between">
              <div>
                <UserCard
                  v-if="active.userUuid"
                  :uuid="active.userUuid"
                ></UserCard>
                <span class="text-success ml-xs">
                  {{ active.actionTypeName || active.actionType }}{{ active.actionSubjectName || active.actionSubject }}
                </span>
              </div>
            </div>
            <div v-if="active.detail && getDetail(active.detail) && getDetail(active.detail).length">
              <table style="border-spacing: 12px;">
                <colgroup>
                  <col width="100" />
                  <col />
                </colgroup>
                <tbody>
                  <tr v-for="(detail,dindex) in getDetail(active.detail)" :key="dindex">
                    <td class="text-grey text-right mr-sm">{{ detail.label }}</td>
                    <td>
                      <div v-if="typeof detail.text =='object'">
                        {{ detail.text.toString() }}
                      </div>
                      <div v-else-if="detail.text" v-html="detail.text"></div>
                      <div v-else>-</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </TimelineItem>
      <TimelineItem v-if="pageCount>currentPage" class="active-li">
        <Icon slot="dot" custom="ts-round-s"></Icon>
        <div class="time"></div>
        <div class="content">
          <span class="text-href" @click="getNext">{{ $t('page.viewmore') }}</span>
        </div>
      </TimelineItem>
    </Timeline>
    <NoData v-else></NoData>
  </div>
</template>
<script>
import mixins from './tabmixins.js';
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  filters: {},
  mixins: [mixins],
  props: [''],
  data() {
    return {
      loadingShow: true,
      activeList: [],
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
    getList(currentPage) {
      let param = {
        belongId: this.id,
        belongType: 'mr',
        currentPage: currentPage
      };
      this.loadingShow = true;
      this.$api.codehub.merge.getActive(param).then((res) => {
        if (res.Status == 'OK') {
          let newlist = res.Return.tbodyList || [];
          this.activeList = this.$utils.concatArr(this.activeList, newlist);
          this.currentPage = res.Return.currentPage || 1;
          this.pageCount = res.Return.pageCount || 1;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    showdetail(item, value) {
      this.$set(item, 'hidedetail', value);
    },
    scroll(e) {
      //向下滚动时调用分页接口,预留100像素高度差缓存,当上次滚动完成后再调用接口
      let isNext = (e.target.scrollHeight - e.target.scrollTop - 100) < e.target.clientHeight;
      if (isNext && !this.loadingShow && (this.pageCount > this.currentPage)) {
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
.merge-request-box {
  max-height: calc(100vh - 157px); // 头部+导航栏+tab高度+16上间隙+底部间隙
  overflow: auto;
}
/deep/.active-li{
  padding-left: 200px;
  .ivu-timeline-item-tail{
    left: 218px;
  }
  .ivu-timeline-item-head{
    left: 200px;
    top: 4px;
  }
  .time{
    position: absolute;
    right: 100%;
    top: 5px;
    width: 190px;
    text-align: right;
    padding-right: 20px;
    font-size: 14px;
  }
  .content{
    padding-left: 30px;
    .active-div{
      width: 90%;
      min-height:70px;
    }
  }
  .text-icon-font-size {
    font-size: 22px;
  }
}
</style>
