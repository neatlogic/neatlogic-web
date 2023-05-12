<template>
  <div>
    <div class="pt-md pl-md mt-md">
      <InputSearcher v-model="searchParam.keyword" border="bottom" @change="searchCiEntity(1)"></InputSearcher>
    </div>
    <div ref="scroll">
      <Scroll :on-reach-bottom="handleReachBottom" :loading-text="loadingTip" :height="scrollHeight">
        <ul v-if="ciEntityList && ciEntityList.length > 0">
          <li
            v-for="(cientity, index) in ciEntityList"
            :key="index"
            class="pl-md pb-md"
            :class="cientity.id == ciEntityId ? 'text-primary' : ''"
            :style="cientity.id != ciEntityId ? 'cursor:pointer' : ''"
            @click="toViewDetail(cientity.id)"
          >{{ cientity.name || $t('term.cmdb.nonamecientity') }}</li>
        </ul>
      </Scroll>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {
    viewId: { type: Number },
    ciEntityId: { type: Number }
  },
  data() {
    return {
      loadingTip: this.$t('page.loadingtip'),
      searchParam: { keyword: '', currentPage: 1, customViewId: this.viewId },
      ciEntityList: [],
      scrollHeight: 0,
      hasMore: false
    };
  },
  beforeCreate() {},
  created() {
    window.addEventListener('resize', this.calcHistoryHeight);
  },
  beforeMount() {},
  mounted() {
    this.searchCiEntity();
    setTimeout(() => {
      this.calcHistoryHeight();
    }, 300);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.calcHistoryHeight);
  },
  destroyed() {},
  methods: {
    calcHistoryHeight() {
      //70离上部高度
      this.scrollHeight = document.body.clientHeight - this.$refs['scroll'].getBoundingClientRect().top - 20;
    },
    toViewDetail(ciEntityId) {
      this.$router.push({ path: '/view-detail/' + this.viewId + '/' + ciEntityId });
    },
    searchCiEntity(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.cmdb.customview.searchCustomViewCiEntity(this.searchParam).then(res => {
        const ciEntityList = res.Return.ciEntityList;
        const pageSize = res.Return.pageSize;
        if (ciEntityList && ciEntityList.length) {
          if (ciEntityList.length > pageSize) {
            this.hasMore = true;
          } else {
            this.hasMore = false;
          }
          if (this.searchParam.currentPage == 1) {
            this.ciEntityList = ciEntityList;
          } else {
            for (let i = 0; i < Math.min(ciEntityList.length, pageSize); i++) {
              this.CiEntityList.push(ciEntityList[i]);
            }
          }
        } else {
          if (this.searchParam.currentPage == 1) {
            this.ciEntityList = [];
          }
          this.hasMore = false;
        }
      });
    },
    handleReachBottom: function() {
      //引用滚动加载
      let _this = this;
      if (this.searchParam.currentPage) {
        this.searchParam.currentPage += 1;
      }

      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
          if (!_this.hasMore) {
            _this.loadingTip = this.$t('page.loadfinish');
            return;
          } else {
            _this.searchCiEntity();
          }
        }, 1000);
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    keyword: {
      handler: function(val) {}
    }
  }
};
</script>
<style lang="less"></style>
