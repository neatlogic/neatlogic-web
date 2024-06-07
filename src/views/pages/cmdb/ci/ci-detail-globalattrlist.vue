<template>
  <div>
    <TsTable
      v-if="attrDataList"
      v-bind="attrDataList"
      :showSizer="false"
      :hideAction="false"
      :showTotal="false"
      :fixedHeader="false"
    >
      <template v-slot:itemList="{ row }">
        <div v-if="row.itemList && row.itemList.length > 0">
          <Tag v-for="(item,index) in row.itemList" :key="index">{{ item.value }}</Tag>
        </div>
      </template>
    </TsTable>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    attrData: { type: Array }
  },
  data() {
    return {};
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
  },
  filter: {},
  computed: {
    attrDataList: function() {
      let tmp = {};
      tmp.theadList = [
        {
          title: this.$t('page.uniquekey'),
          key: 'name'
        },
        {
          title: this.$t('page.name'),
          key: 'label'
        },
        {
          title: this.$t('page.alias'),
          key: 'alias'
        },
        {
          title: this.$t('page.option'),
          key: 'itemList'
        }
      ];
      tmp.tbodyList = this.attrData;
      return tmp;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
