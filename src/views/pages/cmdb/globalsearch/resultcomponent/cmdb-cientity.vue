<template>
  <div>
    <TsCard
      v-if="documentData.cardList"
      v-bind="documentData"
      :sm="12"
      :lg="12"
      :xl="12"
      :xxl="12"
    ></TsCard>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: { 
    documentList: { type: Array },
    pageCount: { type: Number },
    rowNum: { type: Number } 
  },
  data() {
    return { documentData: {} };
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
    documentList: {
      handler: function(val) {
        this.documentData.cardList = this.documentList;
        this.documentData.pageCount = this.pageCount;
        this.documentData.rowNum = this.rowNum;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
