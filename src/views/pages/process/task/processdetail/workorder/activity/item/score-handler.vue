<template>
  <div class="score">
    <ul>
      <li v-for="(dimension, dimensionIndex) in setData(config.newContent).dimensionList" :key="dimensionIndex" class="dimension-item">
        <div class="dimension-name">
          <Tooltip
            v-if="dimension.description"
            offset="-11px"
            theme="light"
            transfer
            max-width="300px"
            placement="top-start"
            class="tooltip"
          >
            <i class="tip tsfont-info-o text-grey"></i>
            <div slot="content" class="tooltip-content">{{ dimension.description }}</div>
          </Tooltip>
          <span class="name">{{ dimension.name }}</span>
        </div>
        <div class="dimension-score">
          <Rate :value="dimension.score" disabled />
        </div>
      </li>
    </ul>
    <div class="score-comment">
      <div class="score-title">{{ $t('page.valuation') }}：</div>
      <div class="score-content" v-html="setData(config.newContent).content"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    
  },
  filters: {},
  props: {
    config: Object
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
    setData(str) {
      let data = JSON.parse(str);
      return data;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
.score {
  .dimension-item {
    display: flex;
    align-items: center;
  }
  .dimension-name {
    width: 120px;
    .name{
      padding-left: 6px;
    }
  }
  .dimension-score {
    transform: translateY(-1px);
  }
  .score-comment {
    display: flex;
    align-items: flex-start;
    margin-top: 10px;
    .score-title {
      min-width: 50px;
    }
    .score-content {
      overflow: auto;
    }
  }
}
</style>
