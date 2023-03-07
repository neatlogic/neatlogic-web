<template>
  <div class="notifytactics-overview">
    <TsContain v-if="handlerConfig" hideHeader>
      <div slot="content">
        <Tabs 
          :value="handlerConfig.value"
          class="block-tabs"
          :animated="false"
          name="tab1"
          @on-click="changeTab"
        >
          <TabPane
            v-for="tab in handlerList"
            :key="tab.value"
            :label="tab.text"
            :name="tab.value"
            tab="tab1"
          >
            <div v-if="tab.children && tab.children.length > 0" class="padding ">
              <Tabs
                v-model="handler"
                class="block-tabs2"
                :animated="false"
                name="tab2"
                @on-click="changeHandler"
              >
                <TabPane
                  v-for="subtab in tab.children"
                  :key="subtab.value"
                  :label="subtab.text"
                  :name="subtab.value"
                  tab="tab2"
                >
                </TabPane>
                <div class="notify-card padding">
                  <Loading :loadingShow="loadingShow" type="fix"></Loading>
                  <div v-if="isShow" class="search-box pb-md pt-md">
                    <!-- {{ isShow }} -->
                    <div class="action-group">
                      <span class="tsfont-plus action-item" @click="addTactics">策略</span>
                      <span class="tsfont-upload action-item" @click="importTactics">导入</span>
                    </div>
                    <div class="search-right input-border">
                      <InputSearcher
                        v-model="keyword"
                        @change="search(1)"
                      ></InputSearcher>
                    </div>
                  </div>
                  <div class="notifytactics-card">
                    <Loading :loadingShow="loadingCard" type="fix"></Loading>
                    <TsCard
                      v-if="tacticsData.cardList"
                      v-bind="tacticsData"
                      :sm="12"
                      :lg="8"
                      :xl="6"
                      :xxl="4"
                      :fixBtn="true"
                      :padding="false"
                      :boxShadow="false"
                      :border="true"
                      @action="action"
                      @updatePage="search"
                    >
                      <template slot-scope="{ row }">
                        <div class="overvivew-main" @click="toEdit(row)">
                          <div class="title text-action overflow pb-sm">
                            {{ row.name }}
                          </div>
                          <div class="text-grey overflow des-content">
                            <UserCard v-bind="row.lcuVo" hideAvatar></UserCard>
                            <span class="m-userCard">于{{ row.lcd | formatDate }}{{ row.actionType }}</span>
                          </div>
                        </div>
                      </template>
                    </TsCard>
                  </div>
                </div>
              </Tabs>
            </div>
            <div v-if="tab.value == '定时任务'" class="padding">
              <!-- 定时任务start -->
              <div v-if="tab.value == '定时任务'">
                <TimingTask></TimingTask>
              </div>
              <!-- 定时任务end -->
            </div>
          </TabPane>
        </Tabs>
      </div>
    </TsContain>
    <TsDialog
      type="modal"
      :isShow.sync="tacticsDialog"
      :maskClose="false"
      :hasFooter="true"
    >
      <template v-slot:header>
        <div>{{ isCopy ? '复制策略' : '新建策略' }}</div>
      </template>
      <TsForm ref="addTacticsForm" :itemList="tacticsForm" type="type"></TsForm>
      <template v-slot:footer>
        <Button @click="tacticsDialog = false">取消</Button>
        <Button type="primary" @click="okAddTactics">确定</Button>
      </template>
    </TsDialog>
    <UploadDialog 
      ref="uploadDialog"
      :actionUrl="actionUrl"
      :formatList="formatList"
      @on-success="search(1)"
    />
  </div>
</template>

