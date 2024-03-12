<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">
          {{ $getFromPage() }}
        </span>
      </template>
      <template v-slot:topRight>
        <div>
          <TsFormInput
            v-model="searchParam.keyword"
            :search="true"
            :placeholder="$t('form.placeholder.pleaseinput', { target: $t('page.keyword') })"
            clearable
            @on-enter="searchCollectionData()"
          ></TsFormInput>
        </div>
      </template>
      <template v-slot:sider>
        <CollectionTypeList
          :currentCollection="searchParam.collection"
          @change="
            (collectionType, collectionName) => {
              changeCollection(collectionName);
            }
          "
        ></CollectionTypeList>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            v-if="collectionData.tbodyList && collectionData.tbodyList.length > 0"
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
          <NoData v-else></NoData>
        </div>
      </template>
    </TsContain>
    <DiscoveryDataDetail v-if="isDetailShow" :data="currentData" @close="closeDetail"></DiscoveryDataDetail>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    CollectionTypeList: resolve => require(['./collection-type-list.vue'], resolve),
    DiscoveryDataDetail: resolve => require(['./discovery-data-detail.vue'], resolve),
    JsonViewer: resolve => require(['vue-json-viewer'], resolve)
  },
  props: {},
  data() {
    return {
      collectionKeyword: '',
      searchParam: {},
      isDetailShow: false,
      collectionData: {},
      currentData: null,
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: true,
        width: 'large'
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchParam.collection = this.$route.params['collection'] || '';
  },
  beforeMount() {},
  mounted() {
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
    changeCollection(collectionName) {
      if (this.searchParam.collection != collectionName) {
        this.searchParam.collection = collectionName;
        this.searchCollectionData(1);
      }
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
        this.collectionData.theadList.push({ key: 'action' });
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
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/theme.less';
.table td {
  padding: 5px !important;
  font-size: 12px;
  border-width: 1px;
  border-style: solid;
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
