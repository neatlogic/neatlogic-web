<template>
  <div id="phase_container" class="padding stepContain">
    <ul v-if="phaseGroupList && phaseGroupList.length > 0" class="phaseList">
      <template v-for="(group, index) in phaseGroupList">
        <li v-if="group.phaseList && group.phaseList.length > 0" :key="index" class="step-li border-color">
          <span class="stepIndex tips" :class="{ 'text-primary border-primary': group.phaseList.findIndex(d => d.id === activePhaseId) >= 0, 'text-grey': group.phaseList.findIndex(d => d.id === activePhaseId) === -1 }">{{ index + 1 }}</span>
          <ul>
            <li
              v-for="(phase, pindex) in group.phaseList"
              :id="'phase_' + phase.id"
              :ref="'phase_' + phase.id"
              :key="pindex"
              class="dividing-color cursor-pointer padding radius-sm block-border"
              :class="{ 'block-primary': activePhaseId && phase.id == activePhaseId }"
              style="position: relative"
              @click="selectPhase(phase)"
            >
              <!-- 进度百分比 -->
              <div v-if="fixedPhaseId && fixedPhaseId === phase.id" class="fz10 text-info fixed-icon tsfont-location-o"></div>
              <div class="name-grid">
                <div class="overflow">
                  <span :class="{ 'text-primary': activePhaseId && phase.id == activePhaseId }" :title="phase.name || '-'">{{ phase.name || '-' }}</span>
                </div>
                <div><Status :statusValue="phase.statusVo.name" :statusName="phase.statusVo.text" class="step-status"></Status></div>
              </div>
              <div class="stepProcess">
                <Liquid :size="7" :percent="phase.completionRate" :config="{ status: phase.status }"></Liquid>
                <Tooltip
                  v-if="getExceptionTips(phase)"
                  transfer
                  class="stepStatues com-status"
                  placement="bottom"
                  theme="light"
                >
                  <span class="tsfont-warning-o" :class="getExceptionTips(phase).class"></span>
                  <template v-slot:content>
                    <div>
                      <div v-for="title in getExceptionTips(phase).titles" :key="title">{{ title }}</div>
                    </div>
                  </template>
                </Tooltip>
              </div>
            </li>
          </ul>
        </li>
      </template>
    </ul>
    <div v-else class="text-tip padding" style="text-align: center">{{ $t('page.nodata') }}</div>
  </div>
