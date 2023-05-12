<template>
  <div>
    <TsContain border="border">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/statement-manage')">{{ $getFromPage($t('term.report.screenmanage')) }}</span>
      </template>
      <template v-slot:topLeft><span>{{ reportData.name }}</span></template>
      <template slot="topRight">
        <div class="action-group">
          <span class="action-item ts-fullscreen" @click="fullscreen">{{ $t('page.fullscreen') }}</span>
          <span v-auth="['REPORT_STATEMENT_MODIFY']" class="action-item tsfont-edit" @click="editReport()">{{ $t('page.edit') }}</span>
        </div>
      </template>
      <div slot="content" class="pl-md pr-md">
        <div ref="canvasContainer" class="bg-block radius-md canvasContainer">
          <div class="canvas-background" :style="{'background': reportData.config.backgroundColor, 'background-size': reportData.config.backgroundImageLayout == 'resize' ? '100% 100%' : 'auto', 'background-image': 'url(' + reportData.config.backgroundImage + ')', position: 'absolute', top: canvasY + 'px', left: canvasX + 'px', height: reportData.height + 'px', width: reportData.width + 'px' }"></div>
          <div
            ref="canvas"
            class="canvas"
            :class="canvasClass"
            :style="{ position: 'absolute', top: canvasY + 'px', left: canvasX + 'px', height: reportData.height + 'px', width: reportData.width + 'px' }"
            @drop="drop"
            @dragover.prevent
            @mousemove="onMove"
            @mouseup="stopMove"
            @mouseleave="stopMove"
            @mousedown="startGrab"
          >
            <Widget
              v-for="widget in reportData.widgetList"
              ref="widgetHandler"
              :key="widget.uuid"
              :canvas="reportData"
              :widget="widget"
              mode="read"
              :widgetComponent="getWidgetComponentByType(widget)"
            />
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
import { WIDGETS } from './widgets/widget-list.js';
import screenfull from '@/resources/assets/js/screenfull.js';

