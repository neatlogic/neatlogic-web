<template>
  <div>
    <TsContain border="border" :enableCollapse="true" navHeaderBottom="none">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topRight>
        <div v-if="ciData.authData" class="dashboard-action action-group" style="text-align: right">
          <span v-if="ciData.authData['cimanage']" class="action-item tsfont-edit" @click="editCi()">{{ $t('term.cmdb.editci') }}</span>
          <span v-if="!ciData.isVirtual && !ciData.isAbstract && ciData.authData['cientityinsert']" class="action-item tsfont-plus pad0" @click="addCiEntity()">{{ $t('term.cmdb.cientity') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <div>
          <ciTypeList :ciId="ciId && parseInt(ciId)" :toggleable="false" @click="switchCi"></ciTypeList>
        </div>
      </template>
      <div slot="content" class="ci-content border-color">
        <div>
          <Loading v-if="isLoading" :loading-show="isLoading" type="fix"></Loading>
          <div class="ci-info">
            <div class="ci-icon" :class="getIconClass()">
              <i :class="ciData.icon" class="ci-icon"></i>
            </div>
            <div class="ci-detail">
              <div>
                <span class="ci-label">{{ ciData.label }}</span>
                <span class="ci-name text-grey">({{ ciData.name }})</span>
              </div>
              <div class="fz10 text-grey">{{ ciData.id }}</div>
              <div class="text-grey fz10">
                <span v-if="ciData.isVirtual">{{ $t('term.cmdb.virtualci') }}</span>
                <span v-if="ciData.isAbstract">{{ $t('term.cmdb.abstractci') }}</span>
                <Divider v-if="ciData.isAbstract && ciData.parentCiId" type="vertical" />
                <span v-if="ciData.parentCiId">
                  {{ $t('term.cmdb.extendto') }}
                  <a href="javascript:void(0)" @click="toParentCi(ciData.parentCiId)">{{ ciData.parentCiLabel }}</a>
                </span>
                <Divider v-if="childrenList && childrenList.length > 0" type="vertical" />
                <span v-if="childrenList && childrenList.length > 0">
                  {{ $t('term.cmdb.subci') }}
                  <a
                    v-for="(child, cindex) in childrenList"
                    :key="cindex"
                    class="mr-xs"
                    @click="toParentCi(child.id)"
                  >{{ child.label }}</a>
                  <Poptip
                    v-if="childrenList.length < ciData.children.length"
                    word-wrap
                    width="500"
                    placement="bottom"
                    :transform="true"
                    trigger="hover"
                  >
                    <a class="tsfont-option-horizontal"></a>
                    <div slot="content" class="api">
                      <a
                        v-for="(child, cindex) in ciData.children.slice(3)"
                        :key="cindex"
                        class="mr-xs"
                        @click="toParentCi(child.id)"
                      >{{ child.label }}</a>
                    </div>
                  </Poptip>
                </span>
              </div>
              <div v-if="ciData.description" class="ci-description text-grey overflow fz10" :title="ciData.description">{{ ciData.description }}</div>
            </div>
          </div>
          <div class="mt-nm">
            <Tabs v-model="currentTab" class="block-tabs">
              <TabPane :label="$t('term.cmdb.cientitylist')" name="cientity">
                <CiEntityList
                  v-if="currentTab == 'cientity'"
                  ref="CiEntityList"
                  :needCheck="true"
                  :needDsl="true"
                  class="pt-nm pl-nm pr-nm"
                  :ciId="ciData.id"
                  :needExport="true"
                ></CiEntityList>
              </TabPane>
              <TabPane v-if="!ciData.isVirtual && ciData.authData && (ciData.authData['transactionmanage'] || ciData.authData['cimanage'])" :label="$t('term.cmdb.uncommittransaction')" name="transaction">
                <TransactionList
                  v-if="currentTab == 'transaction'"
                  class="pt-nm pl-nm pr-nm bg-op border8"
                  :needCheck="true"
                  :needAction="true"
                  :ciId="ciData.id"
                ></TransactionList>
              </TabPane>
              <TabPane v-if="!ciData.isVirtual && ciData.authData && (ciData.authData['cientityrecover'] || ciData.authData['cimanage'])" :label="$t('page.deleteaudit')" name="deletecientity">
                <DeleteCiEntityList
                  v-if="currentTab == 'deletecientity'"
                  class="pt-nm pl-nm pr-nm bg-op border8"
                  :ciId="ciData.id"
                  @toCiEntity="switchCi"
                ></DeleteCiEntityList>
              </TabPane>
              <template v-if="!ciData.isVirtual && illegalList && illegalList.length > 0">
                <TabPane
                  v-for="illegal in illegalList"
                  :key="illegal.id"
                  :label="
                    h => {
                      return h('div', [
                        h('span', { class: { 'mr-xs': true } }, illegal.name),
                        h('Badge', {
                          props: {
                            count: illegal.illegalCiEntityCount
                          }
                        })
                      ]);
                    }
                  "
                  :name="'illegal_' + illegal.id"
                >
                  <IllegalCiEntityList
                    v-if="currentTab == 'illegal_' + illegal.id"
                    :legalValidId="illegal.id"
                    class="pt-nm pl-nm pr-nm bg-op border8"
                    :ciId="ciData.id"
                  ></IllegalCiEntityList>
                </TabPane>
              </template>
            </Tabs>
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CiEntityList: resolve => require(['./cientity-list.vue'], resolve),
    ciTypeList: resolve => require(['../components/ci/ci-type-list.vue'], resolve),
    TransactionList: resolve => require(['./transaction-list.vue'], resolve),
    DeleteCiEntityList: resolve => require(['./delete-cientity-list.vue'], resolve),
    IllegalCiEntityList: resolve => require(['./illegal-cientity-list.vue'], resolve)
  },
  props: {},
  data() {
    return {
      currentTab: 'cientity',
      isSiderHide: false,
      fromPath: '',
      leftHeight: 0,
      ciId: this.$route.params['id'],
      ciData: {},
      sessionName: 'civiewbox',
      isLoading: true,
      illegalList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getIconClass() {
      if (this.ciData) {
        if (this.ciData.isVirtual) {
          return 'text-grey';
        } else {
          if (!this.ciData.isAbstract) {
            return 'text-primary';
          } else {
            return 'text-default';
          }
        }
      }
    },
    async init() {
      this.$addHistoryData('ciId', this.ciId);
      await this.getCiById();
      this.getIllegalCiEntityCount();
    },
    getIllegalCiEntityCount() {
      this.$api.cmdb.cientity.getIllegalCiEntityCount(this.ciId).then(res => {
        this.illegalList = res.Return;
      });
    },
    toParentCi(ciId) {
      const ci = { id: ciId };
      this.switchCi(ci);
    },
    switchCi(ci) {
      this.ciId = String(ci.id);
      this.init();
    },
    addCiEntity() {
      this.$router.push({ path: '/ci/' + this.ciId + '/cientity-edit/' });
    },
    editCi() {
      this.$router.push({ path: '/ci-detail/' + this.ciId });
    },
    getLeftHeight: function() {
      window.setTimeout(() => {
        if (this.$refs.lefter) {
          this.leftHeight = this.$refs.lefter.offsetHeight;
        }
      }, 500);
    },
    async getCiById() {
      await this.$api.cmdb.ci.getCiById(this.ciId, { needAction: true, needChildren: true }).then(res => {
        if (res.Status == 'OK') {
          this.ciData = res.Return;
          this.isLoading = false;
        }
      });
    },
    isTslayout() {
      this.isSiderHide = !this.isSiderHide;
    },
    restoreHistory(historyData) {
      if (historyData.ciId && this.ciId != historyData.ciId) {
        const ci = { id: historyData.ciId };
        this.switchCi(ci);
      }
    }
  },
  filter: {},
  computed: {
    fromPageName() {
      return this.$route.meta.fromPage && this.$route.meta.fromPage.title ? this.$route.meta.fromPage.title : '模型列表';
    },
    childrenList() {
      if (this.ciData && this.ciData.children && this.ciData.children.length > 0) {
        return this.ciData.children.length > 3 ? this.ciData.children.slice(0, 3) : this.ciData.children;
      }
      return [];
    }
  },
  watch: {},
  beforeRouteEnter(to, from, next) {
    to.meta.fromPage = { path: from.fullPath, title: from.meta.title };
    next();
  }
};
</script>
<style lang="less" scoped>
@import '../public/common.less';
.bg-selected {
  background-color: transparent !important;
  line-height: inherit;
  width: 30px !important;
  margin-right: 0px !important;
  position: relative;
  .ci-icon {
    position: absolute;
    top: -5px;
    left: 0px;
  }
}
.border8 {
  border-radius: 0px 8px 8px 8px;
}
/deep/ .right-top {
  height: 58px !important;
  padding: 0 16px 0 0px !important;
}
/deep/.action-item {
  padding: 0 16px 0 0px !important;
}
.pad0 {
  padding: 0 !important;
}
.ci-info {
  display: grid;
  grid-template-columns: 60px auto;
  grid-gap: 0px;
  .ci-icon {
    align-self: center;
    justify-self: center;
    font-size: 25px;
  }
}
</style>
