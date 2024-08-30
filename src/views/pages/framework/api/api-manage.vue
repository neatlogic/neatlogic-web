<template>
  <div>
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsContain :isSiderHide="isSiderHide" :enableCollapse="true" border="border">
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-auth="['ADMIN']" class="action-item">
            <AuditConfig auditName="API-AUDIT" :title="$t('term.framework.apiaccesstime')"></AuditConfig>
          </span>
          <span v-if="searchParams.apiType === 'system'" class="action-item tsfont-download" @click="exportHelp()">{{ $t('page.export') }}</span>
          <span v-if="searchParams.apiType === 'custom'" class="create-api action-item" @click="showApiForm({}, 'create')">
            <i class="tsfont-plus">{{ $t('page.customapi') }}</i>
          </span>
        </div>
      </template>
      <template v-slot:topRight>
        <div style="text-align: right" :style="{ '--children': 3 }" class="controller-group">
          <!-- <div><TsformSelect v-model="apiType" v-bind="apiTypeConfig" @on-change="handleApiTypeChange" /></div> -->
          <div><TsformSelect v-model="needAudit" v-bind="auditConfig" @on-change="filterAudit" /></div>
          <div>
            <InputSearcher v-model="searchParams.keyword" @change="handleSearchChange"></InputSearcher>
          </div>
        </div>
      </template>
      <Tree
        slot="sider"
        ref="tree"
        class="menu-tree"
        :data="treeList"
        :load-data="getSubtree"
        @on-select-change="handleTreeSelectChange"
      ></Tree>
      <template slot="content">
        <TsTable
          :theadList="theadList"
          v-bind="tableConfig"
          @changeCurrent="currentPage => getTableConfig({ currentPage })"
          @changePageSize="pageSize => getTableConfig({ pageSize })"
        >
          <template v-slot:isActive="{ row }">
            <span v-if="row.isActive" class="text-success">{{ $t('page.enable') }}</span>
            <span v-else class="text-grey">{{ $t('page.disable') }}</span>
          </template>
          <template v-slot:needAudit="{ row }">
            <i-switch
              :key="row.token"
              v-model="row.needAudit"
              :true-value="1"
              :false-value="0"
              @on-change="handleSwitchChange(row)"
            ></i-switch>
          </template>
          <template v-slot:token="{ row }">
            <span class="text-href" @click.stop="showApiForm(row, 'update')">{{ row.token }}</span>
          </template>
          <template v-slot:authtype="{ row }">
            <div>{{ row.authtype | authtypeText(t) }}</div>
          </template>
          <template v-slot:expire="{ row }">
            <div>{{ row.expire | formatDate }}</div>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-test" @click="testApi(row)">{{ $t('page.test') }}</li>
                <li class="tsfont-question-o" @click="showApiHelp(row)">{{ $t('page.help') }}</li>
                <li v-if="row.needAudit" class="tsfont-putongjigui" @click="showCallRecord(row)">{{ $t('term.process.callrecord') }}</li>
                <!-- <li class="tsfont-edit icon" @click="">{{ $t('page.edit') }}</li> -->
                <li v-if="!row.isPrivate" class="tsfont-copy icon" @click="showApiForm(row, 'copy')">
                  {{ $t('page.copy') }}
                </li>
                <li v-if="row.isDeletable == 1" class="tsfont-trash-o icon" @click="showApiForm(row, 'delete')">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <ApiHelp
      v-if="isApiHelpShow"
      :isShow="isApiHelpShow"
      :rowData="rowData"
      @close="isApiHelpShow = false"
    />
    <CallRecord
      v-if="isCallRecordShow"
      :isShow="isCallRecordShow"
      :rowData="rowData"
      @on-hide="isCallRecordShow = false"
    />
    <FormDialog
      :isShow="isFormDialogShow"
      :rowData="rowData"
      :operationType="operationType"
      :apiType="searchParams.apiType"
      @on-hide="isFormDialogShow = false"
    />
    <ApiTest v-if="isTestShow" :rowData="rowData" @close="isTestShow = false"></ApiTest>
  </div>
</template>