</template>
<script>
export default {
  components: {
    Liquid: () => import('@/resources/components/SimpleGraph/Liquid.vue'),
    Status: () => import('@/resources/components/Status/CommonStatus.vue')
  },
  filters: {},
  model: {
    prop: 'activePhaseId',
    event: 'change'
  },
  props: {
    phaseList: { type: Array }
  },
  data() {
    return {
      fixedPhaseId: null,
      activePhaseId: null
    };
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
    selectPhase(phase) {
      if (this.fixedPhaseId !== phase.id) {
        this.fixedPhaseId = phase.id;
      } else {
        this.fixedPhaseId = null;
      }
    },
    scrollToSelect() {
      let $select = this.$el.querySelector('li.block-primary');
      if ($select) {
        let config = this.$el.getBoundingClientRect();
        if ($select.offsetTop < this.$el.scrollTop || $select.offsetTop > this.$el.scrollTop + config.height) {
          this.$el.scrollTop = $select.offsetTop - config.height / 2 + 130;
        }
      }
    }
  },
  computed: {
    phaseGroupList() {
      const groupList = [];
      if (this.phaseList && this.phaseList.length > 0) {
        this.phaseList.forEach(phase => {
          let group = groupList.find(d => d.groupId == phase.groupId);
          if (!group) {
            group = { groupId: phase.groupId, phaseList: [] };
            groupList.push(group);
          }
          group['phaseList'].push(phase);
        });
      }
      return groupList;
    },
    getExceptionTips() {
      return step => {
        let titles = [];
        let status = '';
        if (step.warnCount > 0) {
          titles.push(this.$t('term.autoexec.loghaswarninfo'));
          status = {
            status: 'warn'
          };
        }
        let levelList = ['aborted', 'ignored'];
        levelList.find(item => {
          let statusTmp = step.statusCountVoList.find(cc => cc.status == item);
          if (statusTmp) {
            titles.push(this.$t('term.autoexec.phasehastips', { target: statusTmp.statusVo.text }));
            status = statusTmp;
          }
        });
        if (titles && titles.length > 0) {
          return {
            class: `text-${status.status}`,
            titles: titles
          };
        }
        return null;
      };
    }
  },
  watch: {
    phaseList: {
      handler: function(val) {
        if (!this.fixedPhaseId) {
          if (val && val.length > 0) {
            val.some(phase => {
              //以下状态有优先级，需要按顺序匹配
              if (phase.status === 'failed' || phase.status === 'aborted' || phase.status === 'running') {
                this.activePhaseId = phase.id;
                return true;
              }
            });

            if (!this.activePhaseId) {
              const queryPhaseId = this.$route.query['phaseId'];
              if (queryPhaseId) {
                this.activePhaseId = parseInt(queryPhaseId);
              } else {
                this.activePhaseId = this.phaseList[0].id;
              }
            }
          }
          //内容变化会影响高度，可能会因此产生滚动条，所以每次内容变化都要触发跳转，并且需要延时等待内容加载完毕才能进行定位
          if (this.activePhaseId) {
            setTimeout(() => {
              const rect = this.$refs['phase_' + this.activePhaseId][0].getBoundingClientRect();
              if (rect && (rect.top < 0 || rect.top > window.innerHeight)) {
                this.$utils.jumpTo('#phase_' + this.activePhaseId, 'smooth');
              }
            }, 500);
          }
        }
      },
      immediate: true
    },
    fixedPhaseId: {
      handler: function(val) {
        if (val) {
          this.activePhaseId = val;
        } else {
          if (this.phaseList) {
            this.phaseList.forEach(phase => {
              //以下状态有优先级，需要按顺序匹配
              if (phase.status === 'failed' || phase.status === 'aborted' || phase.status === 'running') {
                this.activePhaseId = phase.id;
                return false;
              }
            });

            if (!this.activePhaseId) {
              this.activePhaseId = this.phaseList[0].id;
            }
          }
        }
      }
    },
    activePhaseId: {
      handler: function(val) {
        if (val) {
          this.$emit('change', val);
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.name-grid {
  display: grid;
  grid-template-columns: auto 60px;
}
.fixed-icon {
  position: absolute;
  top: 0px;
  right: 0px;
}
@iconWidth: 20px;
@stepIndex: 24px;
.stepContain {
  overflow: auto;
  position: relative;
  height: 100%;
  padding-top: 1px;
  ul.phaseList {
    padding-left: 20px;
    > li {
      padding: 0px !important;
      &::after {
        content: '';
        position: absolute;
        width: 1px;
        top: 27px;
        bottom: -13px;
        left: -23px;
        border-left: 1px dashed;
        border-color: inherit;
      }
      &:last-of-type {
        &::after {
          border: none;
        }
        margin-right: 0px;
      }
      .stepIndex {
        position: absolute;
        top: 0px;
        left: -35px;
        width: @stepIndex;
        height: @stepIndex;
        border-radius: 50%;
        text-align: center;
        line-height: 21px;
        border: 2px solid;
        font-weight: bold;
        border-color: inherit;
      }
    }
    li {
      position: relative;
      margin-bottom: 16px;
      padding: 16px 10px;

      > ul {
        > li {
          margin-bottom: 6px;
          &:last-of-type {
            margin-bottom: 0px;
          }
        }
      }
      .stepName {
        height: @iconWidth;
        position: relative;
        padding-right: 65px;
        .name {
          line-height: @iconWidth;
          max-width: 100%;
          display: inline-block;
        }
        .step-status {
          margin-left: 10px;
          position: absolute;
          span {
            margin-right: 3px;
          }
        }
      }
      .stepProcess {
        padding-top: 10px;
        line-height: @iconWidth;
        position: relative;
        display: block;
        padding-right: 80px;
        /deep/.stepStatues {
          padding: 0px 4px;
          position: absolute;
          right: 0px;
          top: 10px;
        }
      }
    }
  }
}
</style>
