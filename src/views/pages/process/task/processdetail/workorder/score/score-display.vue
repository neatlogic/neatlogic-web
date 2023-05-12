<template>
  <div class="score-display">
    <!-- 工单中心右侧设置的评分信息 -->
    <ul>
      <li v-for="(item, index) in scoreConfig.dimensionList" :key="index" class="dimension-item">
        <div class="dimension-name overflow">
          <Tooltip
            v-if="item.description"
            offset="-11px"
            theme="light"
            transfer
            max-width="300px"
            placement="top-start"
            class="tooltip"
          >
            <i class="text-tip tip tsfont-info-o"></i>
            <div slot="content" class="tooltip-content">{{ item.description }}</div>
          </Tooltip>
          <span class="text-grey" :title="item.name">{{ item.name }}</span>
        </div>
        <div class="dimension-score">
          <Rate :value="item.score" disabled />
        </div>
      </li>
    </ul>
    <div class="score-comment">
      <div class="score-title text-grey">{{ $t('page.valuation') }}</div>
      <div class="score-content" v-html="scoreConfig.content"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScoreDisplay',
  props: {
    scoreConfig: { type: Object, required: true}
  }
};
</script>

<style lang="less" scoped>
.score-display {
	.dimension-item {
    display: flex;
    align-items: center;
  }
  .dimension-name {
    width: 72px;
    text-align: right;
    font-size: 12px;
    .tip {
      padding-right: 6px;
    }
  }
  .dimension-score {
    transform: translateY(-1px);
    padding-left: 16px;
  }
  .score-comment {
    display: flex;
    align-items: flex-start;
    margin-top: 10px;
    overflow: auto;
    .score-title {
      font-size: 12px;
      min-width: 72px;
      text-align: right;
    }
    .score-content{
      padding-left: 16px;
    }
    /deep/ .image > img {
      max-width: 100%;
    }
  }
}
/deep/.ivu-rate-star{
  margin-right: 6px;
}
</style>
