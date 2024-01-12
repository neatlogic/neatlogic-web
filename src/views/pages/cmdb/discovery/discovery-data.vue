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
          <NoData v-else></NoData>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    CollectionTypeList: resolve => require(['./collection-type-list.vue'], resolve)
  },
  props: {},
  data() {
    return {
      collectionKeyword: '',
      searchParam: {},
      collectionData: {},
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
