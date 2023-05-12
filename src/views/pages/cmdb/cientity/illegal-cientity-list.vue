<template>
  <div>
    <div class="textRight">
      <span class="mr-nm">
        <Button type="primary" :ghost="true" @click="isExportDialogShow = true">{{ $t('page.export') }}</Button>
      </span>
      <span>
        <CombineSearcher
          v-model="searchParam"
          style="width:400px;display:inline-block"
          v-bind="searchConfig"
          @change="searchCiEntity(1)"
        ></CombineSearcher>
      </span>
    </div>
    <div v-if="ciEntityData && ciEntityData.tbodyList && ciEntityData.tbodyList.length > 0" class="mt-md">
      <TsTable
        v-if="ciEntityData"
        v-bind="ciEntityData"
        multiple
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
      >
        <template slot="ciEntityName" slot-scope="{ row }">
          <a href="javascript:void(0)" @click="toCiEntity(row.ciId, row.ciEntityId)">
            <span v-if="row.ciEntityName">{{ row.ciEntityName }}</span>
            <span v-else>{{ $t('term.cmdb.nonamecientity') }}</span>
          </a>
        </template>
        <template v-slot:error="{ row }">
          <ul>
            <li
              v-for="(err, index) in row.error"
              :key="index"
              class="text-grey"
              style="white-space:normal"
            >
              {{ err }}
            </li>
          </ul>
          <!--<Poptip
            v-if="row.error && row.error.length > 0"
            trigger="hover"
            title="异常"
            word-wrap
            width="400"
            :transfer="true"
            placement="left"
          >
            <span class="text-error tsfont-warning-s"></span>
            <div slot="content">
              <ul>
                <li v-for="(err,index) in row.error" :key="index">
                  {{ err }}
                </li>
              </ul>
            </div>
          </Poptip>-->
        </template>
      </TsTable>
    </div>
    <div v-if="!ciEntityData.tbodyList || ciEntityData.tbodyList.length == 0">
      <NoData v-if="!isLoading"></NoData>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
    </div>
    <TsDialog
      v-if="isExportDialogShow"
      type="modal"
      width="small"
      :isShow="isExportDialogShow"
      :title="$t('term.cmdb.needexportcientity')"
      @on-close="isExportDialogShow = false"
    >
      <template v-slot>
        <div class="exportItemContainer">
          <div
            v-for="(item, index) in attrRelList"
            :key="index"
            class="padding-xs exportItem overflow"
            @click="selectExportItem(item)"
          >
            <i v-if="item.selected" class="tsfont-check-s text-success selected"></i>
            <div>{{ item.label }}</div>
            <div class="text-grey">{{ item.name }}</div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="isExportDialogShow = false">{{ $t('page.cancel') }}</Button>
        <Button type="primary" ghost @click="selectAllExportItem()">{{ $t('page.selectall') }}</Button>
        <Button
          v-download="exportUrl()"
          :disabled="isExporting || attrRelList.find(d => d.selected) == null"
          type="primary"
          :loading="isExporting"
        >{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';

export default {
  name: '',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  directives: { download },
  props: {
    legalValidId: { type: Number },
    ciId: { type: Number },
    needAction: { type: Boolean, default: true },
    needCheck: { type: Boolean, default: false }
  },
  data() {
    return {
      currentTransactionId: null,
      isHistoryDetailShow: false,
      isLoading: true,
      isExporting: false, //是否导出中

      isExportDialogShow: false,
      ciEntityData: {},
      attrList: [],
      searchParam: {},
      attrRelList: [], //属性和关系列表，用于导出excel时选择
      theadList: [
        { key: 'ciEntityName', title: this.$t('term.cmdb.cientityname') },
        //{ key: 'ciLabel', title: '模型' },
        //{ key: 'legalValidName', title: '规则名称' },
        //{ key: 'legalValidTypeText', title: '规则类型' },
        { key: 'validTime', title: this.$t('page.checktime'), type: 'time' },
        { key: 'error', title: this.$t('page.reason') }
      ],
      // searchParam: { pageSize: this.pageSize },
      searchConfig: {
        search: false,
        labelPosition: 'left',
        labelWidth: 120,
        searchList: [
          {
            type: 'text',
            name: 'keyword',
            label: this.$t('page.keyword')
          },
          /*{
            type: 'radio',
            name: 'legalValidType',
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.cmdb.enums.legalvalid.LegalValidType' },
            label: '规则类型',
            transfer: true
          },*/
          {
            type: 'daterange',
            name: 'validTimeRange',
            label: this.$t('page.reason'),
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
  mounted() {
    this.getCiAttrRelList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getCiAttrRelList() {
      this.$api.cmdb.ci.searchCiAttrRel(this.ciId).then(res => {
        this.attrRelList = res.Return;
      });
    },
    exportUrl() {
      //复制一个条件对象不要影响页面搜索
      const searchParam = this.$utils.deepClone(this.searchParam);
      const showAttrRelList = [];
      this.attrRelList.forEach(element => {
        if (element.selected) {
          showAttrRelList.push(element.uid);
        }
      });

      searchParam.showAttrRelList = showAttrRelList;
      searchParam.attrFilterList = [];
      for (const key in this.attrFilterList) {
        const d = this.attrFilterList[key];
        if (d.attrId && d.expression) {
          const obj = {
            attrId: d.attrId,
            valueList: d.valueList,
            expression: d.expression
          };
          searchParam.attrFilterList.push(obj);
        }
      }
      searchParam.relFilterList = [];
      for (const key in this.relFilterList) {
        const d = this.relFilterList[key];
        if (d.relId && d.expression && d.direction) {
          const obj = {
            relId: d.relId,
            direction: d.direction,
            valueList: d.valueList,
            expression: d.expression
          };
          searchParam.relFilterList.push(obj);
        }
      }
      return {
        url: 'api/binary/cmdb/cientity/export',
        params: searchParam,
        changeStatus: status => {
          if (status == 'start') {
            this.isExporting = true;
          } else if (status == 'success' || status == 'error') {
            this.isExporting = false;
            this.isExportDialogShow = false;
          }
        }
      };
    },
    selectExportItem(item) {
      this.$set(item, 'selected', !item.selected);
    },
    selectAllExportItem() {
      this.attrRelList.forEach(element => {
        this.$set(element, 'selected', true);
      });
    },
    toCiEntity(ciId, ciEntityId) {
      this.$router.push({ path: '/ci/' + ciId + '/cientity-view/' + ciEntityId });
    },
    searchCiEntity(current) {
      if (current) {
        this.searchParam.currentPage = current;
      }

      this.$api.cmdb.cientity.searchIllegalCiEntity(this.searchParam).then(res => {
        this.ciEntityData = res.Return;
        this.ciEntityData.theadList = this.theadList;
        this.isLoading = false;
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
  computed: {},
  watch: {
    ciId: {
      handler: function(val) {
        if (val) {
          this.searchParam['ciId'] = this.ciId;
          this.searchParam['legalValidId'] = this.legalValidId;
          this.searchCiEntity(1);
        }
      },
      immediate: true
    },
    id: {
      handler: function(val) {
        if (val) {
          this.searchParam['ciId'] = this.ciId;
          this.searchParam['legalValidId'] = this.legalValidId;
          this.searchCiEntity(1);
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';

.textRight {
  text-align: right;
}
.exportItemContainer {
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  .exportItem {
    cursor: pointer;
    font-size: 12px;
    border-radius: 4px;
    position: relative;
    .selected {
      position: absolute;
      right: 5px;
      top: 5px;
    }
  }
  .exportItem:hover {
    background: @default-table-hover-color;
  }
}
</style>
