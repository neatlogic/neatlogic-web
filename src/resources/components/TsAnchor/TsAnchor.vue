<template>
  <div :style="$attrs.style" :class="$attrs.class">
    <div
      v-for="(item, index) in itemList"
      :key="index"
      class="grid cursor"
      @click="click(item)"
    >
      <div class="text-info" :class="{ 'tsfont-dot': currentItem == item[valueName] }" style="position: relative">
        <div class="item border-base-right"></div>
      </div>
      <div class="overflow" :style="currentItem == item[valueName] ? 'font-weight:bold' : ''" :class="{ 'text-primary': currentItem == item[valueName], 'text-grey': currentItem != item[valueName] }">{{ item[textName] }}</div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  inheritAttrs: false,
  props: {
    itemIdPrefix: { type: String, default: '' }, //对象id前缀，最终id是前缀+valueName的值
    itemList: { type: Array },
    textName: { type: String, default: 'name' },
    valueName: { type: String, default: 'id' }
  },
  data() {
    return {
      initData: null,
      currentItem: null,
      observer: null,
      timmer: null,
      config: {
        root: null, // 观察视口
        rootMargin: '-200px 0px', // 视口上下缩小100px
        threshold: 1 // 100% 可见时触发
      }
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.destory();
    if (this.timmer) {
      clearTimeout(this.timmer);
      this.timmer = null;
    }
  },
  destroyed() {},
  methods: {
    callback(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.currentItem = entry.target.id.replace(this.itemIdPrefix, '');
          //console.log('show ', entry.target.id);
        } else {
          //console.log('hide ', entry.target.id);
        }
      });
    },
    click(item) {
      this.currentItem = item[this.valueName];
      this.$emit('click', item);
    },
    destory() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    itemList: {
      handler: function(val) {
        if (this.timmer) {
          clearTimeout(this.timmer);
          this.timmer = null;
        }
        //需要延时一下处理，否则可能取不到组件的id
        this.timmer = setTimeout(() => {
          this.destory();
          if (this.itemList && this.itemList.length > 0) {
            this.observer = new IntersectionObserver(this.callback, this.config);
            this.itemList.forEach(item => {
              const dom = document.getElementById(this.itemIdPrefix + item[this.valueName]);
              if (dom) {
                this.observer.observe(dom);
              }
            });
          }
        }, 1000);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 20px auto;
}
.item {
  position: absolute;
  left: calc(50% - 3px);
  border-width: 2px !important;
  height: 100%;
}
</style>
