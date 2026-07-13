<template>
  <div>
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsContain :isSiderHide="isSiderHide" :enableCollapse="true" border="border">
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-auth="['ADMIN']" class="action-item">
            <AuditConfig auditName="API-AUDIT" :title="$t('term.framework.apiaccesstime')"></AuditConfig>
          </span>
          <span class="action-item tsfont-download" @click="exportHelp()">{{ $t('page.export') }}</span>
          <span class="action-item tsfont-agent" @click="showMcpToolList()">{{ $t('term.framework.mcptoollist') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div style="text-align: right" :style="{ '--children': 3 }" class="controller-group">
          <div>
            <CombineSearcher
              v-model="searchVal"
              class="search"
              v-bind="searchConfig"
              :clearable="true"
              :isRequired="false"
              @change="handleSearchChange()"
            ></CombineSearcher>
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
          <template v-slot:isMcp="{ row }">
            <span v-if="row.isMcp" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
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
            <span class="text-href" @click.stop="showApiForm(row)">{{ row.token }}</span>
          </template>
          <template v-slot:authTypeNameList="{ row }">
            <Tag v-for="(authTypeName, index) in row.authTypeNameList" :key="index">{{ authTypeName }}</Tag>
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
                <!--<li v-if="!row.isPrivate" class="tsfont-copy icon" @click="showApiForm(row)">
                  {{ $t('page.copy') }}
                </li>-->
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
      v-if="isFormDialogShow"
      :isShow="isFormDialogShow"
      :token="currentToken"
      @on-hide="isFormDialogShow = false"
    />
    <ApiTest v-if="isTestShow" :rowData="rowData" @close="isTestShow = false"></ApiTest>
    <McpToolList
      v-if="isMcpToolListShow"
      :isShow="isMcpToolListShow"
      @close="isMcpToolListShow = false"
    ></McpToolList>
  </div>
</template>

<script>
import download from '@/resources/mixins/download.js';
export default {
  name: 'ApiManage',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    ApiHelp: () => import('./api-manage-help'),
    CallRecord: () => import('./api-manage-call-record'),
    FormDialog: () => import('./api-manage-form'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    ApiTest: () => import('./api-manage-test.vue'),
    McpToolList: () => import('./api-manage-mcp-tool-list.vue'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue')
  },
  filters: {

  },
  mixins: [download],
  data() {
    return {
      isLoading: true, //页面加载中
      isApiHelpShow: false, //是否显示帮助抽屉
      isTestShow: false, //是否显示测试
      isCallRecordShow: false, //是否显示接口调用记录
      isFormDialogShow: false, //是否显示对话框
      isMcpToolListShow: false, //是否显示MCP工具列表测试
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
        { title: this.$t('page.needaudit'), key: 'needAudit', minWidth: 80 },
        { title: this.$t('term.framework.mcpservice'), key: 'isMcp', minWidth: 80 },
        { title: this.$t('page.authtype'), key: 'authTypeNameList', minWidth: 80 },
        // { title: this.$t('page.status'), key: 'isActive', minWidth: 60 },
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
      currentToken: '',
      searchParams: {
        //搜索参数
        keyword: null,
        moduleGroup: null,
        funcId: null,
        currentPage: 1,
        pageSize: 20
      },
      tableHeight: 'calc(100vh - 192px)',
      needAudit: null,
      initSearchVal: {
        needAudit: null,
        isMcp: null,
        authType: null,
        keyword: null
      },
      searchVal: {},
      searchConfig: {
        labelWidth: 100,
        // placeholder: '请输入节点ip、端口、名称',
        searchList: [
          {
            type: 'radio',
            name: 'needAudit',
            value: null,
            label: this.$t('page.isneedaudit'),
            placeholder: this.$t('page.pleaseselect'),
            dataList: [
              { value: 1, text: this.$t('page.yes') },
              { value: 0, text: this.$t('page.no') }
            ],
            transfer: true,
            allowToggle: true
          },
          {
            type: 'radio',
            name: 'isMcp',
            value: null,
            label: this.$t('term.framework.mcpservice'),
            placeholder: this.$t('page.pleaseselect'),
            dataList: [
              { value: 1, text: this.$t('page.yes') },
              { value: 0, text: this.$t('page.no') }
            ],
            transfer: true,
            allowToggle: true
          },
          {
            type: 'select',
            name: 'authType',
            label: this.$t('page.authtype'),
            multiple: false,
            url: 'api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.restful.constvalue.ApiAuthType' },
            transfer: true
          }
        ]
      }
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
    getTree() {
      const menuType = 'system';
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
        type: 'system'
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
      let searchVal = { ...this.initSearchVal};
      searchVal = { ...searchVal, ...this.searchVal };
      this.searchParams = { ...this.searchParams, currentPage: 1, ...params, ...searchVal };
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
      const params = {
        ...row
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
    // 显示接口表单对话框
    showApiForm(row) {
      this.currentToken = row && row.token ? row.token : '';
      this.isFormDialogShow = true;
    },
    showMcpToolList() {
      this.isMcpToolListShow = true;
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
