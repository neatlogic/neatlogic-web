<template>
  <div class="select-user">
    <div class="content">
      <Tabs v-model="tabsName">
        <TabPane :label="$t('term.framework.importfromuserlist')" name="list">
          <user-list
            v-show="tabsName === 'list'"
            ref="userList"
            :keyword="keyword"
            @getSelect="getUserList"
          ></user-list>
        </TabPane>
        <TabPane :label="$t('term.framework.importfromusergroup')" name="group">
          <team-list v-show="tabsName === 'group'" ref="teamList" @getSelect="getTeamUserList"></team-list>
        </TabPane>
      </Tabs>
      <div class="search input-border">
        <template v-if="tabsName === 'list'">
          <TsFormInput
            v-model="keyword"
            search
            :placeholder="$t('page.keyword')"
            clearable
            @on-enter="userGetPagedata()"
            @on-clear="clearGetPageData"
          ></TsFormInput>
        </template>
        <template v-else-if="tabsName === 'group'">
          <TsFormSelect ref="teamSelect" v-bind="selectTreeSetting" @enter-search="searchkeyWord"></TsFormSelect>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
export default {
  name: 'SelectUser',
  components: {
    userList: () => import('./select-user/user-list'),
    teamList: () => import('./select-user/team-list'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect
  },
  props: [],
  data() {
    const _this = this;
    return {
      tabsName: 'list',
      keyword: '',
      selectTreeSetting: {
        name: 'uuid',
        value: '',
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.userteam')}),
        search: true,
        multiple: false,
        width: '100%',
        dynamicUrl: '/api/rest/team/search',
        rootName: 'teamList',
        dataList: [],
        textName: 'name',
        valueName: 'uuid',
        transfer: true,
        onChange: function(value) {
          if (value) {
            _this.$refs.teamList.showTreeList('uuid', value);
          } else {
            _this.$refs.teamList.getTeamList();
          }
        }
      }
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {},

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    searchkeyWord(value) {
      if (value) {
        this.$refs.teamList.showTreeList('keyword', value);
      } else {
        this.$refs.teamList.getTeamList();
      }
    },
    userGetPagedata() {
      this.$refs.userList.getPagedata();
    },
    clearGetPageData() {
      setTimeout(() => {
        this.$refs.userList.getPagedata();
      }, 20);
    },
    getUserList(list) {
      const userList = list.map(item => {
        return {
          text: item.userName,
          value: item.userId,
          uuid: item.uuid
        };
      });
      this.$emit('getUserNum', {
        'userUuidList': userList
      });
    },
    getTeamUserList(list) {
      let userNum = 0;
      for (let i = 0; i < list.length; i += 1) {
        userNum += list[i].userCount;
      }
      let teamUuidList = [];
      list.forEach(item => {
        teamUuidList.push(item.uuid);
      });
      this.$emit('getUserNum', {
        'teamUuidList': teamUuidList
      });
    }
  },

  filter: {},

  computed: {},

  watch: {
    tabsName(newVal) {
      this.$nextTick(() => {
        if (newVal === 'list') {
          this.keyword = '';
          setTimeout(() => {
            this.$refs.userList.getPagedata();
          }, 20);
        } else if (newVal === 'group' && !this.$refs.teamSelect.value) {
          this.$refs.teamList.getTeamList();
        }
      });
    }
  }
};
</script>
<style lang='less' scoped>
@import '~@/resources/assets/css/framework/manage.less';
.select-user {
  position: relative;
  .search {
    position: absolute;
    right: 0;
    top: 0;
  }
}

/deep/.ivu-tabs-bar{
  border-bottom: 0px solid #DBDBDB;
}
</style>
