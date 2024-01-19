<template>
  <div>
    <div class="textRight">
      <CombineSearcher
        v-model="searchParam"
        style="width:400px;display:inline-block"
        v-bind="searchConfig"
        @change="searchCiEntity(1)"
      ></CombineSearcher>
    </div>
    <div v-if="ciEntityData && ciEntityData.tbodyList && ciEntityData.tbodyList.length > 0" class="mt-md">
      <TsTable
        v-if="ciEntityData"
        v-bind="ciEntityData"
        multiple
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
      >
        <template slot="transactionId" slot-scope="{ row }">
          <a href="javascript:void(0)" @click="compare(row)">{{ row.transactionId }}</a>
        </template>
        <template slot="deleteTime" slot-scope="{ row }">
          <span>{{ row.deleteTime | formatDate }}</span>
        </template>
        <template slot="description" slot-scope="{ row }">
          <Tooltip
            v-if="row.description"
            max-width="200"
            :transfer="true"
            :content="row.description"
          >
            <div class="fz10 text-grey" :style="row.description ? 'width:300px;overflow:hidden;text-overflow: ellipsis;white-space:nowrap' : ''">
              {{ row.description }}
            </div>
          </Tooltip>
        </template>
        <template v-for="(head, index) in finalHeaderList" :slot="head.key" slot-scope="{ row }">
          <div v-if="head.key.startsWith('attr_') && row.attrEntityData" :key="index">
            <div v-if="row.attrEntityData[head.key]">
              <AttrViewer
                :ciEntity="row"
                :handler="row.attrEntityData[head.key].type"
                :attrEntity="row.attrEntityData[head.key]"
                :authData="row.authData"
              ></AttrViewer>
            </div>
          </div>
          <div v-else-if="head.key.startsWith('global_') && row.globalAttrEntityData" :key="index">
            <div v-if="row.globalAttrEntityData[head.key] && row.globalAttrEntityData[head.key].valueList">
              <Tag v-for="(v,vindex) in row.globalAttrEntityData[head.key].valueList" :key="vindex">
                {{ v.value }}
              </Tag>
            </div>
          </div>
          <div v-else-if="head.key.startsWith('const_')" :key="index">
            {{ row[head.key.replace('const_', '')] }}
          </div>
          <div v-else-if="row.relEntityData && row.relEntityData[head.key] && row.relEntityData[head.key]['valueList']" :key="index">
            <a
              v-for="(relentity, rindex) in row.relEntityData[head.key]['valueList']"
              :key="rindex"
              class="mr-md"
              href="javascript:void(0)"
              @click="toCiEntity(relentity)"
            >
              <span class="tsfont-ci"></span>
              <span>{{ relentity.ciEntityName }}</span>
            </a>
          </div>
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-revover" :class="!row.authData || !row.authData.cientityrecover ? 'disable' : ''" @click="recoverCiEntity(row)">恢复</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <div v-if="!ciEntityData.tbodyList || ciEntityData.tbodyList.length == 0">
      <NoData v-if="!isLoading"></NoData>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
    </div>
    <DeletedHistoryDetail v-if="isHistoryDetailShow" :transactionId="currentTransactionId" @close="closeHistoryDetail"></DeletedHistoryDetail>
  </div>
</template>
<script>
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';

export default {
  name: '',
  components: {
    CombineSearcher,
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    AttrViewer: resolve => require(['./attr-viewer.vue'], resolve),
    DeletedHistoryDetail: resolve => require(['./deleted-history-detail.vue'], resolve)
  },
  props: {
    ciId: { type: Number },
    needAction: { type: Boolean, default: true },
    needCheck: { type: Boolean, default: false }
  },
  data() {
    return {
      currentTransactionId: null,
      isHistoryDetailShow: false,
      isLoading: true,
      theadList: [],
      ciEntityData: {},
      attrList: [],
      searchParam: { pageSize: this.pageSize },
      searchConfig: {
        search: false,
        labelPosition: 'left',
        labelWidth: 70,
        searchList: [
          {
            type: 'text',
            name: 'transactionId',
            label: this.$t('term.cmdb.transactionid')
          },
          {
            type: 'select',
            name: 'inputFrom',
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.common.constvalue.InputFrom' },
            label: this.$t('page.deletefrom'),
            transfer: true
          },
          {
            type: 'daterange',
            name: 'commitTimeRange',
            label: this.$t('page.deletetime'),
            format: 'yyyy-MM-dd',
            transfer: true
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    compare(row) {
      this.currentTransactionId = row.transactionId;
      this.isHistoryDetailShow = true;
    },
    closeHistoryDetail() {
      this.currentTransactionId = null;
      this.isHistoryDetailShow = false;
    },
    toCiEntity(relentity) {
      relentity.id = relentity.ciId;
      this.$emit('toCiEntity', relentity);
    },
    searchCiEntity(current) {
      //this.isLoading = true;
      //如果是搜索等操作的，需要默认第一页防止分页数据没有
      if (current) {
        this.searchParam.currentPage = current;
      }

      this.$api.cmdb.cientity.searchDeleteCiEntity(this.searchParam).then(res => {
        this.searchParam.currentPage = res.Return.currentPage;
        this.searchParam.pageSize = res.Return.pageSize;
        this.ciEntityData = res.Return;
        this.isLoading = false;
      });
    },
    async recoverCiEntity(row) {
      if (!row.authData || !row.authData.cientityrecover) {
        return;
      }
      let brotherTransactionCount = 0;
      if (row.transactionId && row.transactionGroupId) {
        await this.$api.cmdb.transaction.getBrotherTransactionCount(row.transactionId, row.transactionGroupId).then(res => {
          brotherTransactionCount = res.Return;
        });
      }
      let content = this.$t('dialog.content.recoverconfirm', {target: this.$t('term.cmdb.cientity')});
      if (brotherTransactionCount > 0) {
        content = this.$t('dialog.content.invokerecoverconfirm', {count: brotherTransactionCount});
      }
      this.$createDialog({
        title: this.$t('dialog.title.recoverconfirm'),
        content: content,
        btnType: 'success',
        'on-ok': vnode => {
          this.$api.cmdb.transaction.recoverTransaction(row.transactionId).then(res => {
            this.$Message.success(this.$t('message.recoversuccess'));
            vnode.isShow = false;
            this.searchCiEntity();
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    changeCurrent(current) {
      this.searchParam.currentPage = current;
      this.searchCiEntity();
    },
    changePageSize(size) {
      this.searchParam.pageSize = size;
      this.searchCiEntity();
    }
  },
  filter: {},
  computed: {
    finalHeaderList: function() {
      let finalList = [];
      if (this.ciEntityData && this.ciEntityData.theadList && this.ciEntityData.theadList.length > 0) {
        this.ciEntityData.theadList.forEach(element => {
          if (element.key.startsWith('attr_') || element.key.startsWith('relto_') || element.key.startsWith('relfrom_') || element.key.startsWith('const_') || element.key.startsWith('global_')) {
            finalList.push(element);
          }
        });
      }
      return finalList;
    }
  },
  watch: {
    ciId: {
      handler: function(val) {
        if (val) {
          this.searchParam['ciId'] = this.ciId;
          this.searchParam['needAction'] = this.needAction;
          this.searchParam['needCheck'] = this.needCheck;
          this.searchCiEntity();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.textRight {
  text-align: right;
}
</style>
