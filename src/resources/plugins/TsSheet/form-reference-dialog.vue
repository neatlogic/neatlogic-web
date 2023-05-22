<template>
  <TsDialog
    type="modal"
    :isShow="true"
    :hasFooter="false"
    maskClose
    :title="$t('page.referencelist')"
    @on-close="close"
  >
    <template v-slot>
      <Loading :loading-show="loadingShow" type="fix"></Loading>
      <TsCard
        v-if="!loadingShow"
        v-bind="cardData"
        :sm="8"
        :lg="8"
        :xl="8"
        :xxl="8"
        classname="overvivew-main"
        :boxShadow="false"
        @updatePage="quoteList"
      >
        <template slot-scope="{ row }">
          <div class="line-2" v-html="row.text"></div>
        </template>
      </TsCard>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard'], resolve)
  },
  props: {
    formUuid: String
  },
  data() {
    return {
      loadingShow: false,
      cardData: {
        cardList: [],
        currentPage: 1,
        pageSize: 9,
        pageCount: 1
      }
    };
  },
  beforeCreate() {},
  created() {
    this.quoteList(1);
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
    quoteList(currentPage) {
      //引用列表
      let data = {
        calleeType: 'form',
        uuid: this.formUuid
      };
      if (currentPage) {
        this.$set(data, 'currentPage', currentPage);
      }
      this.loadingShow = true;
      this.$api.framework.form.referenceData(data).then(res => {
        if (res.Status == 'OK') {
          let dataConfig = res.Return;
          Object.assign(this.cardData, dataConfig);
          this.$set(this.cardData, 'cardList', dataConfig.list);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
