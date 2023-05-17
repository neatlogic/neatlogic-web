<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-rotate-right" @click="rebuildAll()">{{ $t('term.cmdb.rebuildallview') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <InputSearcher v-model="keyword"></InputSearcher>
      </template>
      <template v-slot:content>
        <TsTable v-if="tbodyList" :theadList="theadList" :tbodyList="finalTbodyList">
          <template v-slot:status="{ row }">
            <span v-if="row.status === 'FAILURE'" class="text-error">{{ row.status }}</span>
            <span v-if="row.error">
              <Poptip :transfer="true" placement="right" trigger="hover">
                <i class="tsfont-warning-s text-error"></i>
                <div slot="content">
                  {{ row.error }}
                </div>
              </Poptip>
            </span>
            <span v-else-if="row.status === 'SUCCESS'" class="text-success">{{ row.status }}</span>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {},
  data() {
    return {
      keyword: '',
      currentEntityId: null,
      isEditShow: false,
      theadList: [
        {
          key: 'name',
          title: this.$t('term.cmdb.view')
        },
        { key: 'label', title: this.$t('page.name') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'action' }
      ],
      tbodyList: []
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
    rebuildAll() {
      this.$api.framework.databaseview
        .rebuildDatabaesView()
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success('重建完毕');
            this.tbodyList = res.Return.tbodyList;
          }
        });
    }
  },
  filter: {},
  computed: {
    finalTbodyList() {
      if (this.keyword) {
        const k = this.keyword.toLowerCase();
        return this.tbodyList.filter(d => (d.name && d.name.toLowerCase().includes(k)) || (d.label && d.label.toLowerCase().includes(k)));
      }
      return this.tbodyList;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
