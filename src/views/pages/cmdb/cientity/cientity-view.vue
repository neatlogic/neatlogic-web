<template>
  <div>
    <TsContain
      :hideHeader="hideHeader"
      :enableCollapse="!ciEntityData.isVirtual"
      border="border"
      :rightWidth="220"
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <div v-if="!ciEntityData.isVirtual" class="action-item">
            <TsFormSwitch
              :value="showContent === 'topo'"
              :trueValue="true"
              :falseValue="false"
              :trueText="$t('term.cmdb.hidetopo')"
              :falseText="$t('term.cmdb.showtopo')"
              :showStatus="true"
              @on-change="
                val => {
                  if (val) {
                    showContent = 'topo';
                  } else {
                    showContent = 'main';
                  }
                }
              "
            ></TsFormSwitch>
          </div>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group" style="text-align: right">
          <span v-if="ciEntityData && ciEntityData.authData && ciEntityData.authData.cientityupdate" class="action-item tsfont-edit" @click="toEditCiEntity">{{ $t('page.edit') }}</span>
          <span v-if="ciEntityData && ciEntityData.authData && ciEntityData.authData.cimanage" class="action-item tsfont-ci" @click="editCustomView()">{{ $t('term.cmdb.customview') }}</span>
          <span v-if="unCommitTransactionCount && ciEntityData && ciEntityData.authData && ciEntityData.authData.transactionmanage" class="action-item tsfont-unsend" @click="openTransactionDialog">
            {{ $t('term.cmdb.uncommittransaction') }}
            <sup class="tsfont-dot text-error"></sup>
          </span>
          <span v-if="!ciEntityData.isVirtual" class="action-item tsfont-sla" @click="isHistoryShow = !isHistoryShow">{{ $t('term.cmdb.history') }}</span>
          <!-- <Button v-if="ciEntityData && ciEntityData.authData && ciEntityData.authData.cientityupdate" type="primary" @click="toEditCiEntity">编辑</Button> -->
        </div>
      </template>
      <template v-slot:sider>
        <div>
          <div class="margin-sm">
            <div class="text-action" :class="activedPanel == 'attr' ? 'text-primary' : ''" @click="switchCard('attr')">
              <i class="tsfont-block mr-xs"></i>
              <span>{{ $t('term.cmdb.basicattribute') }}</span>
            </div>
          </div>
          <Divider v-if="relGroupList" orientation="start" style="margin: 3px 0px; font-size: 13px">{{ $t('page.relation') }}</Divider>
          <div v-for="(group, index) in relGroupList" :key="index" class="margin-sm">
            <div v-if="group.name" class="text-type border-color mb-sm">
              <span class="text-grey">{{ group.name }}</span>
            </div>
            <div
              v-for="(rel, rindex) in group.relList"
              :key="rindex"
              :class="{ 'text-primary': showContent == 'main' && activedPanel == 'rel' + rel.direction + '_' + rel.id }"
              class="mb-sm text-action"
              :style="getRelEntityCount('rel' + rel.direction + '_' + rel.id) ? 'cursor:pointer' : ''"
              @click="switchCard('rel' + rel.direction + '_' + rel.id)"
            >
              <div v-if="rel.direction == 'from'">
                <i :class="rel.toCiIcon" class="mr-xs"></i>
                <span>{{ rel.toLabel }}</span>
                <span v-if="getRelEntityCount('rel' + rel.direction + '_' + rel.id)" class="count border-color text-grey" v-html="getRelEntityCount('rel' + rel.direction + '_' + rel.id)"></span>
              </div>
              <div v-else-if="rel.direction == 'to'">
                <i :class="rel.fromCiIcon" class="mr-xs"></i>
                <span>{{ rel.fromLabel }}</span>
                <span v-if="getRelEntityCount('rel' + rel.direction + '_' + rel.id)" class="count border-color text-grey" v-html="getRelEntityCount('rel' + rel.direction + '_' + rel.id)"></span>
              </div>
            </div>
          </div>
          <Divider v-if="customViewList && customViewList.length > 0" orientation="start" style="margin: 3px 0px; font-size: 13px">{{ $t('term.cmdb.customview') }}</Divider>
          <div class="margin-sm">
            <div
              v-for="(customView, index) in customViewList"
              :key="index"
              class="text-action mb-sm customview-item"
              :class="{ 'text-href': showContent == 'customview' && customView.id == customViewId }"
              @click="showCustomViewData(customView)"
            >
              <i class="mr-xs" :class="customView.icon || 'tsfont-blocklist'"></i>
              <span>{{ customView.name }}</span>
              <span v-if="customView.type === 'scene' && ciEntityData && ciEntityData.authData && ciEntityData.authData.cimanage" class="edit-view tsfont-edit text-action" @click.stop="editCustomView(customView.id)"></span>
            </div>
          </div>
        </div>
      </template>
      <div slot="content" class="ci-content border-color">
        <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
        <div class="ci-right">
          <div :class="!hideHistory && isHistoryShow && !ciEntityData.isVirtual ? '' : 'middleMax'" class="middle bg-block radius-lg">
            <div class="middle-main">
              <div class="middle-block">
                <div v-if="showContent == 'main'">
                  <Card :bordered="false" dis-hover>
                    <div slot="title" class="card-top">
                      <div class="title text-grey">
                        <span :class="ciEntityData.ciIcon" class="mr-md"></span>
                        {{ ciEntityData.name }}
                        <sup style="font-weight: normal" class="fz10">{{ ciEntityData.ciLabel }}({{ ciEntityData.ciName }})</sup>
                      </div>
                    </div>
                    <div>
                      <div v-if="activedPanel == 'attr' || activedPanel == ''">
                        <Tabs
                          v-if="attrGroupList && attrGroupList.length > 0"
                          v-model="activedGroup"
                          type="card"
                          style="margin: 0px"
                          :animated="false"
                        >
                          <TabPane :label="$t('term.cmdb.defaultattribute')" name=""></TabPane>
                          <TabPane :label="$t('term.cmdb.allattribute')" name="#all"></TabPane>
                          <TabPane
                            v-for="(group, index) in attrGroupList"
                            :key="index"
                            :name="group"
                            :label="group"
                          ></TabPane>
                        </Tabs>
                        <div v-if="(attrList && attrList.length > 0) || (globalAttrList && globalAttrList.length > 0) || (constList && constList.length > 0)" class="attr-main mt-md">
                          <div
                            v-for="(attr, index) in attrListGrouped"
                            :key="index"
                            class="attr-item"
                            :class="attr.type == 'textarea' ? ' attr-item-row' : ''"
                          >
                            <div class="attr-title text-grey overflow">
                              <Tooltip v-if="attr._type === 'attr' || attr._type === 'const'" :content="attr.label" placement="top">
                                {{ attr.label }}
                              </Tooltip>
                              <Tooltip v-else-if="attr._type === 'global'" :content="attr.attrLabel" placement="top">
                                <span class="tsfont-websphere">{{ attr.attrLabel }}</span>
                              </Tooltip>
                            </div>
                            <div class="attr-content">
                              <div v-if="attr._type === 'attr'" class="content">
                                <AttrViewer
                                  v-if="ciEntityData.attrEntityData && ciEntityData.attrEntityData['attr_' + attr.id]"
                                  :handler="ciEntityData.attrEntityData['attr_' + attr.id].type"
                                  :ciEntity="ciEntityData"
                                  :attrEntity="ciEntityData.attrEntityData['attr_' + attr.id]"
                                  :authData="ciEntityData.authData"
                                  mode="detail"
                                ></AttrViewer>
                                <div v-else>-</div>
                              </div>
                              <div v-else-if="attr._type === 'global'">
                                <div v-if="attr.valueList && attr.valueList.length > 0">
                                  <Tag v-for="(v, vindex) in attr.valueList" :key="vindex">{{ v.value }}</Tag>
                                </div>
                              </div>
                              <div v-else-if="attr._type === 'const'" class="content" v-html="ciEntityData[attr.name.replace('_', '')] || '-'"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!--关系开始-->
                      <div v-if="relList && relList.length > 0">
                        <div v-for="(rel, index) in relList" :key="index">
                          <div v-if="activedPanel == 'rel' + rel.direction + '_' + rel.id || (activedPanel == '' && ciEntityData && ciEntityData.relEntityData && ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id] && ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id]['valueList'])" class="rel-block border-color">
                            <Divider v-if="rel.direction == 'from'" plain orientation="left">{{ rel.toLabel }}</Divider>
                            <Divider v-else-if="rel.direction == 'to'" plain orientation="left">{{ rel.fromLabel }}</Divider>
                            <div v-if="ciEntityData && ciEntityData.relEntityData && ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id] && ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id]['valueList']" class="rel-item">
                              <div v-if="rel.direction == 'from'">
                                <SubCiEntityList
                                  :ciId="rel.toCiId"
                                  :needCondition="false"
                                  :needAction="false"
                                  :direction="rel.direction == 'from' ? 'to' : 'from'"
                                  :relCiEntityId="ciEntityData.id"
                                  :relId="rel.id"
                                  :pageSize="10"
                                  :mode="mode"
                                  :fixedHeader="false"
                                ></SubCiEntityList>
                              </div>
                              <div v-else-if="rel.direction == 'to'">
                                <SubCiEntityList
                                  :ciId="rel.fromCiId"
                                  :needCondition="false"
                                  :needAction="false"
                                  :direction="rel.direction == 'from' ? 'to' : 'from'"
                                  :relCiEntityId="ciEntityData.id"
                                  :relId="rel.id"
                                  :pageSize="10"
                                  :mode="mode"
                                  :fixedHeader="false"
                                ></SubCiEntityList>
                              </div>
                            </div>
                            <div v-else class="text-grey">{{ $t('page.nodata') }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                <div v-else-if="showContent == 'topo'">
                  <CiEntityTopo
                    v-if="ciEntityData.id"
                    ref="ciEntityTopo"
                    :ciEntityId="ciEntityData.id"
                    :ciId="ciEntityData.ciId"
                  ></CiEntityTopo>
                </div>
                <div v-else-if="showContent == 'customview'" class="padding-md">
                  <CustomViewDetailData mode="particular" :viewId="customViewId" :ciEntityId="ciEntityId"></CustomViewDetailData>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!hideHistory" v-show="isHistoryShow && !ciEntityData.isVirtual" class="right">
            <HistoryList :ciEntityId="ciEntityData.id" :ciId="ciEntityData.ciId" @refresh="refresh"></HistoryList>
          </div>
        </div>
      </div>
    </TsContain>
    <TransactionDialog
      v-if="isTransactionDialogShow"
      :ciEntityId="ciEntityId"
      :ciId="ciId"
      @close="closeTransactionDialog"
    ></TransactionDialog>
    <CustomViewDialog
      v-if="isCustomViewShow"
      :viewId="customViewId"
      :ciId="ciId"
      @close="closeCustomViewDialog"
    ></CustomViewDialog>
  </div>
</template>
<script>
import AttrViewer from './attr-viewer.vue';
import SubCiEntityList from './cientity-list.vue';

export default {
  name: '',
  components: {
    AttrViewer,
    SubCiEntityList,
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    CustomViewDetailData: resolve => require(['@/views/pages/cmdb/customview/view-detail-data.vue'], resolve),
    CustomViewDialog: resolve => require(['./ci-customview-dialog.vue'], resolve),
    HistoryList: resolve => require(['./history-list.vue'], resolve),
    CiEntityTopo: resolve => require(['./cientity-topo.vue'], resolve),
    TransactionDialog: resolve => require(['./transaction-dialog.vue'], resolve)
  },
  props: {
    propCiId: { type: Number },
    propCiEntityId: { type: Number },
    hideHeader: { type: Boolean, default: false },
    hideHistory: { type: Boolean, default: false },
    mode: { type: String, default: 'page' } //page模式或dialog模式，如果是dialog模式将会禁用所有路由跳转
  },
  data() {
    return {
      isLoading: false,
      isCustomViewShow: false, //配置视图窗口
      showContent: 'main',
      ciId: null,
      ciEntityId: null,
      customViewId: null,
      ciEntityData: {},
      customViewList: [], //自定义视图列表
      activedPanel: '',
      attrEntityData: {},
      relEntityData: {},
      constList: [],
      attrList: [],
      globalAttrList: [],
      attrGroupList: [],
      relList: [],
      activedGroup: '',
      leftHeight: 0,
      isHistoryShow: true, //修改历史是否显示,默认显示
      isSiderHide: false,
      unCommitTransactionCount: 0, //未提交事务数量
      isTransactionDialogShow: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.ciId = Math.floor(this.$route.params['ciId']) || this.propCiId;
    this.ciEntityId = Math.floor(this.$route.params['id']) || this.propCiEntityId;
    this.getCiEntityById();
    this.getAttrByCiId();
    this.getRelByCiId();
    this.getGlobalAttr();
    this.getConstList();
    this.getCustomViewList();
    this.getUnCommitTransactionCount();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    showCustomViewData(customView) {
      if (customView._type === 'data') {
        if (customView.type === 'scene') {
          this.customViewId = customView.id;
          this.showContent = 'customview';
        } else {
          this.$router.push({ path: '/view-detail/' + customView.id + '/' + this.ciEntityId });
        }
      } else if (customView._type === 'topo') {
        this.$router.push({ path: '/graph-data/' + customView.id });
      }
    },
    async getCustomViewList() {
      this.customViewList = [];
      await this.$api.cmdb.customview.searchSceneCustomView({ ciId: this.ciId, needPage: false }).then(res => {
        res.Return.tbodyList.forEach(d => {
          this.customViewList.push({ ...d, _type: 'data' });
        });
      });
      await this.$api.cmdb.customview.searchCustomView({ startCiId: this.ciId, needPage: false }).then(res => {
        res.Return.tbodyList.forEach(d => {
          this.customViewList.push({ ...d, _type: 'data' });
        });
      });
      await this.$api.cmdb.graph.searchGraph({ ciEntityId: this.ciEntityId, needPage: false }).then(res => {
        res.Return.tbodyList.forEach(d => {
          this.customViewList.push({ ...d, _type: 'topo' });
        });
      });
    },
    closeCustomViewDialog(needRefresh) {
      this.isCustomViewShow = false;
      if (needRefresh) {
        this.getCustomViewList();
      }
    },
    editCustomView(id) {
      if (id) {
        this.customViewId = id;
      } else {
        this.customViewId = null;
      }
      this.isCustomViewShow = true;
    },
    refresh() {
      //回滚历史后调用此方法进行刷新，清空ciEntityData后重新绑定才能更新关系和引用属性信息
      this.ciEntityData = {};
      this.$nextTick(() => {
        this.getCiEntityById();
      });
    },
    openTransactionDialog() {
      this.isTransactionDialogShow = true;
    },
    closeTransactionDialog(needRefresh) {
      this.isTransactionDialogShow = false;
      if (needRefresh) {
        this.getUnCommitTransactionCount();
      }
    },
    getUnCommitTransactionCount() {
      this.$api.cmdb.transaction.searchTransactionCount({ ciEntityId: this.ciEntityId, status: 'uncommit' }).then(res => {
        this.unCommitTransactionCount = res.Return;
      });
    },
    getRelEntityCount(label) {
      if (this.ciEntityData && this.ciEntityData.relEntityData && this.ciEntityData.relEntityData[label] && this.ciEntityData.relEntityData[label]['valueList']) {
        const len = this.ciEntityData.relEntityData[label]['valueList'].length;
        if (len > this.ciEntityData.maxRelEntityCount) {
          return this.ciEntityData.maxRelEntityCount + '+';
        } else {
          return len;
        }
      } else {
        return 0;
      }
    },
    switchCard(card) {
      this.showContent = 'main';
      this.activedPanel = this.activedPanel === card ? '' : card;
    },
    toEditCiEntity() {
      this.$router.push({ path: '/ci/' + this.ciId + '/cientity-edit/' + this.ciEntityId });
    },
    getRelEntityByRelId(relId, direction) {
      if (this.ciEntityData.relEntityList && this.ciEntityData.relEntityList.length > 0) {
        return this.ciEntityData.relEntityList.filter(d => {
          if (d.relId == relId && d.direction == direction) {
            return true;
          }
        });
      } else {
        return [];
      }
    },
    getRelCiEntityId(relEntityData) {
      return relEntityData.map(d => d.ciEntityId);
    },
    getConstList() {
      this.$api.cmdb.ci.getViewConstList(this.ciId, 'detail').then(res => {
        this.constList = res.Return;
      });
    },
    getCiEntityById() {
      if (this.ciEntityId) {
        this.isLoading = true;
        this.$api.cmdb.cientity
          .getCiEntityById(this.ciId, this.ciEntityId, true, true, true)
          .then(res => {
            this.ciEntityData = res.Return;
            if (this.ciEntityData.isVirtual) {
              this.isSiderHide = true;
            }
            if (this.ciEntityData && this.ciEntityData.attrEntityList && this.ciEntityData.attrEntityList.length > 0) {
              this.ciEntityData.attrEntityList.forEach(element => {
                this.attrEntityData[element.attrId] = element.actualValueList;
              });
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    },
    getGlobalAttr() {
      this.$api.cmdb.globalattr.getCiEntityGlobalAttr(this.ciEntityId, { showType: 'detail' }).then(res => {
        this.globalAttrList = res.Return;
      });
    },
    getAttrByCiId() {
      if (this.ciId) {
        this.$api.cmdb.ci.getAttrByCiId(this.ciId, { showType: 'detail' }).then(res => {
          this.attrList = res.Return;
          this.attrGroupList = [];
          if (this.attrList && this.attrList.length > 0) {
            this.attrList.forEach(element => {
              if (element.groupName && !this.attrGroupList.includes(element.groupName)) {
                this.attrGroupList.push(element.groupName);
              }
            });
          }
        });
      }
    },
    getRelByCiId() {
      if (this.ciId) {
        this.$api.cmdb.ci.getRelByCiId(this.ciId, { needAction: false, showType: 'detail' }).then(res => {
          this.relList = res.Return;
        });
      }
    },
    isTslayout() {
      this.isSiderHide = !this.isSiderHide;
      //等待窗口改变完毕再执行
      window.setTimeout(() => {
        if (this.$refs['ciEntityTopo']) {
          this.$refs['ciEntityTopo'].resizeSVG();
        }
      }, 300);
    }
  },
  filter: {},
  computed: {
    attrListGrouped() {
      let finalList = [];
      if (this.attrList && this.attrList.length > 0) {
        this.attrList.forEach(attr => {
          finalList.push({ _type: 'attr', ...attr });
        });
      }
      if (this.globalAttrList && this.globalAttrList.length > 0) {
        this.globalAttrList.forEach(attr => {
          finalList.push({ _type: 'global', ...attr });
        });
      }
      if (this.constList && this.constList.length > 0) {
        this.constList.forEach(attr => {
          finalList.push({ _type: 'const', ...attr });
        });
      }
      if (finalList.length > 0) {
        finalList.sort((a, b) => {
          return a.sort - b.sort;
        });
      }
      if (this.activedGroup == '#all') {
        return finalList;
      } else {
        if (!this.activedGroup) {
          return finalList.filter(attr => !attr.groupName);
        } else {
          return finalList.filter(attr => attr.groupName == this.activedGroup);
        }
      }
    },
    relGroupList() {
      let groupList = {};
      if (this.relList && this.relList.length > 0) {
        this.relList.forEach(element => {
          if (element.direction == 'from') {
            if (!groupList[element.fromGroupId]) {
              groupList[element.fromGroupId] = { name: element.fromGroupName, relList: [element] };
            } else {
              groupList[element.fromGroupId]['relList'].push(element);
            }
          } else if (element.direction == 'to') {
            if (!groupList[element.toGroupId]) {
              groupList[element.toGroupId] = { name: element.toGroupName, relList: [element] };
            } else {
              groupList[element.toGroupId]['relList'].push(element);
            }
          }
        });
      }
      return groupList;
    }
  },
  watch: {
    isHistoryShow: {
      handler: function() {
        //等待窗口改变完毕再执行
        window.setTimeout(() => {
          if (this.$refs['ciEntityTopo']) {
            this.$refs['ciEntityTopo'].resizeSVG();
          }
        }, 300);
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
@import '../public/common.less';
.customview-item {
  position: relative;
  .edit-view {
    visibility: hidden;
    position: absolute;
    right: 0px;
    top: 2px;
  }
}
.customview-item:hover {
  .edit-view {
    visibility: visible;
  }
}
.ivu-collapse-header {
  height: 38px !important;
  line-height: 38px !important;
  padding-left: 16px !important;
}
.left {
  padding: @space-sm;
  height: 100%;
  position: relative;
  width: 250px;
  float: left;
  border-right: 1px solid;
  overflow: auto;
}
.right {
  padding: @space-sm;
  height: calc(100vh - 116px);
  position: relative;
  width: 220px;
  float: left;
  overflow: auto;
}
.middle {
  position: relative;
  height: calc(100vh - 116px);
  width: calc(100% - 220px);
  float: left;
  overflow: auto;
  transition: all 200ms;
  .middle_content {
    height: 100%;
    width: 80%;
    margin: 0 auto;
    padding: @space-md 0;
  }
}
.middleMax {
  width: 100%;
  transition: all 200ms;
}
.text-ci .count {
  border: 1px solid;
  border-radius: 10px;
  margin-left: 5px;
  padding: 1px 5px;
}
.card-top {
  .title {
    font-size: 16px;
    font-weight: bold;
  }
  .group {
    display: flex;
    .item {
      padding: 0 10px;
      position: relative;
      &:not(:last-child):after {
        content: '|';
        color: @dividing-color;
        top: 0;
        right: 0;
        position: absolute;
      }
    }
  }
}
.rel-block {
  padding: 0px 0px 10px 0px;
  .rel-title {
    margin-bottom: 4px;
  }
}
.cientity-label {
  text-align: right;
}
.cientity-item {
  margin-bottom: 10px;
  .label {
    margin-bottom: 4px;
  }
  .content {
    min-height: 20px;
  }
}

.attr-main {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 10px;
  .attr-item-row {
    grid-column-start: 1;
    grid-column-end: 3;
  }
  .attr-item {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 120px auto;
    .attr-title {
      text-align: left;
      padding: 3px;
    }
    .attr-content {
      padding: 3px;
    }
    .attr-content .content {
      word-break: break-all;
    }
  }
}
</style>
