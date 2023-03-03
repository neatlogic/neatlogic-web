<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain border="border" navBorderBottom="none">
      <template v-slot:topLeft>
        <div class="action-group">
          <div v-auth="'RESOURCECENTER_ACCOUNT_MODIFY'" class="action-item tsfont-plus" @click="addAccount()">{{ $t('common.account') }}</div>
          <div class="action-item tsfont-setting" @click="addHttp()">协议管理</div>
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
      :isHidden="isHidden"
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
    let _this = this;
    return {
      titleAccount: '',
      showlist: true,
      searchName: '',
      isshow: false,
      id: null,
      isHidden: false,
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
        { key: 'account', title: this.$t('common.username') },
        { key: 'protocol', title: this.$t('common.protocol') },
        { key: 'resourceReferredCount', title: '关联资产' },
        { key: 'lcu', title: this.$t('common.modifier'), type: 'user' },
        { key: 'lcd', title: this.$t('common.modifytime'), type: 'time' },
        { key: 'action', title: '' }
      ],
      tableData: {
        rowNum: 0,
        pageSize: 20,
        currentPage: 1,
        protocolIdList: []
      },
      protocolConfig: {
        placeholder: this.$t('common.protocol'),
        multiple: true,
        textName: 'text',
        valueName: 'value',
        dynamicUrl: '',
        dataList: [],
        nowrapHead: true,
        onChange: function(value) {
          _this.tableData.protocolIdList = value;
          _this.getTableData(1);
        }
      },
      isShow: false,
      title: '协议管理'
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query && this.$route.query.isNewAccountShow) {
      this.isNewAccountShow = true;
      this.titleAccount = this.$t('common.addAccount');
    }
  },
  beforeMount() {},
  mounted() {
    this.getTableData(1);
    this.getdataList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    operation(row, view) {
      if (view == 'view') {
        this.editAccount(row);
      }
    },
    getdataList() {
      let data = {
        keyword: '',
        isExcludeTagent: 1
      };
      let that = this;
      that.$api.cmdb.accountManage.searchlistresourcecenter(data).then(res => {
        if (res.Status == 'OK') {
          let resData = res.Return.tbodyList;
          let newObj = [];
          resData.forEach(v => {
            let name = '';
            if (v.port) {
              name = v.name + '(' + v.port + ')';
            } else {
              name = v.name;
            }
            newObj.push({ text: name, value: v.id, name: v.name });
          });
          this.$nextTick(() => {
            this.protocolConfig.dataList = newObj;
          });
        }
      });
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
      this.titleAccount = this.$t('common.addAccount');
      this.isNewAccountShow = true;
      this.isHidden = false;
    },
    addHttp() {
      this.isShow = true;
    },
    editAccount(row) {
      this.id = row.id;
      this.titleAccount = this.$t('common.editAccount');
      this.isNewAccountShow = true;
      if (row.protocol == 'tagent') {
        // 协议为tagent隐藏帐号字段
        this.isHidden = true;
      } else {
        this.isHidden = false;
      }
    },
    close() {
      this.isShow = false;
    },
    deleteAccount(row) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: row.referredCount > 0 ? '当前帐号已被引用，是否仍要删除？' : `确认删除帐号：${row.name || ''}`,
        btnType: 'error',
        okText: '删除',
        'on-ok': vnode => {
          this.$api.cmdb.accountManage
            .deleteAccountById(row.id)
            .then(res => {
              this.$Message.success(this.$t('message.content.deletesuccess'));
              vnode.isShow = false;
              this.getTableData(1);
            })
            .catch(error => {
              if (error.data.Message) {
                this.$Message.error(error.data.Message);
              } else {
                this.$Message.error(this.$t('message.content.deletefailed'));
              }
            });
        }
      });
    }
  },

  computed: {
    hasAccountModifyAuth() {
      //判断帐号管理权限
      return this.$store.getters.userAuthList.includes('RESOURCECENTER_ACCOUNT_MODIFY');
    }
  },
  watch: {}
};
</script>
<style scoped lang="less"></style>
