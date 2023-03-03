<template>
  <div class="team-manage">
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <div class="dividing-color">
      <div class="card-wrapper">
        <div v-if="tbodyList.length > 0">
          <div class="card-top text-grey">
            <div v-for="(item, index) in theadList" :key="index" class="title-block">{{ item.title }}</div>
            <div class="btn-list title">{{ $t('page.action') }}</div>
          </div>
          <TreeView :search="search" :children="tbodyList"></TreeView>
        </div>
        <div v-if="tbodyList.length == 0">
          <NoData v-show="!isLoading"></NoData>
        </div>
        <div v-if="tbodyList.length > 0" class="page">
          <Page
            :current="currentPage"
            :total="rowNum"
            :page-size="pageSize"
            size="small"
            transfer
            show-total
            show-sizer
            @on-change="changeCurrent"
            @on-page-size-change="changePageSize"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TreeView from './tree-view';
export default {
  name: 'ListNestingTree',
  components: {
    TreeView
  },
  props: {
    theadList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    tbodyList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    currentPage: Number, // 当前页码
    rowNum: Number, // 总条数
    pageSize: Number, // 每页多少条
    isLoading: {
      type: Boolean,
      default: false
    },
    search: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeCurrent(current) {
      // 翻页
      this.$emit('changeCurrent', current);
    },
    changePageSize(size) {
      //改变页数
      this.$emit('changePageSize', size);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>

<style lang="less">
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
}
</style>
