<template>
  <div>
    <TsContain class="bg-block">
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editProject()">{{ $t('page.mapping') }}</span>
          <span v-if="selectList && selectList.length>0" class="action-item tsfont-delete" @click="deleteProject()">{{ $t('page.delete') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher
          v-model="searchVal"
          v-bind="searchConfig"
          @change="getList(1)"
        ></CombineSearcher>
      </template>
      <div slot="content">
        <TsTable
          v-bind="tableData"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
          @getSelected="getSelected"
        >
          <template slot="appSystemVo" slot-scope="{row}">
            <Tooltip
              v-if="row.appSystemVo.abbrName"
              theme="light"
              max-width="300"
              transfer
            >
              <div>{{ row.appSystemVo.abbrName }}</div>
              <div slot="content">
                <div>{{ row.appSystemVo.name }}</div>
              </div>
            </Tooltip>
            <div v-else>{{ row.appSystemVo.abbrName }}</div>
          </template>
          <template slot="name" slot-scope="{row}">
            <Tooltip
              v-if="row.name"
              theme="light"
              max-width="300"
              transfer
            >
              <div>{{ row.abbrName }}</div>
              <div slot="content">
                <div>{{ row.name }}</div>
              </div>
            </Tooltip>
            <div v-else>{{ row.abbrName }}</div>
          </template>
          <template slot="projectList" slot-scope="{row}">
            <template v-if="row.projectList.length>0">
              <template v-for="(por,pindex) in row.projectList">
                <div :key="pindex" class="projectList"><Tag>{{ por.source }}</Tag><Tag :key="pindex">{{ por.projectName }}</Tag></div>
              </template>
            </template>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div v-if="row.canEdit" class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="ts-edit" @click="editProject(row)">{{ $t('page.edit') }}</li>
                <li class="ts-trash" @click="deleteProject(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <ProjectEdit
      v-if="isEdit"
      :projectList="projectList"
      :projectData="projectData"
      :rowModuleId="appModuleId"
      :rowSystemId="appSystemId"
      @close="close"
    ></ProjectEdit>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    ProjectEdit: resolve => require(['./edit/project-edit'], resolve)
  },
  filters: {},
  props: [''],
  data() {
    return {
      appSystemId: null,
      appModuleId: null,
      tableData: {
        multiple: true,
        hideAction: false,
        theadList: [{
          key: 'selection'
        }, {
          title: this.$t('page.system'),
          key: 'appSystemVo'
        }, {
          title: this.$t('page.module'),
          key: 'name'
        }, {
          title: this.$t('term.rdm.project'),
          key: 'projectList'
        }, {
          key: 'action'
        }],
        tbodyList: [],
        currentPage: 1
      },
      isEdit: false,
      projectData: {},
      selectList: [],
      projectList: [],
      searchVal: {},
      searchConfig: {
        search: true,
        searchList: [
          {
            name: 'appSystemId',
            type: 'select',
            label: this.$t('page.system'),
            transfer: true,
            dynamicUrl: 'api/rest/deploy/app/config/appsystem/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            onChange: (val) => {
              this.appSystemId = val;
              this.updateAppModule(val);
              this.getSearch();
            }
          },
          {
            name: 'appModuleId',
            type: 'select',
            label: this.$t('page.module'),
            transfer: true,
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            onChange: (val) => {
              this.appModuleId = val;
              this.getSearch();
            }
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getList();
    this.getProjectdetail();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(isReload) {
      this.isEdit = false;
      this.projectData = {};
      if (isReload) {
        this.getSearch();
      }
    },
    changePageSize(size) {
      this.tableData.pageSize = size;
      this.getList();
    },
    changeCurrent(page) {
      this.tableData.currentPage = page;
      this.getList();
    },
    getSearch() {
      this.tableData.currentPage = 1;
      this.getList();
    },
    updateAppModule(val) {
      this.appModuleId = '';
      if (val) {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'appModuleId')) {
            this.$set(item, 'params', {appSystemId: val});
            this.$set(item, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
          } 
        });
      } else {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'appModuleId')) {
            this.$set(item, 'params', {});
            this.$set(item, 'dynamicUrl', '');
          } 
        });
      }
    },
    getList() {
      let param = {
        ...this.searchVal
      };
      this.tableData.pageSize && Object.assign(param, {pageSize: this.tableData.pageSize});
      this.tableData.currentPage && Object.assign(param, {currentPage: this.tableData.currentPage});
      if (this.appModuleId) {
        Object.assign(param, {id: this.appModuleId});
      }
      if (this.appSystemId) {
        Object.assign(param, {appSystemId: this.appSystemId});
      }
      this.$api.codehub.project.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this.tableData, 'pageCount', res.Return.pageCount);
          this.$set(this.tableData, 'rowNum', res.Return.rowNum);
          this.$set(this.tableData, 'pageSize', res.Return.pageSize);
          this.$set(this.tableData, 'currentPage', res.Return.currentPage);
          this.$set(this.tableData, 'tbodyList', res.Return.tbodyList);
        } else {
          this.$set(this.tableData, 'tbodyList', []);
        }
      });
    },
    deleteProject(row) {
      let param = {
        systemArray: []
      };
      if (row) { //删除单个从列里获取单个模块
        Object.assign(param.systemArray, [{
          appSystemId: row.appSystemVo.id || 0,
          appModuleId: row.id || 0
        }]);
      } else { //删除批量从全局选中获取
        if (this.selectList.length > 0) {
          let array = [];
          this.selectList.forEach((se) => {
            array.push({'appModuleId': se.id || 0, 'appSystemId': se.appSystemVo.id});
          });
          Object.assign(param.systemArray, array);
        }
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.mapping')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.project.delete(param).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getSearch();
              vnode.isShow = false;
            } else {
              this.$Message.error(res.Message);
            }
          });
        }
      });
    },
    editProject(row) {
      this.isEdit = true;
      if (row) {
        this.projectData = row;
      } else {
        this.projectData = {};
      }
    },
    getSelected(li, list) {
      this.selectList = list;
    },
    getProjectdetail() {
      this.$api.codehub.project.getProject().then(res => {
        this.projectList = res.Return;
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.text-label {
  line-height: 54px;
}
.projectList{
  display: inline-block;
  &:not(:last-child){
    margin-right: 4px;
  }
  .ivu-tag:first-child{
    margin-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    background: @default-op;
    /deep/ .ivu-tag-text{
      color: @default-primary-color;
    }
  }
  .ivu-tag:last-child{
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    margin-left: -1px;
  }
}
</style>
