<template>
  <!--<div v-if="dataList">
    <div class="tstable-container">
      <div class="tstable-main">
        <table class="tstable-body">
          <tbody>
            <tr v-for="(item, index) in transData" :key="index">
              <td v-if="type == 'input'" width="75" class="padding-left0">
                <div class="overflow text-tip">{{ inputColumns[index] }}</div>
              </td>
              <td v-if="type == 'output'" width="75" class="padding-left0">
                <div class="overflow text-tip">{{ outputColumns[index] }}</div>
              </td>
              <td v-for="(i, sindex) in item" :key="sindex">
                <div class="overflow" style="width: 90px" :title="i">{{ i }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>-->
  <div>
    <TsTable
      v-if="dataList"
      :fixedHeader="false"
      border="false"
      :tbodyList="dataList"
      :theadList="theadList"
    ><template v-slot:isRequired="{ row }">
      <span v-if="row.isRequired" class="text-success">是</span>
      <span v-else class="text-grey">否</span>
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
    dataList: Array,
    type: {
      type: String,
      default: 'input'
    }
  },
  data() {
    return {
      inputColumns: [this.$t('page.name'), this.$t('page.type'), this.$t('page.isrequired'), this.$t('page.explain')],
      outputColumns: [this.$t('page.name'), this.$t('page.type'), this.$t('page.explain')],
      transData: [],
      theadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'typeText', title: this.$t('page.type') },
        { key: 'isRequired', title: this.$t('page.require') },
        { key: 'description', title: this.$t('page.explain') }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.type === 'output') {
      const index = this.theadList.findIndex(d => d.key === 'isRequired');
      if (index > -1) {
        this.theadList.splice(index, 1);
      }
    }
  },
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
  computed: {},
  watch: {
    dataList: {
      handler(val) {
        if (val) {
          let newDataList = [];
          let nameList = [];
          let typeList = [];
          let isRequiredList = [];
          let descriptionList = [];
          this.dataList.forEach(e => {
            if (e.name) {
              nameList.push(e.name);
            }
            if (e.type) {
              typeList.push(e.type);
            }
            if (e.isRequired) {
              isRequiredList.push(e.isRequired);
            }
            if (e.description) {
              descriptionList.push(e.description);
            }
          });
          if (nameList.length > 0) {
            newDataList.push(nameList);
          }
          if (typeList.length > 0) {
            newDataList.push(typeList);
          }
          if (isRequiredList.length > 0) {
            newDataList.push(isRequiredList);
          }
          if (descriptionList.length > 0) {
            newDataList.push(descriptionList);
          }
          this.transData = newDataList;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.tstable-container {
  border-radius: 0 !important;
  tr {
    &:hover {
      background: transparent !important;
    }
  }
}
.padding-left0 {
  padding-left: 0 !important;
}
</style>
