<template>
  <div class="PriorityManagement">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addChannelType()">{{ $t('term.process.sertype') }}</span>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="6">
            <TsFormSelect v-bind="isActiveSelectSetting"></TsFormSelect>
          </Col>
          <Col :span="18">
            <InputSearcher
              v-model="searchParam.keyword"
              @change="() => changeCurrent()"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content">
        <TsTable
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template slot="name" slot-scope="{ row }">
            <div :style="{ color: row.color ? row.color : '' }" class="cursor" @click="editChannelType(row.uuid)">{{ row.name }}</div>
          </template>
          <template slot="isActive" slot-scope="{ row }">
            <div>{{ row.isActive == 1 ? $t('page.enable') : $t('page.disable') }}</div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-rotate-right icon" @click="updateUuid(row.uuid)">{{ $t('term.process.updateworknum') }}</li>
                <li :class="{disable: disabledConfig.deleting}" class="tsfont-trash-o icon" @click="deleteRow(row.uuid, row.name)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <ChannelTypeEditDialog v-if="isShowChannelTypeEditDialog" :uuid="uuid" @close="closeDialog"></ChannelTypeEditDialog>
  </div>
</template>
<script>
export default {
  name: 'ChanneltypeManage',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    ChannelTypeEditDialog: resolve => require(['./channel-type-edit-dialog'], resolve)
  },
  filters: {},
  props: [],
  data() {
    return {
      uuid: '',
      loadingShow: true,
      isShowChannelTypeEditDialog: false,
      theadList: [
        { title: this.$t('page.name'), key: 'name', minWidth: 300, resizable: true },
        { title: this.$t('page.status'), key: 'isActive', minWidth: 300, resizable: true },
        { title: this.$t('term.process.worknumper'), key: 'prefix', minWidth: 300, resizable: true },
        { title: this.$t('term.process.worknumrules'), key: 'handlerName', minWidth: 300, resizable: true },
        { title: this.$t('page.description'), key: 'description', minWidth: 300, resizable: true },
        { title: ' ', key: 'action', align: 'right', width: 10 }
      ],
      tableData: {
        currentPage: 1,
        pageSize: 20,
        tbodyList: []
      },
      searchParam: {
        keyword: null,
        isActive: null
      },
      isActiveSelectSetting: {
        name: 'isActive',
        search: true,
        label: this.$t('page.status'),
        valueName: 'value',
        textName: 'text',
        border: 'border',
        dataList: [
          { value: 1, text: this.$t('page.enable') },
          { value: 0, text: this.$t('page.disable') }
        ],
        onChange: (value) => {
          this.searchParam.isActive = value;
          this.changeCurrent();
        }
      },
      disabledConfig: { //禁止按钮连续调用接口
        deleting: false,
        saving: false
      }
    };
  },
  created() {},
  mounted() {
    this.changeCurrent();
    let isCatalogManage = this.$route.query.isCatalogManage;
    if (isCatalogManage == '1') {
      this.addChannelType();
    }
  },
  beforeDestroy() {},
  methods: {
    searchData() {
      this.loadingShow = true;
      let params = {
        ...this.searchParam,
        currentPage: this.tableData.currentPage || 1, 
        pageSize: this.tableData.pageSize || 20
      };
      this.$api.process.channeltype
        .search(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.tableData = Object.assign(this.tableData, res.Return || {});
          }
        }).finally(() => {
          this.loadingShow = false;
        });
    },
    changeCurrent(currentPage = 1) {
      this.tableData.currentPage = currentPage;
      this.searchData();
    },
    changePageSize(pageSize) {
      this.tableData.currentPage = 1;
      this.tableData.pageSize = pageSize;
      this.searchData();
    },
    addChannelType() {
      this.uuid = '';
      this.isShowChannelTypeEditDialog = true;
    },
    editChannelType(uuid) {
      this.uuid = uuid;
      this.isShowChannelTypeEditDialog = true;
    },
    deleteRow(uuid, name) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          let params = { uuid: uuid };
          if (!this.disabledConfig.deleting) {
            this.disabledConfig.deleting = true;
            this.$api.process.channeltype.delete(params).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.searchData();
                vnode.isShow = false;
              }
            }).finally(() => {
              this.disabledConfig.deleting = false;
            });
          }
        }
      });
    },
    updateUuid(uuid) {
      let data = {
        channelTypeUuid: uuid
      };
      this.$api.process.channeltype.updateUuid(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.searchData();
        }
      });
    },
    closeDialog(needRefresh) {
      this.isShowChannelTypeEditDialog = false;
      if (needRefresh) {
        this.searchData();
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
