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
          <ciTypeList
            :ciId="ciId && parseInt(ciId)"
            :toggleable="false"
            :isShowInCiEntityQuery="1"
            @click="switchCi"
          ></ciTypeList>
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
            <Tabs
              v-model="currentTab"
              name="cmdb-ci-view"
              class="block-tabs"
              :animated="false"
            >
              <TabPane
                :label="$t('term.cmdb.cientitylist')"
                name="cientity"
                tab="cmdb-ci-view"
                :index="1"
              >
                <CiEntityList
                  v-if="currentTab === 'cientity'"
                  ref="CiEntityList"
                  :needCheck="true"
                  :needDsl="true"
                  class="pt-nm pl-nm pr-nm"
                  :fixedHeader="false"
                  :ciId="ciData.id"
                  :ciData="ciData"
                  :needExport="true"
                ></CiEntityList>
              </TabPane>
              <TabPane
                v-if="!ciData.isVirtual && ciData.authData && (ciData.authData['transactionmanage'] || ciData.authData['cimanage'])"
                :label="$t('term.cmdb.uncommittransaction')"
                name="transaction"
                tab="cmdb-ci-view"
                :index="2"
              >
                <TransactionList
                  v-if="currentTab === 'transaction'"
                  class="pt-nm pl-nm pr-nm bg-op border8"
                  :needCheck="true"
                  :needAction="true"
                  :ciId="ciData.id"
                ></TransactionList>
              </TabPane>
              <TabPane
                v-if="!ciData.isVirtual && ciData.authData && (ciData.authData['cientityrecover'] || ciData.authData['cimanage'])"
                :label="$t('page.deleteaudit')"
                name="deletecientity"
                tab="cmdb-ci-view"
                :index="3"
              >
                <DeleteCiEntityList
                  v-if="currentTab === 'deletecientity'"
                  class="pt-nm pl-nm pr-nm bg-op border8"
                  :ciId="ciData.id"
                  @toCiEntity="switchCi"
                ></DeleteCiEntityList>
              </TabPane>
              <template v-if="!ciData.isVirtual && illegalList && illegalList.length > 0">
                <TabPane
                  v-for="(illegal, illegalIndex) in illegalList"
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
                  tab="cmdb-ci-view"
                  :index="illegalIndex + 4"
                >
                  <IllegalCiEntityList
                    v-if="currentTab == 'illegal_' + illegal.id"
                    :legalValidId="illegal.id"
                    class="pt-nm pl-nm pr-nm bg-op border8"
                    :ciId="ciData.id"
                  ></IllegalCiEntityList>
                </TabPane>
              </template>
              <TabPane
                v-if="canViewCmdbEventAudit"
                :label="$t('term.cmdb.eventaudit.title')"
                name="eventaudit"
                tab="cmdb-ci-view"
                :index="illegalList.length + 4"
              >
                <component
                  :is="cmdbEventAuditPanel"
                  v-if="currentTab === 'eventaudit'"
                  :key="ciData.id"
                  ref="cmdbEventAudit"
                  class="pt-nm pl-nm pr-nm"
                  :ciData="ciData"
                  :ciEntityId="auditCiEntityId"
                ></component>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
