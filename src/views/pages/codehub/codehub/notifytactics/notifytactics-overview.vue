<template>
  <div class="notifytactics-overview">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <div slot="top">
        <div class="bar-top">
          <ul class="order-tabs-title dividing-color">
            <li
              v-for="p in handlerList"
              :key="p.value"
              :class="p.value == handlerConfig.value ? 'active' : ''"
              @click="changeHandler(p)"
            >
              <div class="title-box">
                {{ p.text }}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div slot="content">
        <div class="notify-card">
          <div class="search-box">
            <div class="add-tactics">
              <span class="ts-plus text-action" @click="addTactics">{{ $t('term.process.policy') }}</span>
            </div>
            <div class="search-right input-border">
              <Input
                v-model="keyword"
                class="search"
                :placeholder="$t('page.keyword')"
                prefix="i-icon ts-search"
                clearable
                style="width: 300px"
                @on-enter="search(1)"
                @on-clear="search"
              ></Input>
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
              @updatePage="search"
            >
              <template slot-scope="{ row }">
                <div class="overvivew-main" @click="toEdit(row)">
                  <div class="title">
                    <div class="overflow">
                      {{ row.name }}
                    </div>
                    <div class="text-grey top-typename overflow" :title="getContent(row)">
                      {{ row.actionUser }} {{ $t('page.in') }} {{ row.actionTime | formatDate }}
                      {{ row.actionName }}
                    </div>
                  </div>
                </div>
              </template>
              <template v-slot:footer="{row}">
                <div class="action-group">
                  <TsRow :gutter="0">
                    <Col :xs="12" align="center">
                      <div class="action-item" @click="copyTactics(row)">
                        <div class="text-action">{{ $t('page.copy') }}</div>
                      </div>
                    </Col>
                    <Col :xs="12" align="center">
                      <div v-if="row.invokerCount > 0" class="action-item disable last">
                        {{ $t('page.delete') }}
                      </div>
                      <div v-else-if="row.invokerCount == 0" class="action-item last" @click="delTactics(row)">
                        {{ $t('page.delete') }}
                      </div>
                    </Col>
                  </TsRow>
                </div>
              </template>
            </TsCard>
          </div>
        </div>
      </div>
    </TsContain>
    <TsDialog
      type="modal"
      :isShow.sync="tacticsDialog"
      :maskClose="false"
      :hasFooter="true"
    >
      <template v-slot:header>
        <div>{{ isCopy ? $t('dialog.title.copytarget',{'target':$t('term.process.policy')}) : $t('dialog.title.addtarget',{'target':$t('term.process.policy')}) }}</div>
      </template>
      <TsForm ref="addTacticsForm" :itemList="tacticsForm" type="type"></TsForm>
      <template v-slot:footer>
        <Button type="text" @click="tacticsDialog = false">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="okAddTactics">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: 'NotifytacticsOverview',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {},
  data() {
    return {
      handler: null,
      handlerList: [],
      handlerConfig: null, //模块
      id: null,
      loadingShow: false,
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
          label: this.$t('page.name'),
          validateList: ['required', 'name-special']
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
      if (handlerList && handlerList.length > 0) {
        _this.search(1);
      }
    },
    getHandler() {
      return new Promise((resolve, reject) => {
        let _this = this;
        this.$api.codehub.tactics.getHandlerNotify().then(res => {
          if (res.Status == 'OK') {
            let handlerList = res.Return;
            if (_this.handler) {
              let newObj = handlerList.find(d => d.value == _this.handler);
              _this.handlerConfig = newObj;
            } else {
              _this.handlerConfig = handlerList[0];
            }

            _this.handlerList = handlerList;
            resolve(handlerList);
          }
        });
      });
    },
    search(page) {
      let _this = this;
      _this.loadingCard = true;
      _this.currentPage = parseInt(page) || _this.currentPage;
      let data = {
        handler: _this.handlerConfig.value,
        currentPage: _this.currentPage,
        pageSize: _this.pageSize
      };
      if (this.keyword) {
        let keyword = _this.keyword.trim();
        _this.$set(data, 'keyword', keyword);
      }
      this.$api.codehub.tactics.searchNotifyList(data).then(res => {
        if (res.Status == 'OK') {
          let notifyData = res.Return;
          Object.keys(notifyData).forEach(item => {
            if (item != 'tbodyList') {
              _this.$set(_this.tacticsData, item, notifyData[item]);
            } else {
              _this.$set(_this.tacticsData, 'cardList', notifyData[item]);
            }
          });
          _this.currentPage = res.Return.currentPage;
          _this.pageSize = res.Return.pageSize;
          _this.loadingShow = false;
          _this.loadingCard = false;
        }
      });
    },
    changeHandler(obj) {
      if (obj.value != this.handlerConfig.value) {
        this.handlerConfig = obj;
        this.keyword = null;
        this.search(1);
      }
    },
    addTactics() {
      this.isCopy = false;
      this.tacticsForm[0].value = null;
      this.id = null;
      this.tacticsDialog = true;
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
    delTactics(obj) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: $t('dialog.content.deleteconfirm', {target: obj.name}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = {
            id: obj.id
          };
          this.$api.codehub.tactics.delNotify(data).then(res => {
            if (res.Status == 'OK') {
              this.$Notice.success({
                title: this.$t('message.deletesuccess'),
                duration: 1.5
              });
              vnode.isShow = false;
              this.search();
            }
          });
        }
      });
    },
    okAddTactics() {
      let addTacticsForm = this.$refs.addTacticsForm;
      if (addTacticsForm.valid()) {
        let name = addTacticsForm.getFormValue().name;
        let handler = this.handlerConfig.value;
        if (this.isCopy) {
          let data = {
            name: name,
            id: this.id,
            handler: handler
          };
          this.$api.codehub.tactics.copyNotify(data).then(res => {
            if (res.Status == 'OK') {
              this.$Notice.success({
                title: this.$t('message.copysuccess'),
                duration: 1.5
              });
              this.tacticsDialog = false;
              this.search();
            }
          });
        } else {
          let data = {
            name: name,
            handler: handler
          };
          this.$api.codehub.tactics.saveNotify(data).then(res => {
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
        text = config.actionUser + this.$t('page.in') + time + config.actionName;
      }
      return text;
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
  .tscontain-container {
    .tscontain-header {
      border: none;
    }
  }
  /deep/.notify-card {
    .search-box {
      height: 48px;
      padding: 0 16px;
      position: relative;
      .add-tactics {
        height: 100%;
        padding-top: 22px;
      }
      .search-right {
        position: absolute;
        right: 16px;
        top: 16px;
      }
    }
    .notifytactics-card {
      .overvivew-main {
          cursor: pointer;
          line-height: 24px;
          padding: 4px 8px;
          .top-typename {
            font-size: 13px;
          }
        }
      .action-item {
        width: 100%;
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
        cursor: default;
        .title-box {
          display: inline-block;
        }
      }
    }
  }
  .notifytactics-card {
    position: relative;
  }
}
</style>
