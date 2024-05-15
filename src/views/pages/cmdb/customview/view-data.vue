<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain border="border" :isSiderHide="isSiderHide">
      <template v-slot:topRight>
        <div class="dashboard-action action-group" style="text-align:right">
          <span class="action-item tsfont-edit" @click="editView()">{{ $t('dialog.title.edittarget', { target: $t('term.cmdb.view') }) }}</span>
        </div>
      </template>
      <template v-slot:content>
        <div class="ci-content">
          <div class="ci-right">
            <div class="right-top">
              <div class="icon-block iconWidth radius-lg text-primary">
                <i :class="viewData.icon" class="ci-icon"></i>
              </div>
              <div class="title overflow">
                <div>
                  <span class="ci-label">{{ viewData.name }}</span>
                </div>
                <div v-if="viewData.description" class="ci-description overflow text-grey" :title="viewData.description">{{ viewData.description }}</div>
                <div v-else class="text-grey">{{ $t('page.nocommon') }}</div>
              </div>
            </div>
            <div class="right-block bg-block  radius-lg pl-nm pr-nm pb-nm">
              <Tabs v-if="viewData && viewData.customViewTemplate && viewData.customViewTemplate.isActive" value="data">
                <TabPane :label="$t('page.data')" name="data"><ViewDataList :viewId="id"></ViewDataList></TabPane>
                <TabPane :label="viewData.customViewTemplate.name" name="template">
                  <CustomTemplate :id="id"></CustomTemplate>
                </TabPane>
              </Tabs>
              <ViewDataList v-else :viewId="id"></ViewDataList>
            </div>
          </div>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ViewDataList: resolve => require(['./view-data-list.vue'], resolve),
    CustomTemplate: resolve => require(['./custom-template.vue'], resolve)
  },
  props: {
    customViewId: { type: Number }
  },
  data() {
    return {
      id: this.$route.params['id'] ? parseInt(this.$route.params['id']) : this.customViewId,
      scrollHeight: 800,
      loadingShow: false,
      isSiderHide: false,
      loadingText: this.$t('page.loading'),
      viewData: {},
      viewList: [],
      searchParam: { currentPage: 1 }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCustomView();
    this.searchCustomView();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editView() {
      this.$router.push({ path: '/view-edit/' + (this.viewData.isPrivate == 1 ? 'private/' : 'public/') + this.id });
    },
    switchView(viewId) {
      this.$router.push({ path: '/view-data/' + viewId });
    },
    isTslayout() {
      this.isSiderHide = !this.isSiderHide;
    },
    getCustomView() {
      this.$api.cmdb.customview.getCustomViewById(this.id).then(res => {
        this.viewData = Object.assign({}, res.Return);
      });
    },
    searchCustomView() {
      this.loadingShow = true;
      this.$api.cmdb.customview.searchCustomView(this.searchParam).then(res => {
        this.loadingShow = false;
        if (res.Return.currentPage > 1) {
          res.Return.tbodyList.forEach(view => {
            this.viewList.push(view);
          });
        } else {
          this.viewList = res.Return.tbodyList;
        }
      });
    },
    handleReachBottom: function() {
      //引用滚动加载
      let _this = this;
      if (this.searchParam.currentPage) {
        this.searchParam.processCurrentPage += 1;
      }

      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
          if (_this.processCurrentPage > 1 && _this.processCurrentPage > _this.processPageCount) {
            _this.loadingTip = this.$t('page.loadfinish');
            return;
          } else {
            _this.getTaskList();
          }
        }, 1000);
      });
    },
    toViewList() {
      this.$router.push({ path: '/customview-manage' });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scope>
@import '../public/common.less';
.right-top {
  height: 38px !important;
  margin-bottom: 12px;
}
.iconWidth {
  width: 20px !important;
  line-height: 24px !important;
  height: 36px !important;
}
.ci-label {
  margin-bottom: 4px;
}
</style>
