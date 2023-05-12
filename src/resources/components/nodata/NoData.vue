<template>
  <div :class="[className, isVerticalCenter ? 'no-data-vertical-center' : '']">
    <div class="content">
      <div :class="[type === 'small' ? 'small' : '',!isSearchIcon ? 'background-img' : 'search-bg-img']"></div>
      <!-- <img src="../../../resources/assets/images/error/nodata.png" :class="type === 'small' ? 'small' : ''" /> -->
      <p v-if="type === 'small'" class="text-grey"><slot>{{ text }}</slot></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoData',
  props: {
    type: {
      type: String,
      default: 'small'
    },
    text: {
      type: String,
      default() {
        return this.$t('page.nodata');
      }
    },
    className: {
      type: String,
      default: 'nodata' //fullNodata
    },
    isSearchIcon: {
      // 是否是搜索的图标
      type: Boolean,
      default: false
    },
    isVerticalCenter: {
      // 是否水平垂直居中
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  }
};
</script>
<style lang="less" scoped>
.nodata {
  position: relative;
  text-align: center;
  min-height: 190px;  //添加最小高度
  .background-img{
    width: 100%;
    height: 100%;
    &::before{
      content: '';
      height: 90%;
      width: 100%;
      top: 0;
      left: 0;
      position: absolute;
      background: url('~img-module/nodata-default.png') no-repeat center center;
      background-size: auto 100%;
    }
    .theme-dark & {
      &::before{
        background-image: url('~img-module/nodata-dark.png');
      }
    }
  }
  .search-bg-img {
    width: 100%;
    height: 100%;
    &::before{
      content: '';
      height: 90%;
      width: 100%;
      top: 0;
      left: 0;
      position: absolute;
      background: url('~img-module/no-search-result-default.png') no-repeat center center;
      background-size: auto 100%;
    }
    .theme-dark & {
      &::before{
        background-image: url('~img-module/no-search-result-dark.png');
      }
    }
  }
  .small {
    width: 200px;
    max-width: 100%;
  }
  p {
    position: absolute;
    width: 100%;
    text-align: center;
    bottom: 0;
  }
  .content{
    border-top: 0px solid #ccc!important;  //去掉黑线
  }
}
.fullNodata {
  position: absolute;
  top: 180px;
  width: 100%;
  // height: calc(100vh - 56px);
  .content {
    position: absolute;
    top: 40%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
    img {
      margin-top: 50px;
      width: 300px;
    }
  }
}

.no-data-vertical-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    max-height: 190px;
}
</style>
