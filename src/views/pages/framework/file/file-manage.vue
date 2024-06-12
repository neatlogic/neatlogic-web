<template>
  <div>
    <TsContain>
      <template v-slot:topRight>
        <CombineSearcher v-model="searchParam" v-bind="searchConfig" @change="searchFile(1)"></CombineSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          v-if="fileData"
          v-bind="fileData"
          :theadList="theadList"
          :sortList="['uploadTime', 'size']"
          :sortOrder="sortOrder"
          @updateSort="updateSort"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:size="{ row }">
            {{ row.sizeText }}
          </template>
          <template v-slot:name="{ row }">
            <span v-download="downurl('/api/binary/file/download', row.id)" class="text-href">{{ row.name }}</span>
          </template>
        </TsTable>
      </template>
    </TsContain>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';

export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue')
  },
  directives: { download },
  props: {},
  data() {
    return {
      sortConfig: {},
      searchParam: {
        keyword: ''
      },
      searchConfig: {
        labelWidth: 100,
        searchList: [
          {
            type: 'select',
            name: 'type',
            label: this.$t('page.type'),
            transfer: true,
            dynamicUrl: 'api/rest/file/type/list',
            valueName: 'name',
            textName: 'displayName'
          },
          {
            type: 'timeselect',
            name: 'uploadTimeRange',
            label: this.$t('page.timerange'),
            transfer: true
          }
        ]
      },
      theadList: [
        { key: 'id', title: '#' },
        { key: 'name', title: this.$t('page.name') },
        { key: 'typeText', title: this.$t('page.type') },
        { key: 'size', title: this.$t('page.size') },
        { key: 'userUuid', title: this.$t('page.uploaduser'), type: 'user' },
        { key: 'uploadTime', title: this.$t('page.uploadtime'), type: 'time' }
      ],
      fileData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.searchFile(1);
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updateSort(sort) {
      this.sortConfig = {};
      Object.assign(this.sortConfig, sort);
      this.searchFile(1);
    },
    changePage(currentPage) {
      this.searchFile(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchFile(1);
    },
    searchFile(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.searchParam.sortList = this.sortList;
      this.$api.framework.file.searchFile(this.searchParam).then(res => {
        this.fileData = res.Return;
      });
    }
  },
  filter: {},
  computed: {
    sortOrder() {
      //把{"attr_xxx":"DESC","attr_yyy":"AEC"}转换成[{"attr_xxx":"DESC"},{"attr_yyy":"ASC"}]
      const returnList = [];
      if (!this.$utils.isEmpty(this.sortConfig)) {
        for (let k in this.sortConfig) {
          const obj = {};
          obj[k] = this.sortConfig[k];
          returnList.push(obj);
        }
      }
      return returnList;
    },
    //转换成后端需要的数据结构，把{"attr_xxx":"DESC","attr_yyy":"AEC"}转换成[{key:"attr_xxx",type:"DESC"},{key:"attr_yyy",type:"ASC"}]
    sortList() {
      const returnList = [];
      if (!this.$utils.isEmpty(this.sortConfig)) {
        for (let k in this.sortConfig) {
          const obj = {};
          obj['key'] = k;
          obj['type'] = this.sortConfig[k];
          returnList.push(obj);
        }
      }
      return returnList;
    },
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
