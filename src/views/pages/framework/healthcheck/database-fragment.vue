<template>
  <div>
    <TsContain>
      <div slot="topLeft">
        <TsFormRadio
          v-model="searchParam.schemaType"
          :dataList="[
            { value: 'main', text: '核心库' },
            { value: 'data', text: '附属库' }
          ]"
          @change="searchDatabaseFragment()"
        ></TsFormRadio>
      </div>
      <div slot="topRight">
        <InputSearcher
          v-model="searchParam.keyword"
          @change="searchDatabaseFragment()"
        ></InputSearcher>
      </div>
      <div slot="content">
        <TsTable
          :theadList="theadList"
          :sortList="sortList"
          v-bind="databaseFragmentData"
          @changeCurrent="changeCurrent"
          @updateSort="updateSort"
        >
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-rotate-right" @click="rebuild(row)">重建表</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      searchParam: {schemaType: 'main'},
      sortList: ['name', 'dataRows', 'dataSize', 'indexSize', 'dataFree'],
      theadList: [
        { key: 'name', title: '表名' },
        { key: 'engine', title: '引擎' },
        { key: 'dataRows', title: '行数' },
        { key: 'dataSizeText', title: '数据占用空间' },
        { key: 'indexSizeText', title: '索引占用空间' },
        { key: 'dataFreeText', title: '数据空闲空间' },
        { key: 'action', title: '' }
      ],
      databaseFragmentData: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchDatabaseFragment();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    rebuild(row) {
      this.$createDialog({
        title: '执行确认',
        content: '确认重建表：' + row.name + '？',
        'on-ok': async vnode => {
          const res = await this.$api.framework.healthcheck.rebuildTable({schemaType: this.searchParam.schemaType, tableName: row.name});
          this.$Message.success(this.$t('message.content.executesuccess'));
          vnode.isShow = false;
        }
      });
    },
    changeCurrent(currentPage) {
      this.searchDatabaseFragment(currentPage);
    },
    updateSort(sort) {
      this.searchParam.sortConfig = sort;
      this.searchDatabaseFragment();
    },
    searchDatabaseFragment(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.framework.healthcheck.searchDatabaseFragment(this.searchParam).then(res => {
        this.databaseFragmentData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
