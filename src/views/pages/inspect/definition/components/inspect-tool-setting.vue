
<template>
  <div class="tool-setting-wrap">
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Row>
            <Col span="14">
            </Col>
            <Col span="10">
              <InputSearcher
                v-model="searchKeyword"
                :placeholder="$t('page.name')"
                class="mb-md"
                @change="handleSearchChange"
              ></InputSearcher>
            </Col>
          </Row>
          <TsTable
            v-if="tableSetting.tbodyList"
            v-bind="tableSetting"
            :theadList="theadList"
          >
            <template slot="CiType" slot-scope="{row}">
              <span class="overflow">{{ row.label }} <span class="overflow text-grey">({{ row.name }})</span></span>
            </template>
            <template slot="combopId" slot-scope="{row}">
              <div class="flex-start">
                <TsFormSelect
                  v-model="row.combopId"
                  v-bind="formSelectSetting"
                  :dataList="comboList"
                  class="mr-nm"
                  @on-change="() => selectChange(row)"
                >
                </TsFormSelect>
                <div class="action-group">
                  <span
                    v-if="row.combopId"
                    :title="$t('dialog.title.edittarget',{'target':$t('term.autoexec.combinationtool')})"
                    class="action-item tsfont-edit"
                    @click.stop="toEdit(row)"
                  ></span>
                  <span class="action-item tsfont-refresh" :title="$t('page.refreshtarget',{'target':$t('term.autoexec.combinationtool')})" @click.stop="getComboList(true)"></span>
                </div>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'InspectToolSetting', // 巡检工具设置
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  filters: {},
  props: {
    keyword: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchKeyword: this.keyword,
      comboList: [], // 组合工具列表
      deepCloneTbodyList: [], // 深拷贝列表值
      dialogSetting: {
        type: 'modal',
        title: this.$t('term.inspect.inspecttoolmanage'),
        isShow: true,
        okText: this.$t('page.save'),
        height: '500px',
        width: 'medium'
      },
      formSelectSetting: {
        search: true,
        transfer: true,
        valueName: 'id',
        textName: 'name',
        width: '200px'
      },
      theadList: [
        {
          title: 'CiType',
          key: 'CiType',
          type: 'slot',
          width: 200
        },
        {
          title: this.$t('term.autoexec.combinationtool'),
          key: 'combopId',
          type: 'slot'
        }
      ],
      tableSetting: {
        height: '350px',
        loading: false,
        tbodyList: []
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getComboList();
    this.getTableData();
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
    handleSearchChange() {
      this.getTableData();
    },
    selectChange(row) {
      // 值改变
      this.deepCloneTbodyList.push({...row});
      this.deepCloneTbodyList = this.$utils.uniqueByField(this.deepCloneTbodyList, 'id');
    },
    getComboList(needRefreshTip = false) {
      // 获取所有【已激活】的组合工具列表
      this.$api.inspect.definition.getCombopList({
        typeId: 1,
        needPage: false
      }).then((res) => {
        if (res.Status == 'OK') {
          if (needRefreshTip) {
            this.$Message.success(this.$t('message.refreshsuccess')); // 点击刷新按钮，获取新的组件工具列表，需要提示用户刷新成功
          }
          this.comboList = res.Return.tbodyList;
        }
      });
    },
    okDialog() {
      // 保存
      let inspectCombopList = this.$utils.deepClone(this.tableSetting.tbodyList);
      let inspectCiCombopList = [];
      inspectCombopList.forEach((val) => {
        inspectCiCombopList.push({
          id: val.id,
          combopId: val.combopId
        });
      });
      this.$api.inspect.definition.saveCombinationTool({inspectCiCombopList: inspectCiCombopList}).then((res) => {
        if (res.Status == 'OK') {
          this.closeDialog(true);
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    },
    closeDialog(needRefresh = false) {
      this.searchKeyword = '';
      this.$emit('close', needRefresh);
    },
    getTableData() {
      // 获取列表数据
      this.tableSetting.loading = true;
      this.tableSetting.tbodyList = [];
      let tbodyList = [];
      this.$api.inspect.definition.getCombinationToolList(this.searchKeyword).then((res) => {
        if (res.Status == 'OK') {
          let dataList = res.Return || [];
          if (!this.$utils.isEmpty(this.deepCloneTbodyList) && !this.$utils.isEmpty(dataList)) {
            let defaultTbodyIdList = [];
            this.deepCloneTbodyList.forEach((item) => {
              defaultTbodyIdList.push(item.id);
            });
            dataList.forEach((item) => {
              if (defaultTbodyIdList.includes(item.id)) {
                let findItem = this.deepCloneTbodyList.find((item) => item.id); // 搜索值后，保留新关联组合工具的值
                if (!this.$utils.isEmpty(findItem)) {
                  tbodyList.push(findItem);
                }
              } else {
                tbodyList.push(item);
              }
            });
            this.tableSetting.tbodyList = tbodyList;
          } else {
            this.tableSetting.tbodyList = dataList || [];
          }
          this.tableSetting.tbodyList.forEach((val) => {
            if (!val.combopId) {
              val.combopId = null; // 设置默认初始值
            } 
          });
        }
      }).finally(() => {
        this.tableSetting.loading = false;
      });
    },
    toEdit(row) {
      // 跳转到组合工具，详情页面，versionStatus 版本状态是已激活的
      window.open(HOME + '/autoexec.html#/action-detail?id=' + row.combopId + '&versionStatus=passed', '_blank');
    }
  },
  computed: {},
  watch: {}
};
</script>

