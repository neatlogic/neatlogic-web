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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {
    attrData: { type: Object }
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
      let tmp = this.attrData;
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
          title: this.$t('page.option'),
          key: 'itemList'
        }
      ];
      return tmp;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