<script>
import TimingTask from './tacticsedit/timing-task';
// import ReferenceSelect from '@/resources/components/ReferenceSelect/ReferenceSelect.vue';
export default {
  name: 'NotifytacticsOverview',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TimingTask
    // ReferenceSelect
  },
  props: {},
  data() {
    let _this = this;
    return {
      handler: null, 
      actionUrl: BASEURLPREFIX + '/api/binary/notify/policy/import', //导入地址
      formatList: ['pak'], //导入文件格式
      frameworkShow: true,
      isShow: true,
      handlerList: [],
      handlerConfig: null, //模块
      id: null,
      loadingShow: true,
      loadingCard: false,
      keyword: null,
      pageSize: 24,
      currentPage: 1,
      tacticsData: {},
      tacticsDialog: false,
      isCopy: false,
      tacticsForm: [
        //表单数据
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          width: '100%',
          label: '名称',
          validateList: ['required', 'name-special', { 
            name: 'searchUrl',
            url: 'api/rest/notify/policy/save',
            params: (value, rule) => {
              rule.url = this.isCopy ? 'api/rest/notify/policy/copy' : 'api/rest/notify/policy/save';
            }
          }]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.$route.query.addNotify) {
      this.tacticsDialog = true;
    }
    this.handler = this.$route.query.handler || null;
    this.getData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getData() {
      let _this = this;
      let handlerList = await _this.getHandler();
      if (handlerList && handlerList.length > 0 && this.handler != '定时任务') {
        _this.search(1);
      }
    },
    getHandler() {
      return new Promise((resolve, reject) => {
        let _this = this;
        this.$api.framework.tactics.getNotifyHandler().then(res => {
          if (res.Status == 'OK') {
            let handlerList = res.Return;
            _this.handlerList = this.$utils.deepClone(handlerList);
            if (_this.handler) {
              handlerList.forEach(item => {
                if (item.children && item.children.length > 0) {
                  let newObj = item.children.find(d => 
                    d.value == _this.handler
                  );
                  item.children.forEach(j => {
                    if (j.value == _this.handler && item.value == 'framework') {
                      if (j.isAllowMultiPolicy == 0) {
                        this.isShow = false;
                        this.frameworkShow = false;
                      }
                    }
                  });
                  
                  if (newObj) {
                    _this.handlerConfig = item;
                  }
                } else if (item.value == _this.handler) {
                  _this.handlerConfig = item;
                }
              });
            } else {
              _this.handlerConfig = handlerList[0];
              if (this.handlerConfig.children && this.handlerConfig.children.length > 0) {
                this.handler = this.handlerConfig.children[0].value;
              }
            }
            resolve(handlerList);
          }
        });
      });
    },
    search(page) {
      let _this = this;
      _this.loadingCard = true;
      _this.currentPage = Math.floor(page) || _this.currentPage;
      let data = {
        handler: _this.handler,
        currentPage: _this.currentPage,
        pageSize: _this.pageSize
      };
      if (this.keyword) {
        let keyword = _this.keyword.trim();
        _this.$set(data, 'keyword', keyword);
      }
      this.$api.framework.tactics.searchNotifyList(data).then(res => {
        if (res.Status == 'OK') {
          let notifyData = res.Return;
          Object.keys(notifyData).forEach(item => {
            if (item != 'tbodyList') {
              _this.$set(_this.tacticsData, item, notifyData[item]);
            } else {
              _this.$set(_this.tacticsData, 'cardList', notifyData[item]);
            }
          });

          if (!this.frameworkShow) {
            if (this.tacticsData.cardList.length == 0) {
              this.isShow = true;
            } else {
              this.isShow = false;
            }
          } else {
            this.isShow = true;
          }

          if (this.isShow) {
            this.tacticsData.cardList.map(v => {
              v.btnList = [
                {name: '引用', value: 'ReferenceSelect', icon: '', type: 'ReferenceSelect', calleeType: 'notifypolicy', key: 'id'},
                {name: '删除', value: 'del', type: 'del', icon: 'tsfont-trash-o', disable: true, text: '当前表单被流程引用，无法删除', key: 'referenceCount'},
                {
                  name: '多个',
                  value: 'dropdown',
                  icon: '',
                  type: 'dropdown',
                  menuArr: [
                    { name: '复制', value: 'copy', type: 'text' },
                    { name: '导出', value: 'export', type: 'download' }
                  ]
                }
              ];
            });
          } else {
            this.tacticsData.cardList.map(v => {
              v.btnList = [
                {name: '引用', value: 'ReferenceSelect', icon: '', type: 'ReferenceSelect', calleeType: 'notifypolicy', key: 'id'},
                {name: '删除', value: 'del', type: 'del', icon: 'tsfont-trash-o', disable: true, text: '当前表单被流程引用，无法删除', key: 'referenceCount'}
              ];
            });
          }

          _this.currentPage = res.Return.currentPage;
          _this.pageSize = res.Return.pageSize;
          _this.loadingShow = false;
          _this.loadingCard = false;
        }
      });
    },
    changeHandler(val) {
      this.keyword = null;
      this.handler = val;
      this.search(1);
    },
    action(row, value) {
      if (value == 'del') {
        this.delTactics(row);
      } else if (value == 'copy') {
        this.copyTactics(row);
      } else if (value == 'export') {
        this.exportTactics(row.id);
      }
    },
    addTactics() {
      this.isCopy = false;
      this.tacticsForm[0].value = null;
      this.id = null;
      this.tacticsDialog = true;
    },
    importTactics() {
      this.$refs.uploadDialog.showDialog();
    },
    toEdit(item) {
      this.$router.push({
        path: '/notifytactics-edit',
        query: {
          id: item.id
        }
      });
    },
    copyTactics(item) {
      this.isCopy = true;
      this.tacticsForm[0].value = item.name + '_copy';
      this.id = item.id;
      this.tacticsDialog = true;
    },
    exportTactics(id) {
      let data = {};
      let url = '/api/binary/notify/policy/export?id=' + id;
      this.$utils.download(this, url, data, 'get');
    },
    delTactics(obj) {
      if (obj.referenceCount > 0) {
        return;
      }
      this.$createDialog({
        title: '警告',
        content: '确定删除该策略：' + obj.name + '?',
        btnType: 'error',
        'on-ok': vnode => {
          let data = {
            id: obj.id
          };
          this.$api.framework.tactics.delNotify(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success('刪除成功');
              vnode.isShow = false;
              this.search(1);
            }
          });
        }
      });
    },
    okAddTactics() {
      let addTacticsForm = this.$refs.addTacticsForm;
      if (addTacticsForm.valid()) {
        let name = addTacticsForm.getFormValue().name;
        if (this.isCopy) {
          let data = {
            name: name,
            id: this.id,
            handler: this.handler
          };
          this.$api.framework.tactics.copyNotify(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success('复制成功');
              this.tacticsDialog = false;
              this.search(1);
            }
          });
        } else {
          let data = {
            name: name,
            handler: this.handler
          };
          this.$api.framework.tactics.saveNotify(data).then(res => {
            if (res.Status == 'OK') {
              let obj = res.Return;
              let path = '/notifytactics-edit';
              this.$router.push({
                path: path,
                query: {
                  id: obj.id
                }
              });
            }
          });
        }
      }
    },
    getContent(config) {
      let text = '';
      if (config) {
        let time = this.$utils.getDateByFormat(config.actionTime);
        text = config.actionUser + '于' + time + config.actionName;
      }
      return text;
    },
    changeTab(val) {
      let handlerConfig = null;
      this.handlerList.forEach(item => {
        if (item.value == val) { handlerConfig = item; }
      });
      if (val == 'framework') {
        this.frameworkShow = false;
      } else {
        this.frameworkShow = true;
      }
      this.handlerConfig = handlerConfig;
      if (handlerConfig && handlerConfig.children && handlerConfig.children.length > 0) {
        this.handler = this.handlerConfig.children[0].value;
        this.search(1);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.notifytactics-overview {
  padding-top: 16px;
  .tscontain-container {
    .tscontain-header {
      border: none;
    }
  }
  /deep/.notify-card {
    .search-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .search-right {
       width: 300px;
      }
    }
    .notifytactics-card {
      .overvivew-main {
          cursor: pointer;
          .top-typename {
            font-size: 13px;
          }
        }
      .action-item {
        width: 100%;
      }
      .des-content {
        display: flex;
        align-items: center;
      }
    }
  }
  .order-tabs-title {
    width: 100%;
    height: 56px;
    line-height: 54px;
    border-bottom: 1px solid;
    li {
      display: inline-block;
      text-align: center;
      padding: 0 16px;
      cursor: pointer;
      &.active {
        border-bottom: 2px solid;
        .title-box {
          display: inline-block;
        }
      }
    }
  }
  .notifytactics-card {
    position: relative;
  }
  /deep/.ivu-tabs-bar {
    margin-bottom: 0px !important;
  }
}
</style>
