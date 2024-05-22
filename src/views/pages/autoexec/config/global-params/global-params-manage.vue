<template>
  <div class="global-params-manage-box">
    <Loading :loadingShow="isShowLoading" type="fix"></Loading>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addGlobalParams">{{ $t('term.autoexec.globalparameter') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="keyword"
            @change="getTableList(1)"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            v-bind="tableConfig"
            @operation="operation"
            @changeCurrent="getTableList"
            @changePageSize="getTableList(1, ...arguments)"
          >
            <template slot="defaultValue" slot-scope="{row}">
              <span>{{ filterPassword(row) }}</span>
            </template>
            <template slot="referredCount" slot-scope="{row}">
              <ReferenceSelect
                :uuid="row.key"
                :isTable="true"
                calleeType="globalparam"
                :referenceCount="row.referredCount"
              ></ReferenceSelect>
            </template>
            <template slot="description" slot-scope="{row}">
              <span
                class="overflow description-text"
                :title="row.description"
              >{{ row.description }}</span>
            </template>
            <template slot="action" slot-scope="{row}">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li
                    class="icon tsfont-trash-o"
                    :title="row.ciEntityList && row.ciEntityList.length > 0 ? $t('page.citetarget', {target: $t('term.autoexec.globalparameter')}):''"
                    :class="{disable:row.ciEntityList && row.ciEntityList.length > 0}"
                    @click.stop="deleteSceneDefinition(row)"
                  >{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
    <GlobalParamsEdit
      v-if="isShowGlobalParams"
      :id="id"
      @close="closeDialog"
    >
    </GlobalParamsEdit>
  </div>
</template>
<script>
export default {
  name: 'GlobalParamsManage', // 全局参数
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue'),
    GlobalParamsEdit: () => import('./component/global-params-edit')
  },
  props: {},
  data() {
    return {
      keyword: '',
      isShowLoading: false,
      isShowGlobalParams: false,
      typeList: [],
      id: null,
      tableConfig: {
        theadList: [
          { title: this.$t('term.autoexec.paramsname'), key: 'key', type: 'linktext', textValue: 'edit'},
          { title: this.$t('term.autoexec.displayname'), key: 'name' },
          { title: this.$t('term.autoexec.valuetype'), key: 'typeText' },
          { title: this.$t('term.autoexec.paramsvalue'), key: 'defaultValue' },
          { title: this.$t('term.autoexec.associatedobject'), key: 'referredCount' },
          { title: this.$t('page.description'), key: 'description'},
          { title: this.$t('page.fcu'), key: 'lcu', type: 'user'},
          { title: this.$t('page.fcd'), key: 'lcd', type: 'time'},
          { key: 'action' }
        ],
        tbodyList: [],
        currentPage: 1,
        pageSize: 20
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getTableList();
    this.getTypeList();
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
    addGlobalParams() {
      this.id = null;
      this.isShowGlobalParams = true;
    },
    operation(row, type) {
      // 编辑
      if (type == 'edit' && row) {
        this.isShowGlobalParams = true;
        this.id = row.id;
      }
    },
    deleteSceneDefinition(row) {
      // 删除场景定义
      if (row && !row.id) {
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.autoexec.globalparameter')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.globalParams.deleteGlobalParamsById(row.id).then((res) => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getTableList(1);
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    getTableList(currentPage, pageSize) {
      let params = {
        keyword: this.keyword,
        currentPage: currentPage || this.tableConfig.currentPage,
        pageSize: pageSize || this.tableConfig.pageSize
      };
      this.tableConfig.pageSize = pageSize || this.tableConfig.pageSize;
      this.isShowLoading = true;
      this.$api.autoexec.globalParams.getGlobalParamsList(params).then((res) => {
        if (res && res.Status == 'OK') {
          Object.assign(this.tableConfig, res.Return);
          this.isShowLoading = false;
        }
      }).catch(() => {
        this.isShowLoading = false;
      });
    },
    closeDialog(needRefresh) {
      this.isShowGlobalParams = false;
      if (needRefresh) {
        this.getTableList(1);
      }
    },
    getTypeList() {
      this.$api.autoexec.globalParams.getTypeList({ enumClass: 'neatlogic.framework.autoexec.constvalue.AutoexecGlobalParamType' }).then((res) => {
        if (res.Status == 'OK') {
          this.typeList = res.Return;
        }
      });
    },
    filterPassword(row) {
      return row.type == 'password' ? '......' : row.defaultValue;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.global-params-manage-box {
  .description-text {
    display: inline-block;
    width: 500px;
  }
}
</style>
