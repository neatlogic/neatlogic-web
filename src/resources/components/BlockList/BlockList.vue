
<template>
  <div class="block-list" :style="setmargin(margin)">
    <div v-if="title" class="top-title text-title" :style="setPadding(padding)">
      <slot name="title"></slot>
      <div v-if="$slots.action">
        <slot name="action"></slot>
      </div>
    </div>
    <div class="content-main" :style="setStyle(padding,background)">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {
  },
  props: {
    title: {
      type: [Boolean, String],
      default: true
    },
    padding: {
      type: [String, Number], //small, normal, large
      default: 'normal'
    },
    margin: {
      type: [String, Number, Array], //small, normal, large
      default: 'normal'
    },
    background: {
      type: String,
      default: 'transparent'
    }
  },
  data() {
    return {
      typeList: ['small', 'normal', 'large'],
      spaceList: { large: 24, normal: 16, small: 10 }
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
  computed: {
    setmargin() {
      return function(val) {
        let style = {};
        if (this.typeList.indexOf(val) >= 0) {
          Object.assign(style, {
            margin: `${this.spaceList[val]}px 0`
          });
        } else if (typeof val == 'number') {
          Object.assign(style, {
            margin: `${val}px 0`
          });
        } else if (typeof val == 'object') {
          Object.assign(style, {
            margin: `${val[0]}px ${val[1]}px ${val[2]}px ${val[3]}px`
          });
        }
        return style;
      };
    },
    setPadding() {
      return function(val) {
        let style = {};
        let padding = 0;
        if (this.typeList.indexOf(val) >= 0) {
          padding = `0 ${this.spaceList[val]}px`;
        } else if (typeof val == 'number') {
          padding = `0 ${val}px`;
        }
        if (this.background == 'transparent') {
          Object.assign(style, {
            padding: padding
          });
        } else {
          Object.assign(style, {
            padding: 0
          });
        }
        return style;
      };
    },
    setStyle() {
      return function(val, background) {
        let style = {};
        let padding = 0;
        if (this.typeList.indexOf(val) >= 0) {
          padding = `0 ${this.spaceList[val]}px`;
        } else if (typeof val == 'number') {
          padding = `0 ${val}px`;
        }
        Object.assign(style, {
          background: background,
          padding: padding
        });
        return style;
      };
    }

  },
  watch: {}
};
</script>
<style lang="less" scoped>
.top-title{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  line-height: 20px;
  margin-bottom: 8px;
}
.content-main{
  width: 100%;
  overflow: hidden;
}
</style>
