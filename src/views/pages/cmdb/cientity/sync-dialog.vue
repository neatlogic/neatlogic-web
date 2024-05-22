<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <TsTable
            :multiple="true"
            :fixedHeader="false"
            :theadList="theadList"
            v-bind="syncData"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
            @getSelected="getSelected"
          >
            <template v-slot:ciName="{ row }">
              <span>{{ row.ciLabel }}</span>
              <span class="text-grey">({{ row.ciName }})</span>
            </template>
          </TsTable>
        </div>
      </template>
      <template v-slot:footer>
        <div>
          <TsFormSwitch
            v-model="value"
            @on-change="change"
          ></TsFormSwitch>
          <TsQuartz
            v-model="cronVal"
            :transfer="true"
          ></TsQuartz>
        </div>
        <Button @click="close()">取消</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue')
  },
  props: {
    ciEntityId: { type: Number },
    ciId: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: '自动采集',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      theadList: [
        {
          key: 'selection'
        },
        { key: 'ciName', title: '配置项模型' },
        { key: 'collectionName', title: '集合' },
        { key: 'execCount', title: '执行次数' },
        { key: 'lastSyncDate', title: '上次同步时间', type: 'time' }
      ],
      syncData: {
        keyName: 'id',
        value: [],
        tbodyList: []
      },
      searchParam: { collectMode: 'initiative' }
    };
  },
  beforeCreate() {},
  created() {
    this.getInitiativeSyncList();
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
    getSelected(valueList, selectedList) {
      console.log(selectedList);
    },
    changeCurrent(page) {
      this.searchParam.currentPage = page;
      this.getInitiativeSyncList();
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchParam.currentPage = 1;
      this.getInitiativeSyncList();
    },
    getInitiativeSyncList() {
      this.$api.cmdb.sync.searchSyncCiCollection(this.searchParam).then(res => {
        this.syncData = Object.assign(this.syncData, res.Return);
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