import ComponentManager from '@/resources/import/component-manager.js';
export default {
  name: '',
  components: {
    CiEntityList: () => import('./cientity-list.vue'),
    ciTypeList: () => import('@/views/pages/cmdb/components/ci/ci-type-list.vue'),
    TransactionList: () => import('./transaction-list.vue'),
    DeleteCiEntityList: () => import('./delete-cientity-list.vue'),
    IllegalCiEntityList: () => import('./illegal-cientity-list.vue')
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
      illegalList: [],
      ciLoadEpoch: 0,
      auditCiEntityId: null,
      auditRoutePending: this.$route.query.tab === 'eventaudit'
    };
  },
  beforeCreate() {},
  created() {
    this.auditCiEntityId = this.auditRoutePending ? this.parseAuditCiEntityId(this.$route.query.ciEntityId) : null;
  },
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    // 使模型和校验的迟到响应失效。
    this.ciLoadEpoch++;
  },
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
    // 一次模型加载同时约束详情、校验数量和事件页签的路由意图。
    async init() {
      const ciId = this.ciId;
      const epoch = ++this.ciLoadEpoch;
      this.currentTab = 'cientity';
      this.ciData = {};
      this.illegalList = [];
      this.isLoading = true;
      this.$addHistoryData('ciId', ciId);
      await this.getCiById(ciId, epoch);
      if (!this.isCurrentCiLoad(ciId, epoch) || !this.ciData.id) return;
      if (this.auditRoutePending) {
        this.auditRoutePending = false;
        if (this.canViewCmdbEventAudit) this.currentTab = 'eventaudit';
      }
      this.getIllegalCiEntityCount(ciId, epoch);
    },
    // 配置项范围只接受正整数，非法路由参数不授予受限查询入口。
    parseAuditCiEntityId(value) {
      if (Array.isArray(value) || value == null || !/^\d+$/.test(String(value))) return null;
      const id = Number(value);
      return Number.isSafeInteger(id) && id > 0 ? id : null;
    },
    // 模型切换或组件销毁后禁止旧请求回写。
    isCurrentCiLoad(ciId, epoch) {
      return !this._isDestroyed && epoch === this.ciLoadEpoch && String(ciId) === String(this.ciId);
    },
    async getIllegalCiEntityCount(ciId, epoch) {
      const res = await this.$api.cmdb.cientity.getIllegalCiEntityCount(ciId);
      if (this.isCurrentCiLoad(ciId, epoch)) this.illegalList = res.Return;
    },
    toParentCi(ciId) {
      const ci = { id: ciId };
      this.switchCi(ci);
    },
    // 手工切模型不重新应用原路由中的事件范围。
    switchCi(ci) {
      this.auditRoutePending = false;
      this.auditCiEntityId = null;
      this.currentTab = 'cientity';
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
    async getCiById(ciId, epoch) {
      try {
        const res = await this.$api.cmdb.ci.getCiById(ciId, { needAction: true, needChildren: true });
        if (this.isCurrentCiLoad(ciId, epoch) && res.Status === 'OK') this.ciData = res.Return;
      } finally {
        if (this.isCurrentCiLoad(ciId, epoch)) this.isLoading = false;
      }
    },
    isTslayout() {
      this.isSiderHide = !this.isSiderHide;
    },
    // 历史恢复只设置首次加载目标，避免 created 和 mounted 重复发起请求。
    restoreHistory(historyData) {
      if (!this.auditRoutePending && historyData.ciId) this.ciId = String(historyData.ciId);
    }
  },
  filter: {},
  computed: {
    // 商业能力缺失时基础页面保持正常，不加载商业代码。
    cmdbEventAuditPanel() {
      if (typeof COMMERCIAL_MODULES === 'undefined' || !COMMERCIAL_MODULES.includes('cmdb')) return null;
      return (ComponentManager.getComponent('cmdbEventAudit') || {}).panel || null;
    },
    canViewCmdbEventAudit() {
      if (!this.cmdbEventAuditPanel || !this.$AuthUtils.hasRole('CMDB_EVENT_VIEW')) return false;
      const auth = this.ciData.authData || {};
      return !!(auth.cimanage || (auth.cientityquery && this.auditCiEntityId));
    },
    fromPageName() {
      return this.$route.meta.fromPage && this.$route.meta.fromPage.title ? this.$route.meta.fromPage.title : this.$t('term.cmdb.cilist');
    },
    childrenList() {
      if (this.ciData && this.ciData.children && this.ciData.children.length > 0) {
        return this.ciData.children.length > 3 ? this.ciData.children.slice(0, 3) : this.ciData.children;
      }
      return [];
    }
  },
  watch: {
    // 仅业务路由上下文变化时重新应用意图，历史标记等查询参数不重置本地范围。
    $route(to, from) {
      if (String(to.params.id) === String(from.params.id) && to.query.tab === from.query.tab && to.query.ciEntityId === from.query.ciEntityId) return;
      this.ciId = to.params.id;
      this.auditRoutePending = to.query.tab === 'eventaudit';
      this.auditCiEntityId = this.auditRoutePending ? this.parseAuditCiEntityId(to.query.ciEntityId) : null;
      this.init();
    },
    canViewCmdbEventAudit(value) {
      if (!value && this.currentTab === 'eventaudit') this.currentTab = 'cientity';
    }
  },
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
::v-deep .right-top {
  height: 58px !important;
  padding: 0 16px 0 0px !important;
}
::v-deep .action-item {
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