<script>
import download from '@/resources/mixins/download.js';
export default {
  name: 'ApiManage',
  components: {
    TsformSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    ApiHelp: () => import('./api-manage-help'),
    CallRecord: () => import('./api-manage-call-record'),
    FormDialog: () => import('./api-manage-form'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    ApiTest: () => import('./api-manage-test.vue'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue')
  },
  filters: {
    authtypeText(value, t) {
      const config = {
        '-': t('page.nothave'),
        basic: 'Basic',
        token: t('page.token'),
        cookie: 'Cookie',
        'hmac-sha1': 'HMAC-SHA1'
      };
      return value in config ? config[value] : value;
    }
  },
  mixins: [download],
  data() {
    return {
      isLoading: true, //页面加载中
      isApiHelpShow: false, //是否显示帮助抽屉
      isTestShow: false, //是否显示测试
      isCallRecordShow: false, //是否显示接口调用记录
      isFormDialogShow: false, //是否显示对话框
      apiType: 'system',
      // apiTypeConfig: Object.freeze({
      //   //接口类型选择器配置
      //   value: 'system',
      //   clearable: false,
      //   border: 'border',
      //   dataList: [
      //     { value: 'system', text: this.$t('page.systemapi') },
      //     { value: 'custom', text: this.$t('page.customapi') }
      //   ],
      //   validateList: ['required']
      // }),
      auditConfig: {
        placeholder: this.$t('page.isneedaudit'),
        border: 'border',
        dataList: [
          { value: 1, text: this.$t('page.needaudit') },
          { value: 0, text: this.$t('page.notneedaudit') }
        ]
      },
      operationType: '', //对话框操作类型('creatre','update','copy','delete')
      treeList: [
        {
          title: this.$t('page.all'),
          moduleGroup: null,
          funcId: null,
          expand: true,
          selected: true,
          children: []
        }
      ],
      theadList: Object.freeze([
        //表头数据
        { title: this.$t('page.address'), key: 'token', width: 300 },
        { title: this.$t('page.name'), key: 'name', width: 300 },
        { title: this.$t('page.handler'), key: 'handlerName', width: 300 },
        { title: this.$t('page.needaudit'), key: 'needAudit', minWidth: 80 },
        { title: this.$t('page.authtype'), key: 'authtype', minWidth: 80 },
        { title: this.$t('page.status'), key: 'isActive', minWidth: 60 },
        { title: this.$t('page.module'), key: 'moduleGroupName', minWidth: 60 },
        { title: this.$t('page.visittimes'), key: 'visitTimes', minWidth: 60 },
        { title: ' ', key: 'action', align: 'right', width: 10 }
      ]),
      tableConfig: {
        //表格配置
        tbodyList: [],
        pageSize: 20,
        currentPage: 1,
        pageCount: 1,
        rowNum: null
      },
      rowData: {}, //表格行数据
      searchParams: {
        //搜索参数
        apiType: 'system',
        keyword: null,
        moduleGroup: null,
        funcId: null,
        currentPage: 1,
        pageSize: 20
      },
      tableHeight: 'calc(100vh - 192px)',
      needAudit: null
    };
  },
  created() {
    this.getTree();
    this.getTableConfig();
  },
  methods: {
    verticals() {
      this.isSiderHide = !this.isSiderHide;
    },
    // 获取目录树数据
    getTree(menuType = this.searchParams.apiType) {
      const params = { menuType };
      this.$api.framework.apiManage.getTree(params).then(res => {
        if (res.Status === 'OK') {
          const moduleGroupList = res.Return.map(module => {
            const { moduleGroupName: title, moduleGroup, funcList } = module;
            const children = funcList.map(item => {
              // 给每个节点都设置了一个 nodeKey 字段，用来标识节点的 id，必须唯一，否则选中的目录和回显的目录不一致
              return item.isHasChild ? { moduleGroup, title: item.funcId, funcId: item.funcId, loading: false, children: [], nodeKey: this.$utils.setUuid() } : { moduleGroup, title: item.funcId, funcId: item.funcId, nodeKey: this.$utils.setUuid() };
            });
            children.sort(item => {
              if ('children' in item) return -1;
              else return 1;
            });
            return { title, moduleGroup, funcId: null, children };
          });
          this.treeList[0].children = moduleGroupList;
        }
      });
    },
    // 获取目录树的子目录
    getSubtree(treeItem, callback) {
      const { moduleGroup, funcId } = treeItem;
      const params = {
        moduleGroup,
        funcId,
        type: this.searchParams.apiType
      };
      this.$api.framework.apiManage.getSubtree(params).then(res => {
        if (res.Status === 'OK') {
          const children = res.Return.map(item => {
            return item.isHasChild ? { moduleGroup, title: item.funcId, funcId: funcId + '/' + item.funcId, loading: false, children: [], nodeKey: this.$utils.setUuid() } : { moduleGroup, title: item.funcId, funcId: funcId + '/' + item.funcId, nodeKey: this.$utils.setUuid() };
          });
          children.sort(item => {
            if ('children' in item) return -1;
            else return 1;
          });
          callback(children);
        }
      });
    },
    // 处理侧边栏目录选项更改
    handleTreeSelectChange(nodeList, node) {
      const params = {
        moduleGroup: node.selected ? node.moduleGroup : null,
        funcId: node.selected ? node.funcId : null,
        currentPage: 1
      };
      this.getTableConfig(params);
    },
    // 获取表格数据
    getTableConfig(params = {}) {
      this.isLoading = true;
      this.searchParams = { ...this.searchParams, currentPage: 1, ...params };
      this.$api.framework.apiManage
        .search(this.searchParams)
        .then(res => {
          if (res.Status == 'OK') {
            this.tableConfig = res.Return;
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    // 处理接口类型更改
    handleApiTypeChange() {
      this.$refs.tree.getSelectedNodes().forEach(node => {
        node.selected = false;
      }); //取消选中目录树的所有节点
      this.treeList[0].selected = true; //选中目录树“所有”项
      const params = {
        apiType: this.apiType,
        // keyword: null,
        moduleGroup: null,
        funcId: null,
        currentPage: 1,
        needAudit: typeof this.needAudit == 'number' ? this.needAudit : null
      };
      this.getTableConfig(params);
      this.getTree(this.apiType);
    },
    filterAudit() {
      //树图的接口没有审计
      this.$refs.tree.getSelectedNodes().forEach(node => {
        node.selected = false;
      }); //取消选中目录树的所有节点
      this.treeList[0].selected = true; //选中目录树“所有”项
      const params = {
        apiType: this.apiType,
        // keyword: null,
        moduleGroup: null,
        funcId: null,
        currentPage: 1,
        needAudit: typeof this.needAudit == 'number' ? this.needAudit : null
      };
      this.getTableConfig(params);
    },
    // 搜索数据
    handleSearchChange() {
      this.$refs.tree.getSelectedNodes().forEach(node => {
        node.selected = false;
      }); //取消选中目录树的所有节点
      this.treeList[0].selected = true; //选中目录树“所有”项
      const params = {
        moduleGroup: null,
        funcId: null,
        currentPage: 1
      };
      this.getTableConfig(params);
    },
    // 处理保存记录按钮的切换
    handleSwitchChange(row) {
      if (this.apiType == 'custom') {
        // 外部接口
        let datas = {
          token: row.token
        };
        this.$api.framework.apiManage
          .apiUdpateList(datas)
          .then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
            }
          })
          .catch(error => {
            row.needAudit = row.needAudit === 0 ? 1 : 0;
          });
      } else {
        const params = {
          ...row,
          operationType: 'update'
        };
        this.$api.framework.apiManage
          .save(params)
          .then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
            }
          })
          .catch(error => {
            row.needAudit = row.needAudit === 0 ? 1 : 0;
          });
      }
    },
    testApi(row) {
      this.rowData = row;
      this.isTestShow = true;
    },
    // 显示接口帮助
    showApiHelp(row) {
      this.rowData = row;
      this.isApiHelpShow = true;
    },
    // 显示接口调用记录
    showCallRecord(row) {
      this.rowData = row;
      this.isCallRecordShow = true;
    },
    // 显示接口表单对话框(添加/删除/编辑/复制)
    showApiForm(row, type) {
      this.rowData = row;
      this.operationType = type;
      this.isFormDialogShow = true;
    },
    t(arg) {
      //国际化翻译时，过滤器filter中拿不到this, 需要转化
      return this.$t(arg);
    },
    exportHelp() {
      let param = {
        url: 'api/binary/api/help/export',
        params: {
          moduleGroup: this.searchParams.moduleGroup,
          funcId: this.searchParams.funcId,
          keyword: this.searchParams.keyword
        }
      };
      this.download(param);
    }
  },
  computed: {
    isSiderHide: {
      get() {
        return this.$store.state.isSiderTreeHide;
      },
      set(val) {
        this.$store.commit('setSiderTreeHide', val);
      }
    }
  }
};
</script>

<style lang="less" scoped></style>
