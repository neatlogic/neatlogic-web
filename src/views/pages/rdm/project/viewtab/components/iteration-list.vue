<template>
  <div class="iteration-list">
    <div ref="filter" class="iteration-filter">
      <span
        v-for="filter in isOpenFilterList"
        :key="filter.value === null ? 'all' : filter.value"
        class="iteration-filter-item"
        :class="isOpenFilter === filter.value ? 'text-primary' : 'text-grey'"
        @click="changeIsOpenFilter(filter.value)"
      >{{ filter.text }}</span>
    </div>
    <Scroll :on-reach-bottom="handleReachBottom" :loading-text="loadingTip" :height="height">
      <ul v-if="iterationList && iterationList.length > 0">
        <li
          v-for="(iteration, index) in iterationList"
          :key="index"
          style="position: relative"
          class="cursor padding-md radius-md mb-md"
          :class="{
            'bg-op': currentIterationId !== iteration.id,
            'bg-selected': currentIterationId === iteration.id
          }"
          @click="selectIteration(iteration)"
        >
          <div v-if="isProcessing(iteration)" class="pl-xs pr-xs fz10 bg-warning iteration-status-tag text-op">{{ $t('page.current') }}</div>
          <div v-else-if="isClosed(iteration)" class="pl-xs pr-xs fz10 bg-grey iteration-status-tag text-grey">{{ $t('term.rdm.isclosed') }}</div>
          <div>
            <strong>{{ iteration.name }}</strong>
          </div>
          <div class="text-grey fz10" style="position: relative">
            <span>{{ iteration.startDate | formatDate('yyyy-mm-dd') }}</span>
            <span class="ml-xs mr-xs">~</span>
            <span>{{ iteration.endDate | formatDate('yyyy-mm-dd') }}</span>
            <span style="position: absolute; right: 0px" @click="toInterationDetail(iteration.id)">{{ $t('page.detail') }}</span>
          </div>
          <div v-if="iteration.description" class="mt-md fz10 text-grey" v-html="iteration.description"></div>
          <Divider v-if="iteration.issueCount" style="margin: 10px 0px"></Divider>
          <div v-if="iteration.issueCount">
            <Progress
              status="active"
              :percent="parseFloat(((iteration.doneIssueCount / iteration.issueCount) * 100).toFixed(2))"
              :stroke-width="18"
              text-inside
            />
          </div>
        </li>
      </ul>
    </Scroll>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    appId: { type: Number },
    projectId: { type: Number }
  },
  data() {
    return {
      loadingTip: this.$t('page.loadingtip'),
      searchParam: {
        projectId: this.projectId,
        pageSize: 20,
        currentPage: 1,
        isOpen: 1
      },
      iterationList: [],
      currentIterationId: null,
      isOpenFilter: 1,
      hasMore: false,
      height: 0
    };
  },
  beforeCreate() {},
  created() {
    this.searchIteration();
  },
  beforeMount() {},
  mounted() {
    this.initHeight();
    window.addEventListener('resize', this.initHeight);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.initHeight);
  },
  destroyed() {},
  methods: {
    restoreHistory(historyData) {
      if (historyData['currentIterationId']) {
        this.currentIterationId = historyData['currentIterationId'];
      }
    },
    toInterationDetail(id) {
      this.$router.push({ path: '/iteration-detail/' + this.projectId + '/' + this.appId + '/' + id });
    },
    initHeight() {
      if (this.$el) {
        const filterHeight = this.$refs.filter ? this.$refs.filter.getBoundingClientRect().height : 0;
        this.height = window.innerHeight - this.$el.getBoundingClientRect().top - filterHeight - 16;
      }
    },
    selectIteration(iteration) {
      if (this.currentIterationId !== iteration.id) {
        this.currentIterationId = iteration.id;
        this.$addHistoryData('currentIterationId', this.currentIterationId);
        this.$emit('change', iteration);
      } else {
        //创新迭代
        this.currentIterationId = null;
        this.$nextTick(() => {
          this.currentIterationId = iteration.id;
        });
      }
    },
    searchIteration() {
      this.$api.rdm.iteration.searchIteration(this.searchParam).then(res => {
        const iterationList = (res.Return && res.Return.tbodyList) || [];
        const pageSize = (res.Return && res.Return.pageSize) || this.searchParam.pageSize;
        if (iterationList && iterationList.length > 0) {
          if (iterationList.length > pageSize) {
            this.hasMore = true;
          } else {
            this.hasMore = false;
          }
          if (this.searchParam.currentPage == 1) {
            this.iterationList = iterationList;
            this.selectDefaultIteration(iterationList);
          } else {
            for (let i = 0; i < Math.min(iterationList.length, pageSize); i++) {
              this.iterationList.push(iterationList[i]);
            }
          }
        } else {
          if (this.searchParam.currentPage == 1) {
            this.iterationList = [];
            this.clearIteration();
          }
          this.hasMore = false;
        }
      });
    },
    selectDefaultIteration(iterationList) {
      if (this.currentIterationId) {
        const iteration = iterationList.find(d => d.id === this.currentIterationId);
        if (iteration) {
          this.$emit('change', iteration);
          return;
        }
      }
      const processingIteration = iterationList.find(iteration => this.isProcessing(iteration));
      this.selectIteration(processingIteration || iterationList[0]);
    },
    clearIteration() {
      this.currentIterationId = null;
      this.$emit('change', null);
    },
    changeIsOpenFilter(isOpen) {
      if (this.isOpenFilter === isOpen) {
        return;
      }
      this.isOpenFilter = isOpen;
      this.searchParam.currentPage = 1;
      this.iterationList = [];
      this.hasMore = false;
      this.loadingTip = this.$t('page.loadingtip');
      if (isOpen === null) {
        this.$delete(this.searchParam, 'isOpen');
      } else {
        this.$set(this.searchParam, 'isOpen', isOpen);
      }
      this.searchIteration();
    },
    handleReachBottom: function() {
      //引用滚动加载
      if (this.searchParam.currentPage) {
        this.searchParam.currentPage += 1;
      }

      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
          if (!this.hasMore) {
            this.loadingTip = this.$t('page.loadfinish');
            return;
          } else {
            this.searchIteration();
          }
        }, 500);
      });
    }
  },
  filter: {},
  computed: {
    isOpenFilterList() {
      return [
        { value: 1, text: this.$t('term.rdm.isopened') },
        { value: 0, text: this.$t('term.rdm.isclosed') },
        { value: null, text: this.$t('page.all') }
      ];
    },
    isProcessing() {
      return iteration => {
        if (!iteration || iteration.isOpen !== 1) {
          return false;
        }
        const now = new Date().getTime();
        if (now >= iteration.startDate && now <= iteration.endDate) {
          return true;
        }
        return false;
      };
    },
    isClosed() {
      return iteration => {
        return !!iteration && iteration.isOpen === 0;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.iteration-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
}
.iteration-filter-item {
  cursor: pointer;
}
.iteration-status-tag {
  position: absolute;
  top: 0px;
  right: 0px;
}
</style>
