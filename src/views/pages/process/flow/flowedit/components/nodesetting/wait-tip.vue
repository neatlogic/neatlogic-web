<template>
  <div v-if="dataList">
    <div class="tstable-container">
      <div class="tstable-main">
        <table class="tstable-body">
          <tbody>
            <tr v-for="(item,index) in transData" :key="index">
              <td v-if="type == 'input'" width="75" class="padding-left0">
                <div class="overflow text-tip">{{ inputColumns[index] }}</div>
              </td>
              <td v-if="type == 'output'" width="75" class="padding-left0">
                <div class="overflow text-tip">{{ outputColumns[index] }}</div>
              </td>
              <td v-for="(i,sindex) in item" :key="sindex">
                <div class="overflow" style="width:90px" :title="i">{{ i }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
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
      transData: []
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
<style lang='less' scoped>
.tstable-container{
  border-radius: 0 !important;
  tr{
    &:hover{
      background: transparent !important;
    }
  }
}
.padding-left0{
  padding-left: 0 !important;
}
</style>
