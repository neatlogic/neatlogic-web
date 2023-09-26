<template>
  <div class="auth-setting">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topRight">
        <TsRow class="search-item">
          <Col span="6"><TsFormSelect
            :dataList="authGroupList"
            :value="selectedModuleName"
            :clearable="false"
            border="border"
            @on-change="changeSelect"
          ></TsFormSelect> </Col>
          <Col span="18">
            <InputSearcher
              v-model="keyword"
              :placeholder="$t('page.keyword')"
              @change="search()"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content" class="content">
        <div class="card-wrapper">
          <div v-if="authList && authList.length > 0">
            <div class="card-top text-grey">
              <TsRow>
                <Col span="6">
                  {{ $t('term.framework.authname') }}
                </Col>
                <Col span="2">
                  {{ $t('term.framework.belongmodule') }}
                </Col>
                <Col span="10">
                  {{ $t('term.framework.authdesc') }}
                </Col>
                <Col span="2">
                  {{ $t('term.framework.usercount') }}
                </Col>
                <Col span="2">
                  {{ $t('term.framework.rolecount') }}
                </Col>
                <Col span="2">
                  {{ $t('page.action') }}
                </Col>
              </TsRow>
            </div>
            <div v-for="(item, index) in authList" :key="index" class="card-item bg-op radius-lg card-hover-shadow">
              <TsRow>
                <Col span="6">
                  <Poptip
                    trigger="hover"
                    :content="item.displayName"
                    class="des-tip"
                    transfer
                  >
                    <div>
                      <div class="overflow">{{ item.displayName }}</div>
                    </div>
                  </Poptip>
                </Col>
                <Col span="2">
                  <Poptip
                    trigger="hover"
                    :content="item.authGroupName"
                    class="des-tip"
                    transfer
                  >
                    <div>
                      <div class="overflow">{{ item.authGroupName }}</div>
                    </div>
                  </Poptip>
                </Col>
                <Col span="10">
                  <Poptip
                    trigger="hover"
                    :content="item.description"
                    class="des-tip"
                    transfer
                  >
                    <div>
                      <div class="overflow">{{ item.description }}</div>
                    </div>
                  </Poptip>
                </Col>
                <Col span="2">
                  <li class="tsfont-userinfo count text-left" :title="$t('term.framework.usercount')">
                    <span>{{ item.userCount }}</span>
                  </li>
                </Col>
                <Col span="2">
                  <li class="tsfont-team count text-left" :title="$t('term.framework.rolecount')">
                    <span>{{ item.roleCount }}</span>
                  </li>
                </Col>
                <Col span="2" class="action">
                  <ul class="tstable-action-ul">
                    <li class="tsfont-permission text-action" @click="adduser(item.name)">{{ $t('page.auth') }}</li>
                  </ul>
                </Col>
              </TsRow>
            </div>
          </div>
          <div v-else>
            <NoData v-show="!loadingShow"></NoData>
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>

<script>
export default {
  name: 'AuthManage',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      keyword: null,
      authList: [], //权限列表
      authGroupList: [], //权限组列表
      selectedModuleName: '',
      loadingShow: true
    };
  },

  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getAuthGrouplist();
  },
  beforeUpdate() {},
  updated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    //获取权限组列表
    getAuthGrouplist() {
      let data = {};
      this.$api.common.getAuthGroup(data).then(res => {
        if (res.Status == 'OK') {
          this.authGroupList = res.Return.groupList;
          this.selectedModuleName = this.selectedModuleName || (this.authGroupList[0] ? this.authGroupList[0].value : null); // 下榻页面返回，选中对应模块
          this.getAuthList();
        }
      });
    },
    //获取权限列表
    getAuthList() {
      let data = {
        groupName: this.selectedModuleName,
        keyword: this.keyword
      };
      this.loadingShow = true;
      this.$addHistoryData('keyword', this.keyword);
      this.$addHistoryData('selectedModuleName', this.selectedModuleName);
      this.$api.framework.auth.getAuthList(data).then(res => {
        this.authList = res.Return;
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    restoreHistory(historyData) {
      this.keyword = historyData['keyword'];
      this.selectedModuleName = historyData['selectedModuleName'];
    },
    //搜索
    search() {
      this.getAuthList();
    },
    //切换权限组
    changeSelect(val) {
      this.selectedModuleName = val;
      this.getAuthList();
    },
    adduser: function(val) {
      this.$router.push({
        path: `auth-adduser`,
        query: { name: val, groupName: this.selectedModuleName }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
@import '~@/resources/assets/css/framework/manage.less';
.auth-setting {
  .top {
    .bar-top {
      .select {
        width: 200px;
      }
      .search {
        width: 400px;
      }
    }
  }
  .content {
    .card-wrapper {
      .card-top {
        padding: 0 20px 8px 20px;
        .action {
          text-align: center;
        }
      }
      .card-item {
        height: 56px;
        line-height: 56px;
        padding: 0 20px;
        margin-bottom: 8px;
        // &:hover {
        //   .action {
        //     display: block;
        //   }
        // }
        // .action {
        //   display: none;
        //   cursor: pointer;
        // }
        .count {
          > span {
            margin-left: 5px;
          }
        }
        .tstable-action-ul {
          li {
            display: inline-block;
            padding: 0 @space-xs;
            &:not(:last-of-type) {
              position: relative;
              &::after {
                content: '|';
                width: 1px;
                height: 14px;
                color: @dividing-color;
                right: 0px;
                position: absolute;
              }
            }
            &::before {
              margin-right: 4px;
            }
            // &:first-of-type {
            //   padding-right: @space-xs;
            // }
            // &:hover {
            //   color: @primary-color;
            // }
          }
        }
      }
    }
  }
}
</style>
<style lang="less" scoped>
/deep/.des-tip {
  max-width: 100%;
  .ivu-poptip-rel {
    width: 100%;
  }
}
</style>
