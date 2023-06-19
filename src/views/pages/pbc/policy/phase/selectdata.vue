<template>
  <div>
    <div v-if="result" class="grid">
      <div class="title">{{ $t('term.pbc.batchid') }}：</div>
      <div>{{ result.branchId }}</div>
      <div class="title">{{ $t('page.returncode') }}：</div>
      <div>{{ result.code }}</div>
      <div class="title">{{ $t('term.pbc.message') }}：</div>
      <div>{{ result.msg }}</div>
      <div v-if="result.data && result.data.length > 0" class="title">{{ $t('page.exception') }}：</div>
      <div v-if="result.data && result.data.length>0">
        <TsTable
          :theadList="theadList"
          :tbodyList="result.data"
        >
        </TsTable>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: { phase: { type: Object } },
  data() {
    return {
      theadList: [
        {key: 'code', title: this.$t('term.pbc.errorcode')},
        {key: 'msg', title: this.$t('term.pbc.message')},
        {key: 'facilityCategory', title: this.$t('term.pbc.facilitycategory')},
        {key: 'facilityDescriptor', title: this.$t('term.pbc.facilitydescriptor')}
      ]
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
  methods: {},
  filter: {},
  computed: {
    result() {
      if (this.phase && this.phase.result) {
        try {
          return JSON.parse(this.phase.result);
        } catch (e) {
          return null;
        }
      }
      return null;
    },
    error() {
      if (this.phase && this.phase.error) {
        try {
          return JSON.parse(this.phase.error);
        } catch (e) {
          return null;
        }
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50px auto;
  grid-gap: 10px;
  .title {
    text-align: right;
  }
}
</style>
