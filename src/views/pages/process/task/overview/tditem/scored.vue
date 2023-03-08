<template>
  <div style="height:100%;">
    <CarouseUserList :row="row" :type="type" class="carouse-user-list">
      <div v-if="Object.keys(row.score).length > 0" class="score-container">
        <div>
          <Rate v-model="row.score.value" disabled show-text>
            <span>{{ $t('page.integratedtargetstars',{target:row.score.value}) }}</span>
          </Rate>
        </div>
        <div v-if="row.score.content" class="small text-tip score-content" v-html="row.score.content"></div>
      </div>
    </CarouseUserList>
    
    <CenterExpireStatus v-if="row.expireStatus !== 'no-expired-time'" :row="row"></CenterExpireStatus>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CarouseUserList: resolve => require(['../CarouseUserList.vue'], resolve),
    CenterExpireStatus: resolve => require(['../CenterExpireStatus.vue'], resolve)
  },
  filters: {},
  props: {
    row: Object,
    type: String
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
  methods: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.score-container {
  /deep/.ivu-rate-star.ivu-rate-star-zero {
    display: none;
  }
  /deep/.ivu-rate-star{
    margin-right: 4px;
    font-size: 16px!important;
    line-height: 1.8!important;
  }
  .score-content{
    max-height:30px;
    overflow: auto;
    word-break: break-word;
    white-space: pre-wrap;
  }
}
</style>
