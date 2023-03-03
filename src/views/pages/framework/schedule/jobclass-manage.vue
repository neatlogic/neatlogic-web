<!--定时作业组件管理-->
<template>
  <div class="jobClassList">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topCenter">
        <TsFormSelect v-bind="moduleIdSelectSetting"></TsFormSelect>
      </template>
      <template slot="topRight">
        <TsFormInput
          v-model="searchParam.keyword"
          search
          placeholder="关键字"
          clearable
          width="100%"
          @on-enter="getTableDataSearch(1)"
          @on-clear="getTableDataSearch(1)"
        ></TsFormInput>
      </template>
      <div slot="content" ref="maintable" class="content">
        <TsTable
          v-if="tabledata"
          v-bind="tabledata"
          @changeCurrent="getPagedata"
          @changePageSize="changePageSize"
        ></TsTable>
      </div>
    </TsContain>
  </div>
</template>

<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsTable from '@/resources/components/TsTable/TsTable.vue';
export default {
  name: '',
  components: {
    TsFormSelect,
    TsTable,
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  data() {
    let _this = this;
    return {
      loadingShow: true,
      pageSize: 20,
      theadList: [
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '类路径',
          key: 'className'
        },
        {
          title: '所属模块',
          key: 'moduleName'
        }
      ],
      tabledata: null,
      moduleIdSelectSetting: {
        width: '100%',
        name: 'moduleId',
        url: '/api/rest/module/list',
        placeholder: '请选择所属模块',
        onChange: function(value) {
          _this.searchParam.moduleId = value;
          _this.getTableDataSearch(1);
        }
      },
      searchParam: {
        currentPage: 1,
        pageSize: this.pageSize,
        keyword: null,
        moduleId: null
      }
    };
  },
  beforeMount() {},
  created() {},
  mounted() {
    let _this = this;
    this.getTableDataSearch(1);
    this.settableheight();
    window.addEventListener('resize', this.settableheight);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.settableheight);
  },
  methods: {
    getTableDataSearch: function(currentPage, pageSize) {
      let _this = this;
      if (currentPage) {
        _this.searchParam.currentPage = currentPage;
      }
      if (pageSize) {
        _this.searchParam.pageSize = pageSize;
      } else {
        _this.searchParam.pageSize = this.pageSize;
      }
      this.$api.framework.schedule.classSearch(_this.searchParam).then(res => {
        if (res.Status == 'OK') {
          _this.loadingShow = false;
          _this.tabledata = res.Return;
          _this.tabledata.theadList = _this.theadList;
        }
      });
    },
    //改变页数
    changePageSize(size) {
      this.pageSize = size;
      this.getTableDataSearch();
    },
    getPagedata: function(currentPage) {
      this.getTableDataSearch(currentPage);
    },
    settableheight() {
      let tableheight = window.innerHeight - this.$refs.maintable.getBoundingClientRect().top - 80;
      this.tableheight = tableheight;
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less">
.jobClassList {
  tr {
    cursor: default;
  }
}
</style>
