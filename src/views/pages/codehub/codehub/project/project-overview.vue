<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <TsContain class="bg-block">
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editProject()">{{ $t('page.mapping') }}</span>
          <span v-if="selectList && selectList.length>0" class="action-item tsfont-trash-o" @click="deleteProject()">{{ $t('page.delete') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher
          v-model="searchVal"
          v-bind="searchConfig"
          @change="() => changeCurrent(1)"
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
            <div>{{ $utils.getAbbrNameAndName(row.appSystemVo) }}</div>
          </template>
          <template slot="name" slot-scope="{row}">
            <div>{{ $utils.getAbbrNameAndName(row) }}</div>
          </template>
          <template slot="projectList" slot-scope="{row}">
            <template v-if="row.projectList.length>0">
              <template v-for="(item, pIndex) in row.projectList">
                <Tag :key="pIndex">
                  <span class="text-primary pr-xs">{{ item.source }}</span>
                  {{ item.projectName }}
                </Tag>
              </template>
            </template>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div v-if="row.canEdit" class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit" @click="editProject(row)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o" @click="deleteProject(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <ProjectEditDialog
      v-if="isShowProjectEdit"
      :projectData="projectData"
      @close="close"
    ></ProjectEditDialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    ProjectEditDialog: resolve => require(['./project-edit-dialog'], resolve)
  },
  filters: {},
  props: [''],
  data() {
    return {
      loadingShow: true,
      tableData: {
        multiple: true,
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
        currentPage: 1,
        pageSize: 20
      },
      isShowProjectEdit: false,
      projectData: {},
      selectList: [],
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
              this.updateAppModule(val);
            }
          },
          {
            name: 'appModuleId',
            type: 'select',
            label: this.$t('page.module'),
            transfer: true,
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getProjectList();
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
    close(needRefresh) {
      this.isShowProjectEdit = false;
      this.projectData = {};
      if (needRefresh) {
        this.changeCurrent(1);
      }
    },
    changePageSize(pageSize) {
      this.tableData.currentPage = 1;
      this.tableData.pageSize = pageSize;
      this.getProjectList();
    },
    changeCurrent(currentPage) {
      this.tableData.currentPage = currentPage;
      this.getProjectList();
    },
    updateAppModule(val) {
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
    getProjectList() {
      let param = {
        pageSize: this.tableData.pageSize,
        currentPage: this.tableData.currentPage,
        ...this.searchVal
      };
      this.loadingShow = true;
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
      }).finally(() => {
        this.loadingShow = false;
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
              this.changeCurrent(1);
              this.selectList = []; // 删除成功，隐藏批量删除图标
              vnode.isShow = false;
            }
          });
        }
      });
    },
    editProject(row) {
      this.isShowProjectEdit = true;
      if (row) {
        this.projectData = row;
      } else {
        this.projectData = {};
      }
    },
    getSelected(li, list) {
      this.selectList = list;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
