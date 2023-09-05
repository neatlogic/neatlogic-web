<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus">服务</span>
      </template>
      <template v-slot:topRight>
        <TsRow :gutter="10">
          <Col span="12">
            <TsFormSelect border="border"></TsFormSelect>
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
          v-bind="tableConfig"
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
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      keyword: '',
      tableConfig: {
        theadList: [
          { title: this.$t('page.name'), key: 'name'},
          { title: this.$t('page.type'), key: 'type'},
          { title: 'RTO', key: 'RTO'},
          { title: 'RPO', key: 'RPO'},
          { title: this.$t('page.status'), key: 'status'},
          {key: 'action'}
        ],
        tbodyList: [
          {name: '测试'}
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchService() {},
    deleteService(row) {},
    toDetail(row) {
      this.$router.push({
        path: '/service-detail'
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
