<template>
  <div v-if="slaTimeList.length > 0" class="sla-detail">
    <Poptip
      placement="bottom-start"
      trigger="hover"
      transfer
      popper-class="sla-content"
    >
      <div>
        <span v-if="slaTimeList[0].timeLeft > 0" class="text-success">{{ $t('page.remainingtime') }}</span>
        <span v-else class="text-danger">{{ $t('page.overtime') }}</span>
        <span v-if="slaTimeList[0].timeLeft >= 0 || slaTimeList[0].displayModeAfterTimeout == 'workTime'" class="text-success">
          {{ Math.abs(slaTimeList[0].timeLeft) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
        </span>
        <span v-else>
          <span v-if="slaTimeList[0].status == 'done'" class="text-danger">
            {{ (slaTimeList[0].calculationTime - slaTimeList[0].expireTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
          </span>
          <span v-else class="text-danger">
            {{ (Date.now() - slaTimeList[0].expireTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
          </span>
        </span>
      </div>
      <div slot="content">
        <div class="information-box">
          <div v-for="(sla, slaIndex) in slaTimeList" :key="slaIndex" class="information-list">
            <div class="infor-left text-grey overflow" :title="sla.name.length > 6 ? sla.name : ''">{{ sla.name }}</div>
            <div class="infor-right">
              <div>
                <span v-if="sla.timeLeft > 0" class="text-success">{{ $t('page.remainingtime') }}</span>
                <span v-else class="text-danger">{{ $t('page.overtime') }}</span>
                <span v-if="sla.timeLeft >= 0 || sla.displayModeAfterTimeout == 'workTime'" class="text-success">
                  {{ Math.abs(sla.timeLeft) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
                </span>
                <span v-else>
                  <span v-if="slaTimeList[0].status == 'done'" class="text-danger">
                    {{ (sla.calculationTime - sla.expireTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
                  </span>
                  <span v-else class="text-danger">
                    {{ (Date.now() - sla.expireTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
                  </span>
                </span>
              </div>
              <div class="text-tip">{{ getSlaStatus(sla.status, sla.expireTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </Poptip>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    slaTimeList: Array
  },
  data() {
    return {
      slaUpdateTimer: null
    };
  },
  beforeCreate() {},
  created() {
    let doingSlaIdList = [];
    for (var index in this.slaTimeList) {
      if (this.slaTimeList[index].status === 'doing') {
        doingSlaIdList.push(this.slaTimeList[index].slaId);
      }
    }
    this.timingUpdateDoingSlaList(doingSlaIdList);
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.slaUpdateTimer) {
      clearTimeout(this.slaUpdateTimer);
      this.slaUpdateTimer = null;
    }
  },
  destroyed() {},
  methods: {
    timingUpdateDoingSlaList(slaIdList) {
      if (this.slaUpdateTimer) {
        clearTimeout(this.slaUpdateTimer);
        this.slaUpdateTimer = null;
      }
      if (slaIdList.length == 0) {
        return;
      }
      let data = {
        slaIdList: slaIdList
      };
      this.$api.process.processtask.slaTimeList(data).then(res => {
        if (res.Status === 'OK') {
          this.baseTime = Date.now();
          let tbodyList = res.Return.tbodyList || [];
          let doingSlaIdList = [];
          for (var i in tbodyList) {
            var tbody = tbodyList[i];
            for (var j in this.slaTimeList) {
              if (tbody.slaId == this.slaTimeList[j].slaId) {
                this.slaTimeList[j].status = tbody.status;
                this.slaTimeList[j].timeLeft = tbody.timeLeft;
                this.slaTimeList[j].realTimeLeft = tbody.realTimeLeft;
                this.slaTimeList[j].expireTime = tbody.expireTime;
                this.slaTimeList[j].realExpireTime = tbody.realExpireTime;
                this.slaTimeList[j].expireTimeLong = tbody.expireTimeLong;
                this.slaTimeList[j].realExpireTimeLong = tbody.realExpireTimeLong;
                this.slaTimeList[j].calculationTime = tbody.calculationTime;
                this.slaTimeList[j].displayModeAfterTimeout = tbody.displayModeAfterTimeout;
                if (tbody.status === 'doing') {
                  doingSlaIdList.push(tbody.slaId);
                }
              }
            }
          }
          this.slaUpdateTimer = setTimeout(() => {
            this.timingUpdateDoingSlaList(doingSlaIdList);
          }, 60 * 1000);
        }
      });
    },
    getSlaStatus(type, expireTime) {
      let statusObj = {
        'doing': this.$t('term.process.deadlinetime', {target: this.$utils.getDateByFormat(expireTime)}),
        'done': this.$t('page.completed'),
        'pause': this.$t('page.paused')
      };
      return statusObj[type] || '';
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.sla-content {
  .information-box {
    width: 240px;
    padding: 8px 0;
    .title{
      padding-bottom: 16px;
    }
    &:not(:last-of-type) {
      padding-bottom: 16px;
    }
  }
  .information-list {
    display: flex;
    align-items: flex-start;
    &:not(:last-child) {
      padding-bottom: 16px;
    }
    .infor-left {
      width: 72px;
      text-align: right;
      flex-shrink: 0;
    }
    .infor-right {
      flex-grow:1;
      flex-shrink: 1;
      padding-left: 16px;
      word-break:break-all;
    }
  }
}
</style>
