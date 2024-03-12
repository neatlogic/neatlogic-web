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
            :fixedHeader="false"
            :canEdit="true"
            @changeCurrent="searchCollectionData"
            @changePageSize="changePageSize"
            @checkshow="checkshow"
          >
            <template
              v-for="(value, key) in collectionData.subTheadData"
              :slot="key"
              slot-scope="{ row }"
              style="vertical-align: top"
            >
              <table v-if="row[key] && row[key].length > 0" :key="key" class="table table-color">
                <thead v-if="collectionData.subTheadData[key].length > 0">
                  <tr>
                    <th v-for="(thead, index) in collectionData.subTheadData[key]" :key="index">{{ thead.title }}</th>
                  </tr>
                </thead>
                <thead v-else>
                  <tr>
                    <th>{{ $t('page.value') }}</th>
                  </tr>
                </thead>
                <tbody v-if="collectionData.subTheadData[key].length > 0">
                  <tr v-for="(tbody, tindex) in row[key]" :key="tindex" class="t1">
                    <td v-for="(thead, index) in collectionData.subTheadData[key]" :key="index" style="vertical-align: top">
                      <div v-if="typeof tbody === 'object' && tbody[thead.key]">
                        <div v-if="typeof tbody[thead.key] === 'object'">
                          <JsonViewer v-if="(!Array.isArray(tbody[thead.key]) && Object.keys(tbody[thead.key]).length) || (Array.isArray(tbody[thead.key]) && tbody[thead.key].length > 0)" :show-array-index="false" :value="tbody[thead.key]"></JsonViewer>
                          <div v-else>-</div>
                        </div>
                        <div v-else>{{ tbody[thead.key] }}</div>
                      </div>
                      <div v-else-if="tbody">{{ tbody }}</div>
                      <div v-else>-</div>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr v-for="(tbody, tindex) in row[key]" :key="tindex" class="t2">
                    <td>
                      {{ tbody }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!row[key] || row[key].length == 0" :key="key"></div>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-edit" @click="viewData(row)">{{ $t('page.detail') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close">{{ $t('page.close') }}</Button>
      </template>
    </TsDialog>
    <DiscoveryDataDetail v-if="isDetailShow" :data="currentData" @close="closeDetail"></DiscoveryDataDetail>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    JsonViewer: resolve => require(['vue-json-viewer'], resolve),
    DiscoveryDataDetail: resolve => require(['@/views/pages/cmdb/discovery/discovery-data-detail.vue'], resolve)
  },
  props: {
    collection: { type: String }
  },
  data() {
    return {
      searchParam: { pageSize: 10 },
      collectionData: {},
      isDetailShow: false,
      currentData: null,
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
    closeDetail() {
      this.currentData = null;
      this.isDetailShow = false;
    },
    viewData(row) {
      this.currentData = row;
      this.isDetailShow = true;
    },
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
          this.collectionData.theadList.push({ key: 'action' });
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
/deep/.jv-light {
  background: transparent !important;
}
/deep/.jv-code {
  padding: 0px !important;
}
/deep/.top {
  vertical-align: top !important;
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
