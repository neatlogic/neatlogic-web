<template>
  <Scroll :on-reach-bottom="handleReachBottom" :loading-text="loadingTip" :height="height">
    <ul v-if="iterationList && iterationList.length > 0">
      <li
        v-for="(iteration, index) in iterationList"
        :key="index"
        style="position: relative"
        class="cursor padding-md radius-md mb-md"
        :class="{
          'bg-op': currentIterationId !== iteration.id,
          'bg-selected': currentIterationId === iteration.id,
          processing: isProcessing(iteration)
        }"
        @click="selectIteration(iteration)"
      >
        <div v-if="isProcessing(iteration)" class="pl-xs pr-xs fz10 bg-warning processing text-op">{{ $t('page.current') }}</div>
        <div>
          <strong>{{ iteration.name }}</strong>
        </div>
        <div class="text-grey fz10" style="position: relative">
          <span>{{ iteration.startDate | formatDate('yyyy-mm-dd') }}</span>
          <span class="ml-xs mr-xs">~</span>
          <span>{{ iteration.endDate | formatDate('yyyy-mm-dd') }}</span>
          <span style="position: absolute; right: 0px" @click="toInterationDetail(iteration.id)">{{ $t('page.detail') }}</span>
        </div>
        <Divider v-if="iteration.issueCount" style="margin: 10px 0px"></Divider>
        <div v-if="iteration.issueCount">
          <Progress
            status="active"
            :percent="parseFloat(((iteration.doneIssueCount / iteration.issueCount) * 100).toFixed(2))"
            :stroke-width="20"
            text-inside
          />
        </div>
      </li>
    </ul>
  </Scroll>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
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
    toInterationDetail(id) {
      this.$router.push({ path: '/iteration-detail/' + this.projectId + '/' + this.appId + '/' + id });
    },
    initHeight() {
      if (this.$el) {
        this.height = window.innerHeight - this.$el.getBoundingClientRect().top - 16;
      }
    },
    selectIteration(iteration) {
      if (this.currentIterationId !== iteration.id) {
        this.currentIterationId = iteration.id;
        this.$emit('change', iteration);
      } /*else {
        this.currentIterationId = null;
        this.$emit('change', null);
      }*/
    },
    searchIteration() {
      this.$api.rdm.iteration.searchIteration(this.searchParam).then(res => {
        const iterationList = res.Return.tbodyList;
        if (!this.currentIterationId && iterationList && iterationList.length > 0) {
          this.selectIteration(iterationList[0]);
        }
        const pageSize = res.Return.pageSize;
        if (iterationList && iterationList.length) {
          if (iterationList.length > pageSize) {
            this.hasMore = true;
          } else {
            this.hasMore = false;
          }
          if (this.searchParam.currentPage == 1) {
            this.iterationList = iterationList;
          } else {
            for (let i = 0; i < Math.min(iterationList.length, pageSize); i++) {
              this.iterationList.push(iterationList[i]);
            }
          }
        } else {
          if (this.searchParam.currentPage == 1) {
            this.iterationList = [];
          }
          this.hasMore = false;
        }
      });
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
    isProcessing() {
      return iteration => {
        const now = new Date().getTime();
        if (now >= iteration.startDate && now <= iteration.endDate) {
          return true;
        }
        return false;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.processing {
  position: absolute;
  top: 0px;
  right: 0px;
}
</style>
