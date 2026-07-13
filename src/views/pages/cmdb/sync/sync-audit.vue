<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>{{ $t('term.cmdb.execlog') }}</div>
      </template>
      <template v-slot>
        <TsTable
          v-if="syncAuditData"
          v-bind="syncAuditData"
          :fixedHeader="false"
          @changeCurrent="searchSyncAudit"
        ></TsTable>
      </template>
      <template v-slot:footer>
        <Button @click="close">{{ $t('page.close') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsTable from '@/resources/components/TsTable/TsTable.vue';

export default {
  name: '',
  components: { TsTable },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      syncAuditData: {},
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      searchParam: {},
      theadList: [{key: 'startTime', title: this.$t('page.starttime'), type: 'time'},
        {key: 'endTime', title: this.$t('page.endtime'), type: 'time'},
        {key: 'inputFromText', title: this.$t('term.cmdb.inputfrom')},
        {key: 'statusText', title: this.$t('page.status')},
        {key: 'transactionCount', title: this.$t('term.cmdb.updatedcientity')}]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchParam.ciCollectionId = this.id;
    this.searchSyncAudit();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchSyncAudit(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.cmdb.sync.searchSyncAudit(this.searchParam).then(res => {
        this.syncAuditData = res.Return;
        this.syncAuditData.theadList = this.theadList;
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
