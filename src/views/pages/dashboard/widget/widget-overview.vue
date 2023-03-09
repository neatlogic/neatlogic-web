<!--仪表板组件 -->
<template>
  <div class="widget-container">
    <div v-if="widgetList && widgetList.length > 0" class="widget-content">
      <div
        v-for="(witem, windex) in widgetList"
        :key="windex"
        class="widget-item"
        style="overflow: hidden;"
        :style="widgetStyle(witem)"
      >
        <div class="bg-grey" style="width:100%;height:100%">
          <span class="text-grey" style="display: flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:1vmax;" :class="getIconByType(witem.type)"></span>
        </div>
      </div>
    </div>
    <table v-else class="empty-tips">
      <tbody>
        <tr>
          <td>{{ $t('page.nodata') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { WIDGETS } from './widget-list.js';

export default {
  name: 'WidgetOverview',
  components: {
  },
  props: {
    widgetList: {type: Array}
  },
  data() {
    return {
      colNum: 12,
      formalHeight: 0,
      rowHeight: 40
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.formalHeight = window.innerHeight;
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getIconByType(type) {
      const w = WIDGETS.find(d => d.type === type);
      if (w) {
        return w.icon;
      }
    }
  },
  filter: {},
  computed: {
    widgetHeight() {
      return function(item) {
        return (100 * item.h * this.rowHeight) / this.formalHeight + '%';
      };
    },
    widgetStyle() {
      return function(item) {
        const styleList = {};
        styleList.left = (100 * item.x) / this.colNum + '%';
        styleList.top = (100 * item.y * this.rowHeight) / this.formalHeight + '%';
        styleList.width = (100 * item.w) / this.colNum + '%';
        styleList.height = (100 * item.h * this.rowHeight) / this.formalHeight + '%';
        return styleList;
      };
    }
  },
  watch: {
  }
};
</script>

<style lang="less" scoped>
.widget-container {
  width: 100%;
  height: 100%;
  overflow: hidden;

  .empty-tips {
    width: 100%;
    height: 100%;
    vertical-align: middle;
    text-align: center;
  }

  .widget-content {
    position: relative;
    width: 100%;
    height: 100%;

    .widget-item {
      position: absolute;
      padding: 2px;
      .widget-block {
        background: #eee;
        display: block;
        width: 100%;
        height: 100%;
        position: relative;

        &:before {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          margin-top: -10px;
          margin-left: -10px;
        }
      }
    }
  }
}
</style>
