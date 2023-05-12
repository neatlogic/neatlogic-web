<template>
  <div class="team-manage">
    <div slot="content" class="dividing-color">
      <div class="card-wrapper pl-lg">
        <div v-if="children.tbodyList && children.tbodyList.length > 0">
          <div class="card-top text-grey">
            <span class="name">{{ $t('term.framework.groupname') }}</span>
            <span class="num">{{ $t('term.framework.usercount') }}</span>
          </div>
          <!-- start搜索时 -->
          <template v-if="search">
            <TeamTreeView :search="true" :children="searchList" @getSelect="getSelect"></TeamTreeView>
          </template>
          <!-- end搜索时 -->
          <template v-else>
            <TeamTreeView :search="false" :children="children.tbodyList" @getSelect="getSelect"></TeamTreeView>
          </template>
        </div>
        <div v-else>
          <no-data></no-data>
        </div>
        <div v-if="!search && children.tbodyList && children.tbodyList.length > 0" class="page">
          <Page
            :total="children.rowNum"
            :page-size="children.pageSize"
            size="small"
            transfer
            show-total
            show-sizer
            @on-change="getPagedata"
            @on-page-size-change="changePageSize"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TeamTreeView from './team-treeview.vue';
export default {
  name: 'TeamList',
  components: {
    TeamTreeView
  },
  props: [],
  data() {
    return {
      children: [],
      pageSize: 10,
      search: false,
      searchList: [],
      selectList: []
    };
  },
  // 父组件中返回要传给下级的方法
  provide() {
    return {
      setIsCheck: this.setIsCheck
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    this.getTeamList();
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    getTeamList(param) {
      this.search = false;
      let data = param || {
        pageSize: this.pageSize,
        isActive: 1
      };
      this.$api.framework.team.getTeamTreeList(data).then(res => {
        if (res.Status == 'OK') {
          this.children = res.Return;
          this.children.tbodyList.forEach(t => {
            if (!t.children) {
              t.children = [];
            }
            // this.selectList = [];
          });
          if (this.selectList.length > 0) {
            this.setIsCheck(this.children.tbodyList);
          }
        }
      });
    },
    //遍历当前树节点，找到selectList中的节点并且勾选
    setIsCheck(list) {
      const _this = this;
      //比对传进来的list与已选中的selectList
      list.forEach(item => {
        if (_this.selectList.find(d => d.uuid === item.uuid)) {
          _this.$set(item, 'isCheck', true);
        }
        if (item.children && item.children.length > 0) {
          _this.setIsCheck(item.children);
        }
      });
    },
    getPagedata(current) {
      //翻页，current是插件内部分页第几页，之后把注释掉的方法放出来做翻页交互
      if (current) {
        this.children.currentPage = current;
      }
      let param = {
        keyword: this.keyword,
        pageSize: this.pageSize,
        currentPage: this.children.currentPage ? this.children.currentPage : 1
      };
      this.getTeamList(param);
    },
    //改变页数
    changePageSize(size) {
      this.pageSize = size;
      let param = {
        keyword: this.keyword,
        pageSize: this.pageSize,
        currentPage: this.children.currentPage ? this.children.currentPage : 1
      };
      this.getTeamList(param);
    },
    showTreeList(name, value) {
      let params = {};
      params[name] = value;
      this.search = true;
      this.$api.framework.team.searchShowTree(params).then(res => {
        if (res.Status == 'OK') {
          this.searchList = res.Return.children;
          this.setIsCheck(this.searchList);
        }
      });
    },
    getSelect(item) {
      if (item.isCheck && !this.selectList.find(d => d.uuid === item.uuid)) {
        this.selectList.push(item);
      } else {
        this.selectList.splice(this.selectList.findIndex(a => a.uuid === item.uuid), 1);
      }
      this.$emit('getSelect', this.selectList);
    }
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/framework/manage.less';
.team-manage {
  .page {
    text-align: right;
  }
  .btn-list {
    &.title {
      padding-left: @space-md;
    }
  }
  .dividing-color {
    .card-wrapper {
      .card-top {
        position: relative;
        .name {
          padding-right: 200px;
        }
        .num {
          position: absolute;
          right: 180px;
        }
      }
    }
  }
}
</style>
