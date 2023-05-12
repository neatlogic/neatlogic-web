<template>
  <div class="select-user">
    <TsRow class="pb-md">
      <Col :span="14"></Col>
      <Col :span="10"> 
        <TsFormInput
          v-model="keyword"
          suffix="tsfont-search"
          :placeholder="$t('page.keyword')"
          clearable
          @on-enter="userGetPagedata()"
          @on-clear="clearGetPageData"
        ></TsFormInput>
      </Col>
    </TsRow>
    <user-list
      ref="userList"
      :keyword="keyword"
      @getSelect="getUserList"
    ></user-list>
  </div>
</template>

<script>
export default {
  name: 'SelectUser',
  components: {
    userList: resolve => require(['./select-user/user-list'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: [],
  data() {
    const _this = this;
    return {
      tabsName: 'list',
      keyword: ''
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
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
</style>
