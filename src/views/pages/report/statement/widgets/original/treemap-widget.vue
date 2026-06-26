<template>
  <div class="screen-treemap">
    <div ref="container" class="treemap-chart"></div>
  </div>
</template>
<script>
import { Treemap } from '@antv/g2plot';
import { WidgetBase } from '../widget-base.js';
import * as themes from '../../widgetthemes/index.js';

export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {},
  data() {
    return {
      plot: null,
      chartConfig: {
        autoFit: true,
        appendPadding: [14, 14, 42, 14],
        color: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16'],
        legend: { visible: true, position: 'bottom' },
        label: { visible: true },
        drilldown: { enabled: false },
        hierarchyConfig: { tile: 'treemapSquarify' },
        rectStyle: {
          lineWidth: 1,
          stroke: 'rgba(255,255,255,0.65)'
        },
        tooltip: {
          showMarkers: false,
          showTitle: false
        },
        theme: this.canvas.config.theme && themes[this.canvas.config.theme]
      }
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
  methods: {
    createRandomData() {
      this.data = [
        { categoryField: '计算资源', nameField: '虚拟机', valueField: 48 },
        { categoryField: '计算资源', nameField: '容器节点', valueField: 32 },
        { categoryField: '存储资源', nameField: '对象存储', valueField: 36 },
        { categoryField: '存储资源', nameField: '块存储', valueField: 28 },
        { categoryField: '网络资源', nameField: '交换机', valueField: 18 },
        { categoryField: '网络资源', nameField: '防火墙', valueField: 12 }
      ];
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new Treemap(this.$refs.container, {
          ...this.normalizedChartConfig,
          data: this.finalData
        });
        this.plot.render();
      }
    },
    changeData() {
      if (this.plot) {
        this.plot.changeData(this.finalData);
      }
    },
    getSafeNumber(value) {
      const numberValue = Number(value);
      if (Number.isNaN(numberValue) || numberValue < 0) {
        return 0;
      }
      return numberValue;
    },
    buildLeaf(row) {
      const name = row.nameField === undefined || row.nameField === null || row.nameField === '' ? '未命名' : String(row.nameField);
      const category = row.categoryField === undefined || row.categoryField === null || row.categoryField === '' ? '' : String(row.categoryField);
      return {
        name,
        value: this.getSafeNumber(row.valueField),
        categoryField: category || name
      };
    }
  },
  filter: {},
  computed: {
    sourceData() {
      if (this.data && this.data.length > 0) {
        return this.data;
      }
      return [
        { categoryField: '计算资源', nameField: '虚拟机', valueField: 48 },
        { categoryField: '计算资源', nameField: '容器节点', valueField: 32 },
        { categoryField: '存储资源', nameField: '对象存储', valueField: 36 },
        { categoryField: '存储资源', nameField: '块存储', valueField: 28 },
        { categoryField: '网络资源', nameField: '交换机', valueField: 18 },
        { categoryField: '网络资源', nameField: '防火墙', valueField: 12 }
      ];
    },
    hasCategoryField() {
      return this.sourceData.some(item => item.categoryField !== undefined && item.categoryField !== null && item.categoryField !== '');
    },
    finalData() {
      if (this.hasCategoryField) {
        const categoryMap = {};
        this.sourceData.forEach(row => {
          const leaf = this.buildLeaf(row);
          const category = leaf.categoryField || '未分类';
          if (!categoryMap[category]) {
            categoryMap[category] = {
              name: category,
              categoryField: category,
              children: []
            };
          }
          const existLeaf = categoryMap[category].children.find(item => item.name === leaf.name);
          if (existLeaf) {
            existLeaf.value += leaf.value;
          } else {
            categoryMap[category].children.push(leaf);
          }
        });
        return {
          name: 'root',
          children: Object.values(categoryMap)
        };
      }
      const leafList = [];
      this.sourceData.forEach(row => {
        const leaf = this.buildLeaf(row);
        const existLeaf = leafList.find(item => item.name === leaf.name);
        if (existLeaf) {
          existLeaf.value += leaf.value;
        } else {
          leafList.push(leaf);
        }
      });
      return {
        name: 'root',
        children: leafList
      };
    },
    normalizedChartConfig() {
      const config = { ...this.chartConfig };
      const legendPosition = this.chartConfig.legend?.position || 'bottom';
      config.colorField = this.hasCategoryField ? 'categoryField' : 'name';
      if (this.chartConfig.legend?.visible === false) {
        config.appendPadding = [14, 14, 14, 14];
      } else if (legendPosition.indexOf('top') === 0) {
        config.appendPadding = [42, 14, 18, 14];
      } else if (legendPosition.indexOf('bottom') === 0) {
        config.appendPadding = [14, 14, 42, 14];
      } else {
        config.appendPadding = [14, 14, 18, 14];
      }
      config.color = Array.isArray(this.chartConfig.color) && this.chartConfig.color.length > 0
        ? this.chartConfig.color.filter(color => !!color)
        : ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16'];
      config.label = this.chartConfig.label && this.chartConfig.label.visible !== false
        ? {
          fields: ['name'],
          layout: { type: 'limit-in-shape' },
          style: {
            fill: this.chartConfig.label?.style?.fill || '#ffffff',
            fontWeight: 600
          }
        }
        : false;
      config.legend = {
        visible: this.chartConfig.legend?.visible !== false,
        position: legendPosition,
        itemName: {
          style: {
            fill: this.chartConfig.legend?.itemName?.style?.fill || this.getChartTheme()?.labels?.style?.fill || 'rgba(233,251,255,0.86)'
          }
        }
      };
      config.drilldown = {
        enabled: !!this.chartConfig.drilldown?.enabled,
        breadCrumb: {
          position: 'bottom-left',
          rootText: '全部',
          dividerText: '/',
          textStyle: {
            fontSize: 12,
            fill: 'rgba(255,255,255,0.72)',
            cursor: 'pointer'
          },
          activeTextStyle: {
            fill: '#00e5ff'
          }
        }
      };
      return config;
    }
  },
  watch: {}
};
</script>
<style lang="less">
.screen-treemap {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  overflow: hidden;
}
.treemap-chart {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
