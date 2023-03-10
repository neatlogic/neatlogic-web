<template>
  <div class="dynamicList-edit" :style="getStyle">
    <div style=" text-align: left;">
      <div v-if="tableData.tbodyList && tableData.tbodyList.length > 0" class="tstable-container">
        <div style="width:100%;overflow:auto">
          <table class="table-list tstable-body">
            <thead>
              <tr>
                <th v-for="(th, thIndex) in tableData.theadList" :key="thIndex">{{ th.title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td :colspan="tableData.theadList.length">
                  暂无数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template v-else>{{ $t('page.nodata') }}</template>
    </div>
    <div v-if="setting.config.desc" class="component-tips ts-info">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import viewmixin from '../viewmixin.js';
export default {
  name: 'FormdynamicList',
  components: { },
  mixins: [viewmixin],
  props: {
    setting: Object,
    value: [Array, String, Object],
    isReadonly: Boolean,
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    componentList: {
      //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      tableData: {
        theadList: [],
        tbodyList: [],
        rowNum: null,
        currentPage: 1,
        pageSize: 1
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchData() {
      let _this = this;
      let url = '/api/rest/matrix/column/data/search/fortable';
      let uuid = '';
      let json = {
        columnList: [],
        searchColumnList: [],
        currentPage: 1,
        pageSize: 1,
        arrayColumnList: []
      };
      if (this.setting.config.dataSource && this.setting.config.dataSource == 'integration') {
        url = '/api/rest/integration/table/data/search';
        uuid = this.setting.config.integrationUuid;
        this.$set(json, 'integrationUuid', this.setting.config.integrationUuid);
      } else {
        url = '/api/rest/matrix/column/data/search/fortable';
        uuid = this.setting.config.matrixUuid;
        this.$set(json, 'matrixUuid', this.setting.config.matrixUuid);
      }
      this.setting.config.dataConfig && this.setting.config.dataConfig.forEach(function(item) {
        if (_this.setting.config.dataSource == 'integration') {
          let isPC = item.hasOwnProperty('isPC') ? item.isPC : true;
          isPC && json.columnList.push(item.uuid);
        } else {
          item.isPC && json.columnList.push(item.uuid);
        }
      });
      this.columnList = this.$utils.deepClone(json.columnList);
      if (json.columnList && json.columnList <= 0) {
        this.tableData.tbodyList = [];
        return false;
      }
     
      //取消正在搜索的请求
      let cancel = this.cancelAxios;
      cancel && (this.cancelAxios = null) && cancel.cancel();

      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      uuid && this.$https.post(url, json, {
        cancelToken: _this.cancelAxios.token
      }).then(res => {
        if (res.Status == 'OK') {
          res.Return.tbodyList = res.Return.tbodyList || [];
          _this.tableData = res.Return;
        }
      });
    }
  },
  filter: {},
  computed: {
    getStyle() {
      let styleJson = {width: this.setting.config.width};
      !this.formView && (styleJson.minHeight = '96px');
      return styleJson;
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
.dynamicList-edit {
  .tstable-container {
    overflow: auto;
    border-top: 0px !important;
    .table-list {
      border-top: none;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .table-list > thead,
    .table-list > thead > tr > th {
      visibility: visible !important;
      border: none !important;
      vertical-align: middle;
      height: 38px;
    }
    .table-list > tbody > tr > td {
      border-left: none !important;
      border-right: none !important;
      border-bottom: none !important;
      border-top: none !important;
      vertical-align: top;
    }
  }
}
</style>

