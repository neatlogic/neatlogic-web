<template>
  <TsContain>
    <template slot="topRight">
      <InputSearcher
        v-model="keyword"
        @change="searchList"
      ></InputSearcher>
    </template>
    <div slot="content">
      <div>
        <TsTable v-bind="tabledata" @changeCurrent="changeCurrent" @changePageSize="changePageSize">
          <template slot="name" slot-scope="{row}">
            <div v-html="highlightKeyword(row.name)"></div>
          </template>
          <template slot="token" slot-scope="{row}">
            /api/rest/codehub/<span v-html="highlightKeyword(row.token)"></span>
          </template>
          <template slot="action" slot-scope="{row}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li @click="showapi(row)">
                  <div class="ts-m-problem text-action">{{ $t('page.viewparameters') }}</div>
                </li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
      <ApiDetailDialog
        v-if="showEdit"
        :url="url"
        @close="close"
      ></ApiDetailDialog>
    </div>
  </TsContain>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    ApiDetailDialog: resolve => require(['./api-detail-dialog.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      keyword: '',
      tabledata: {
        hideAction: false,
        pageSize: 20,
        theadList: [{
          title: this.$t('page.name'),
          key: 'name'
        }, {
          title: 'url',
          key: 'token'
        }, {
          key: 'action'
        }],
        tbodyList: []
      },
      showEdit: false,
      url: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchList() {
      this.tabledata.currentPage = 1;
      this.$nextTick(() => {
        this.getList();
      });
    },
    getList() {
      let val = this.keyword || null;
      let _this = this;
      let param = {};
      this.keyword && Object.assign(param, {keyword: this.keyword});
      this.tabledata.pageCount && Object.assign(param, {pageCount: this.tabledata.pageCount});
      this.tabledata.rowNum && Object.assign(param, {rowNum: this.tabledata.rowNum});
      this.tabledata.pageSize && Object.assign(param, {pageSize: this.tabledata.pageSize});
      this.tabledata.currentPage && Object.assign(param, {currentPage: this.tabledata.currentPage});
      this.$api.codehub.api.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this.tabledata, 'pageCount', res.Return.pageCount);
          this.$set(this.tabledata, 'rowNum', res.Return.rowNum);
          this.$set(this.tabledata, 'currentPage', res.Return.currentPage);
          this.$set(this.tabledata, 'pageSize', res.Return.pageSize);
          this.$set(this.tabledata, 'tbodyList', res.Return.apiList);
        } else {
          this.$set(this.tabledata, 'tbodyList', []);
        }
        if (this.tabledata.tbodyList && this.tabledata.tbodyList.length > 0 && val) {
          let list = this.tabledata.tbodyList;
          list.forEach((li, lindex) => {
            let name = li.name;
            let token = li.token;
            _this.$nextTick(() => {
              if (name.indexOf(val) < 0 && token.indexOf(val) < 0) {
                list.splice(lindex, 1);
              }
            });
          });
        }
      });
    },
    showapi(row) {
      let url = row.token;
      this.url = row.type == 'binary' ? 'binary/' + url : url;
      this.showEdit = true;
    },
    close() {
      this.showEdit = false;
      this.url = null;
    },
    changePageSize(size) {
      this.tabledata.pageSize = size;
      this.getList();
    },
    changeCurrent(page) {
      this.tabledata.currentPage = page;
      this.getList();
    }
  },
  filter: {},
  computed: {
    highlightKeyword() {
      return function(val) {
        return val.replace(new RegExp('(' + this.keyword + ')', 'ig'), '<b class="text-primary">$1</b>');
      };
    }
  },
  watch: {}
};
</script>
<style lang='less'>
</style>
