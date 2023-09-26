<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addService()">{{ $t('term.process.catalog') }}</span>
      </template>
      <template v-slot:topRight>
        <TsRow :gutter="10">
          <Col span="12">
            <!-- <TsFormSelect border="border"></TsFormSelect> -->
          </Col>
          <Col span="12">
            <div class="flex-start">
              <InputSearcher
                v-model="keyword"
                class="pr-sm"
                style="flex: 1;"
                @change="searchService"
              ></InputSearcher>
            </div>
          </Col>
        </TsRow>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="serviceData"
          :theadList="theadList"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template v-slot:name="{row}">
            <div class="text-action" @click="toDetail(row)">{{ row.name }}</div>
          </template>
          <template v-slot:action="{row}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-trash-s" @click="deleteService(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    // TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      keyword: '',
      serviceData: {},
      theadList: [
        { title: this.$t('page.name'), key: 'name'},
        { title: this.$t('page.type'), key: 'type'},
        { title: 'RTO', key: 'recoveryTimeObjective'},
        { title: 'RPO', key: 'recoveryPointObjective'},
        { title: this.$t('page.status'), key: 'status'},
        {key: 'action'}
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchService();
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
    searchService() {
      let data = {
        keyword: this.keyword,
        currentPage: this.serviceData.currentPage,
        pageSize: this.serviceData.pageSize
      };
      this.$api.dr.service.searchService(data).then((res) => {
        if (res.Status === 'OK') {
          this.serviceData = res.Return;
        }
      });
    },
    changeCurrent(currentPage) {
      this.serviceData.currentPage = currentPage;
      this.searchService(); 
    },
    changePageSize(pageSize) {
      this.serviceData.pageSize = pageSize;
      this.searchService(); 
    },
    addService() {
      this.$router.push({
        path: './service-add'
      });
    },
    deleteService(row) {
      if (row.referenceCount) {
        return;
      }
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {'target': row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.dr.service.deleteService({
            id: row.id
          }).then((res) => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.searchService();
            }
          });
        }
      });
    },
    toDetail(row) {
      this.$router.push({
        path: '/service-detail',
        query: { id: row.id }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
