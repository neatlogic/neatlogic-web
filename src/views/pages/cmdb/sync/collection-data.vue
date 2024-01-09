<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <div style="text-align:right" class="mb-md">
            <TsFormInput
              v-model="searchParam.keyword"
              search
              :placeholder="$t('page.keyword')"
              clearable
              width="300px"
              :hideAction="false"
              @on-enter="searchCollectionData()"
              @on-clear="searchCollectionData()"
            ></TsFormInput>
          </div>
          <TsTable
            v-if="collectionData"
            v-bind="collectionData"
            :canEdit="true"
            @changeCurrent="searchCollectionData"
            @changePageSize="changePageSize"
            @checkshow="checkshow"
          >
            <template
              v-for="(value, key) in collectionData.subTheadData"
              :slot="key"
              slot-scope="{ row }"
              style="vertical-align:top"
            >
              <table v-if="row[key] && row[key].length > 0" :key="key" class="table table-color">
                <thead v-if="collectionData.subTheadData[key].length > 1">
                  <!--表头超过一个值代表是对象类型-->
                  <tr>
                    <th v-for="(thead, index) in collectionData.subTheadData[key]" :key="index">{{ thead.title }}</th>
                  </tr>
                </thead>
                <tbody v-if="collectionData.subTheadData[key].length > 1 || (collectionData.subTheadData[key].length == 1 && collectionData.subTheadData[key][0]['key'])">
                  <tr v-for="(tbody, tindex) in row[key]" :key="tindex" class="t1">
                    <td v-for="(thead, index) in collectionData.subTheadData[key]" :key="index">
                      {{ tbody[thead.key] || '-' }}
                    </td>
                  </tr>
                </tbody>
                <tbody v-else-if="collectionData.subTheadData[key].length == 1 && !collectionData.subTheadData[key][0]['key']">
                  <tr v-for="(tbody, tindex) in row[key]" :key="tindex" class="t2">
                    <td>
                      {{ tbody }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!row[key] || row[key].length == 0" :key="key"></div>
            </template>
          </TsTable>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close">{{ $t('page.close') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    collection: { type: String }
  },
  data() {
    return {
      searchParam: { pageSize: 10 },
      collectionData: {},
      dialogConfig: {
        title: this.$t('term.cmdb.collectiondata'),
        type: 'modal',
        maskClose: true,
        isShow: true,
        width: 'large'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchParam.collection = this.collection;
    this.searchCollectionData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    checkshow(theadList, val) {
      this.$set(this.collectionData, 'theadList', theadList);
    },
    searchCollectionData(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.cmdb.sync.searchCollectionData(this.searchParam).then(res => {
        this.collectionData = res.Return;
        this.collectionData.theadList.forEach(element => {
          //默认隐藏复杂属性，避免表格内容过多
          if (this.collectionData.subTheadData && this.collectionData.subTheadData[element.key]) {
            element.isShow = 0;
          } else {
            element.isShow = 1;
          }
        });
      });
    },
    changePageSize(pageSize) {
      if (pageSize) {
        this.searchParam.pageSize = pageSize;
      } else {
        this.searchParam.pageSize = 10;
      }
      this.searchCollectionData();
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    subTableData() {
      return (theadList, tbodyList) => {
        const data = {};
        data['theadList'] = theadList;
        data['tbodyList'] = tbodyList;
        return data;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scope>
@import (reference) '~@/resources/assets/css/theme.less';
.top {
  vertical-align: top;
}
.table td {
  padding: 5px !important;
  font-size: 12px;
  border-width: 1px;
  border-style: solid;
}
.table th {
  padding: 5px !important;
  font-size: 12px;
  height: auto !important;
  border: 1px solid @border-color-base !important;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
</style>
