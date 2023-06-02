<template>
  <div>
    <TsContain class="bg-block">
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editProject()">映射</span>
          <span v-if="selectList && selectList.length>0" class="action-item tsfont-delete" @click="deleteProject()">删除</span>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher
          v-model="searchVal"
          v-bind="searchConfig"
          @change="getTableList(1)"
        ></CombineSearcher>
      </template>
      <div slot="content">
        <TsTable
          v-bind="tableData"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
          @getSelected="getSelected"
        >
          <template slot="systemVo" slot-scope="{row}">
            <Tooltip
              v-if="row.systemVo.description"
              theme="light"
              max-width="300"
              transfer
            >
              <div>{{ row.systemVo.name }}</div>
              <div slot="content">
                <div>{{ row.systemVo.description }}</div>
              </div>
            </Tooltip>
            <div v-else>{{ row.systemVo.name }}</div>
          </template>
          <template slot="name" slot-scope="{row}">
            <Tooltip
              v-if="row.description"
              theme="light"
              max-width="300"
              transfer
            >
              <div>{{ row.name }}</div>
              <div slot="content">
                <div>{{ row.description }}</div>
              </div>
            </Tooltip>
            <div v-else>{{ row.name }}</div>
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
                <li class="ts-edit" @click="editProject(row)">编辑</li>
                <li class="ts-trash" @click="deleteProject(row)">删除</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <ProjectEdit
      v-if="isEdit"
      :isShow.sync="isEdit"
      :projectList="projectList"
      :list="editLi"
      :uuid="subsystemUuid"
      :systemUuid="systemUuid"
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
      keyword: '',
      systemUuid: '',
      subsystemUuid: '',
      tableData: {
        hideAction: false,
        theadList: [{
          key: 'selection'
        }, {
          title: '系统',
          key: 'systemVo'
        }, {
          title: '子系统',
          key: 'name'
        }, {
          title: '项目',
          key: 'projectList'
        }, {
          key: 'action'
        }],
        tbodyList: [],
        currentPage: 1
      },
      isEdit: false,
      editLi: {},
      selectList: [],
      projectList: [],
      searchVal: {},
      searchConfig: {
        search: true,
        searchList: [
          {
            name: 'systemUuid',
            type: 'select',
            label: '系统',
            transfer: true,
            dynamicUrl: '/api/rest/codehub/appsystem/search',
            rootName: 'list',
            textName: 'name',
            valueName: 'uuid',
            value: this.systemUuid,
            onChange: (val) => {
              this.systemUuid = val;
              this.updateSubSystem(val);
              this.getSearch();
            }
          },
          {
            name: 'subsystemUuid',
            type: 'select',
            label: '子系统',
            transfer: true,
            rootName: 'list',
            textName: 'name',
            valueName: 'uuid',
            value: this.subsystemUuid,
            onChange: (val) => {
              this.subsystemUuid = val;
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
      this.editLi = {};
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
    updateSubSystem(val) {
      this.subsystemUuid = '';
      if (val) {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'subsystemUuid')) {
            this.$set(item, 'params', {systemId: val});
            this.$set(item, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
          } 
        });
      } else {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'subsystemUuid')) {
            this.$set(item, 'params', {});
            this.$set(item, 'dynamicUrl', '');
          } 
        });
      }
    },
    getList() {
      let param = {};
      this.tableData.pageSize && Object.assign(param, {pageSize: this.tableData.pageSize});
      this.tableData.currentPage && Object.assign(param, {currentPage: this.tableData.currentPage});
      if (this.subsystemUuid) {
        Object.assign(param, {subsystemUuid: this.subsystemUuid});
      }
      if (this.systemUuid) {
        Object.assign(param, {systemUuid: this.systemUuid});
      }
      if (this.keyword) {
        Object.assign(param, {keyword: this.keyword});
      }
      this.$api.codehub.project.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this.tableData, 'pageCount', res.Return.pageCount);
          this.$set(this.tableData, 'rowNum', res.Return.rowNum);
          this.$set(this.tableData, 'pageSize', res.Return.pageSize);
          this.$set(this.tableData, 'currentPage', res.Return.currentPage);
          this.$set(this.tableData, 'tbodyList', res.Return.list);
        } else {
          this.$set(this.tableData, 'tbodyList', []);
        }
      });
    },
    deleteProject(row) {
      let param = {
        systemUuid: '',
        subsystemUuid: ''
      };
      if (row) { //删除单个从列里获取单个子系统
        Object.assign(param, {
          systemUuid: row.systemVo.uuid || 0,
          subsystemUuid: row.uuid || 0
        });
      } else { //删除批量从全局选中获取
        if (this.selectList.length > 0) {
          let subsList = this.selectList.map((se) => {
            return se.uuid || 0;
          });
          let sysList = this.selectList.map((se) => {
            return se.systemVo.uuid || 0;
          });
          Object.assign(param, {
            systemUuid: sysList.join(','),
            subsystemUuid: subsList.join(',')
          });
        }
      }
      this.$createDialog({
        title: '删除确认',
        content: '是否确认删除该映射',
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.project.delete(param).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Message.success('删除成功');
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
        this.editLi = row;
      } else {
        this.editLi = {};
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
