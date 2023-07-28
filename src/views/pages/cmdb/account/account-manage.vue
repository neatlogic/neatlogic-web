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
        <TsRow>
          <Col :span="6">
            <TsFormSelect v-model="tableData.protocolIdList" v-bind="protocolConfig"></TsFormSelect>
          </Col>
          <Col :span="18">
            <InputSearcher
              v-model="keyword"
              @change="getTableData()"
            ></InputSearcher>
          </Col>
        </TsRow>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve),
    NewAccount: resolve => require(['./components/new-account'], resolve),
    Agreement: resolve => require(['./components/agreement'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve)
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
      keyword: '',
      searchConfig: {
        placeholder: this.$t('page.name')
      },
      searchParams: {
        currentPage: 1,
        pageSize: 20
      },
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
        currentPage: 1,
        protocolIdList: []
      },
      protocolConfig: {
        placeholder: this.$t('page.protocol'),
        multiple: true,
        rootName: 'tbodyList',
        dynamicUrl: 'api/rest/resourcecenter/account/protocol/search',
        dealDataByUrl: (nodeList) => this.getPrototalDataList(nodeList),
        params: {isExcludeTagent: 1}, // 是否排除tagent
        nowrapHead: true,
        onChange: (value) => {
          this.tableData.protocolIdList = value;
          this.getTableData(1);
        }
      },
      isShow: false,
      title: this.$t('page.procotolmanage')
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
    getTableData(currentPage, pageSize, protocolIdList) {
      let data = {
        keyword: this.keyword,
        currentPage: currentPage || this.tableData.currentPage,
        pageSize: pageSize || this.tableData.pageSize,
        protocolIdList: protocolIdList || this.tableData.protocolIdList
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
        content: row.referredCount > 0 ? this.$t('page.deletetarget', {target: this.$t('page.account')}) : this.$t('dialog.content.deleteconfirm', {target: row.name}),
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
