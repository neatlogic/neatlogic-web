<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain border="border" navBorderBottom="none">
      <template v-slot:topLeft>
        <div class="action-group">
          <div v-auth="'RESOURCECENTER_ACCOUNT_MODIFY'" class="action-item tsfont-plus" @click="addAccount()">{{ $t('page.account') }}</div>
          <div class="action-item tsfont-setting" @click="addHttp()">{{ $t('page.procotolmanage') }}</div>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="getTableData(1)"></CombineSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          :theadList="theadList"
          v-bind="tableData"
          :hideAction="hasAccountModifyAuth"
          @changeCurrent="getTableData"
          @changePageSize="getTableData(1, ...arguments)"
        >
          <template v-slot:name="{ row }">
            <span v-if="hasAccountModifyAuth" class="text-href" @click="operation(row, 'view')">{{ row.name }}</span>
            <span v-else>{{ row.name }}</span>
          </template>
          <template v-slot:isDefault="{ row }">
            <span v-if="row.isDefault == '1'" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template v-slot:protocol="{ row }">
            <span v-if="row.protocolPort">{{ row.protocol }}({{ row.protocolPort }})</span>

            <span v-else>
              {{ row.protocol }}
            </span>
          </template>
          <template v-slot:resourceReferredCount="{row}">
            <ReferenceSelect
              :id="row.id"
              calleeType="resourceaccount"
              :isTable="true"
              :moduleId="moduleId"
              :referenceCount="row.resourceReferredCount"
            ></ReferenceSelect>
          </template>
          <template v-slot:action="{ row }">
            <div v-auth="'RESOURCECENTER_ACCOUNT_MODIFY'" class="tstable-action">
              <ul class="tstable-action-ul">
                <li
                  class="tsfont-trash-o"
                  @click="deleteAccount(row)"
                >{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>

    <Agreement v-if="isShow" :title="title" @close="close"></Agreement>

    <NewAccount
      v-if="isNewAccountShow"
      :id="id"
      :title="titleAccount"
      @close="closeNewAccount"
    ></NewAccount>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    NewAccount: () => import('./components/new-account'),
    Agreement: () => import('./components/agreement'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue')
  },
  filters: {},
  props: {},
  data() {
    return {
      titleAccount: '',
      showlist: true,
      searchName: '',
      isshow: false,
      id: null,
      isNewAccountShow: false,
      loadingShow: false,
      searchConfig: {
        searchMode: 'clickBtnSearch',
        labelPosition: 'left',
        placeholder: this.$t('page.name') + '、' + this.$t('page.username') + '、' + this.$t('page.protocol'),
        searchList: [
          {
            type: 'select',
            name: 'protocolIdList',
            label: this.$t('page.protocol'),
            multiple: true,
            rootName: 'tbodyList',
            dynamicUrl: 'api/rest/resourcecenter/account/protocol/search',
            dealDataByUrl: nodeList => this.getPrototalDataList(nodeList),
            params: {isExcludeTagent: 1},
            transfer: true
          },
          {
            type: 'radio',
            name: 'isDefault',
            label: this.$t('page.isdefault'),
            dataList: [
              {
                text: this.$t('page.yes'),
                value: 1
              },
              {
                text: this.$t('page.no'),
                value: 0
              }
            ]
          }
        ]
      },
      searchParams: {
        currentPage: 1,
        pageSize: 20
      },
      searchVal: {},
      theadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'account', title: this.$t('page.username') },
        { key: 'protocol', title: this.$t('page.protocol') },
        { key: 'isDefault', title: this.$t('page.isdefault')},
        { key: 'resourceReferredCount', title: this.$t('term.cmdb.invokeasset') },
        { key: 'lcu', title: this.$t('page.fcu'), type: 'user' },
        { key: 'lcd', title: this.$t('page.fcd'), type: 'time' },
        { key: 'action', title: '' }
      ],
      tableData: {
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      isShow: false,
      title: this.$t('page.procotolmanage'),
      moduleId: MODULEID
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query && this.$route.query.isNewAccountShow) {
      this.isNewAccountShow = true;
      this.titleAccount = this.$t('dialog.title.addtarget', {target: this.$t('page.account')});
    }
  },
  beforeMount() {},
  mounted() {
    this.getTableData(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getPrototalDataList(nodeList) { // 处理默认值的数据结构
      let dataList = [];
      if (!this.$utils.isEmpty(nodeList)) {
        nodeList.forEach(item => {
          let namePort = '';
          if (item.port) {
            namePort = item.name + '(' + item.port + ')';
          } else {
            namePort = item.name;
          }
          dataList.push({ text: namePort, value: item.id});
        });
      }

      return dataList;
    },
    operation(row, view) {
      if (view == 'view') {
        this.editAccount(row);
      }
    },
    getTableData(currentPage, pageSize) {
      let data = {
        ...this.searchParams,
        ...this.searchVal,
        currentPage: currentPage || this.tableData.currentPage,
        pageSize: pageSize || this.tableData.pageSize
      };
      this.tableData.pageSize = pageSize || this.tableData.pageSize;
      this.loadingShow = true;
      this.$api.cmdb.accountManage.searchAccount(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = Object.assign(this.tableData, res.Return);
          this.loadingShow = false;
        }
      });
    },
    closeNewAccount(needFresh) {
      this.isNewAccountShow = false;
      if (needFresh) {
        this.getTableData(1);
      }
    },
    addAccount() {
      this.id = null;
      this.titleAccount = this.$t('dialog.title.addtarget', {target: this.$t('page.account')});
      this.isNewAccountShow = true;
    },
    addHttp() {
      this.isShow = true;
    },
    editAccount(row) {
      this.id = row.id;
      this.titleAccount = this.$t('dialog.title.edittarget', {target: this.$t('page.account')});
      this.isNewAccountShow = true;
    },
    close() {
      this.isShow = false;
    },
    deleteAccount(row) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: row.referredCount > 0 ? this.$t('page.deletetarget', {target: this.$t('page.account')}) : this.$t('dialog.content.deletetargetconfirm', {target: row.name}),
        btnType: 'error',
        okText: this.$t('page.delete'),
        'on-ok': vnode => {
          this.$api.cmdb.accountManage
            .deleteAccountById(row.id)
            .then(res => {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.getTableData(1);
            })
            .catch(error => {
              if (error.data.Message) {
                this.$Message.error(error.data.Message);
              } else {
                this.$Message.error(this.$t('message.deletefailed'));
              }
            });
        }
      });
    }
  },

  computed: {
    hasAccountModifyAuth() {
      //判断账号管理权限
      return this.$store.getters.userAuthList.includes('RESOURCECENTER_ACCOUNT_MODIFY');
    }
  },
  watch: {}
};
</script>
<style scoped lang="less"></style>