export default {
  name: '',
  components: {
    Widget: resolve => require(['./widgets/widget-handler.vue'], resolve)
  },
  props: {},
  data() {
    return {
      id: this.$route.params['id'],
      layoutFormConfig: {
        x: {
          type: 'number',
          label: this.$t('term.report.axis.xcoordinate')
        },
        y: {
          type: 'number',
          label: this.$t('term.report.axis.ycoordinate')
        },
        width: {
          type: 'number',
          label: this.$t('page.width')
        },
        height: {
          type: 'number',
          label: this.$t('page.height')
        }
      },
      dataFormConfig: {
        dataType: {
          type: 'slot',
          label: this.$t('term.report.datatype.name')
        },
        config: {
          type: 'slot',
          hideLabel: true
        }
      },
      isGrabbing: false, //是否正在抓取画布
      presetLine: [
        { type: 'l', site: 100 },
        { type: 'v', site: 200 }
      ],
      currentWidget: null,
      mouseX: 0,
      mouseY: 0,
      canvasX: 0,
      canvasY: 0,
      containerWidth: null,
      containerHeight: null,
      isShowGrid: false,
      reportData: { name: '', config: { width: 1920, height: 1080, widgetList: [] } },
      widgetList: WIDGETS,
      datasourceFieldList: []
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.getReportById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editReport() {
      this.$router.push({path: '/statement-edit/' + this.id});
    },
    fullscreen() {
      let fullDiv = this.$refs.canvasContainer;
      if (screenfull.isEnabled) {
        screenfull.request(fullDiv);
      } 
    },
    getReportById() {
      if (this.id) {
        this.$api.report.statement.getStatementById(this.id).then(res => {
          this.reportData = res.Return;
        });
      }
    },
    getCurrentWidgetField(fieldName) {
      if (this.currentWidget && this.currentWidget.fields) {
        return this.currentWidget.fields.find(d => d.name === fieldName);
      }
      return null;
    },
    setCurrentWidgetField(fieldName, prop, val) {
      if (this.currentWidget) {
        if (!this.currentWidget.fields) {
          this.currentWidget.fields = [];
        }
        const field = this.currentWidget.fields.find(d => d.name === fieldName);
        if (field) {
          this.$set(field, prop, val);
        } else {
          const f = { name: fieldName };
          f[prop] = val;
          this.currentWidget.fields.push(f);
        }
      }
    },
    getWidgetComponentByType(widget) {
      return WIDGETS.find(d => d.type === widget.type);
    },
    startGrab(event) {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
      if (event.target && event.target.className == 'canvas') {
        this.isGrabbing = true;
        const canvasContainer = this.$refs['canvasContainer'];
        const rect = canvasContainer.getBoundingClientRect();
        this.containerWidth = rect.width;
        this.containerHeight = rect.height;
        this.isShowGrid = true;
      } 
    },
    stopMove() {
      if (!this.isGrabbing) {
        if (this.reportData.widgetList && this.reportData.widgetList.length > 0) {
          this.reportData.widgetList.forEach(element => {
            if (element.dragging) {
              this.$set(element, 'dragging', false);
            }
            if (element.resizing) {
              this.$set(element, 'resizing', false);
            }
          });
        }
      } else {
        this.isGrabbing = false;
      }
      this.isShowGrid = false;
    },
    onMove(event) {
      const x = event.clientX;
      const y = event.clientY;
      const dx = x - this.mouseX;
      const dy = y - this.mouseY;
      if (this.isGrabbing) {
        this.canvasX = this.canvasX + dx;
        this.canvasY = this.canvasY + dy;
        if (this.canvasX >= 0) {
          this.canvasX = 0;
        } else if (this.containerWidth && this.containerWidth - this.reportData.width >= this.canvasX) {
          this.canvasX = this.canvasX = this.containerWidth - this.reportData.width;
        }
        if (this.canvasY >= 0) {
          this.canvasY = 0;
        } else if (this.containerHeight && this.containerHeight - this.reportData.height >= this.canvasY) {
          this.canvasY = this.containerHeight - this.reportData.height;
        }
      } 
      this.mouseX = x;
      this.mouseY = y;
    },
    startDrag(event, data) {
      event.dataTransfer.setData('widget', JSON.stringify(data));
    },
    drop(event) {
      let widget = event.dataTransfer.getData('widget');
      if (widget) {
        widget = JSON.parse(widget);
        this.addWidget(widget, event.offsetX, event.offsetY);
      }
    },
    addWidget(widget, x, y) {
      const newWidget = { type: widget.type, width: widget.width, height: widget.height };
      newWidget.x = x;
      newWidget.y = y;
      newWidget.zindex = 1000; //默认1000，给上移下移留下空间
      if (widget.dataTypes) {
        if (widget.dataTypes.length == 1) {
          newWidget.dataType = widget.dataTypes[0].value;
        }
      }
      newWidget.uuid = this.$utils.setUuid(); //前端使用uuid作为唯一标识
      this.reportData.widgetList.push(newWidget);
    },
    deleteReport() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.report.report')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.report.statement.deleteStatement(this.id).then(res => {
            vnode.isShow = false;
            this.$back('/statement-manage');
          });
        }
      });
    }
  },
  filter: {},
  computed: {
    currentWidgetComponent() {
      if (this.currentWidget) {
        return WIDGETS.find(d => d.type === this.currentWidget.type);
      }
      return {};
    },
    dataTypeList() {
      const dataTypeList = [
        { value: 'static', text: this.$t('term.report.datatype.staticdata') },
        { value: 'dynamic', text: this.$t('term.report.datatype.dynamicdata') }
      ];
      if (this.currentWidget && this.currentWidget.dataType && this.currentWidget.dataType.length > 0) {
        return dataTypeList.filter(d => this.currentWidget.dataType.includes(d.value));
      }
      return [];
    },
    canvasClass() {
      let c = '';
      if (this.isGrabbing) {
        c += 'grabbing';
      }
      if (this.isShowGrid) {
        c += ' grid';
      }
      return c;
    }
  },
  watch: {
    currentWidget: {
      handler(val) {
        //由于tsForm修改了以后的对象和原来对象实例已经不一样了，所以根据uuid判断对象实例是否一样，如果不一样则用object.assign重设所有属性回原对象
        if (val) {
          this.reportData.widgetList.forEach(element => {
            if (element.uuid === val.uuid && element !== val) {
              Object.assign(element, val);
            }
          });
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.canvasContainer {
  height: calc(100vh - 120px) !important;
  position: relative;
  overflow: hidden;
}
.canvas-background {
  z-index: 40;
}
.canvas {
  cursor: grab;
}
.canvas.grid {
  background: radial-gradient(circle, #5a5a5a 0.5px, transparent 0.5px);
  background-size: 10px 10px;
}
.grabbing {
  cursor: grabbing !important;
}
.ruler {
  width: 100%;
  height: 100%;
}
</style>
