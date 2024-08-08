<template>
  <div :style="{ width: size + 'px', height: size + 'px' }" style="display:inline-block">
    <div class="loading">
      <div class="loading-circle" :style="{ width: size + 'px', height: size + 'px' }"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    size: {
      type: Number,
      default: 20
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@border-color, @primary-color) {
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: transparent;
    z-index: 1000;
  }

  .loading-circle {
    border: 2px solid @border-color;
    border-top: 2px solid @primary-color;
    border-right: 2px solid @primary-color;
    //border-bottom: 2px solid @primary-color;
    border-radius: 50%;
    animation: spin 3s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}

html {
  .theme(@default-bg-grey, @default-primary-color);
  &.theme-dark {
    .theme(@dark-bg-grey, @dark-primary-color);
  }
}
</style>
