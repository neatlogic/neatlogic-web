<template>
  <div
    :style="{
      position: 'absolute',
      left: left + 'px',
      top: top + 'px',
      width: widget.width + 'px',
      height: widget.height + 'px',
      'z-index':zindex
    }"
    :class="widget._selected ? 'selected' : (widget._aligned?'aligned':'')"
    @mousedown="startDrag"
  >
    <div :style="{position:'relative',width:'100%',height:'100%', padding:widget.padding+'px'}">
      <div v-if="mode == 'edit' && widget._selected" class="config-btn">
        <Dropdown>
          <a href="javascript:void(0)" class="text-href tsfont-option-horizontal">
          </a>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="moveTop">{{ $t('term.report.movetop') }}</DropdownItem>
            <DropdownItem @click.native="moveUp">{{ $t('term.report.moveup') }}</DropdownItem>
            <DropdownItem @click.native="moveDown">{{ $t('term.report.movedown') }}</DropdownItem>
            <DropdownItem @click.native="moveFloor">{{ $t('term.report.movefloor') }}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div v-if="mode == 'edit' && widget._selected" class="remove-btn" @click="removeWidget"><i class="text-href tsfont-trash-o"></i></div>
      <div v-if="mode == 'edit' && widget._selected" class="position-label text-info">{{ left }},{{ top }}</div>
      <div v-if="mode == 'edit' && widget._selected" class="top-width-label text-info">{{ widget.width }}px</div>
      <div v-if="mode == 'edit' && widget._selected" class="left-height-label text-info">{{ widget.height }}px</div>
      <div
        v-if="mode == 'edit' && widget._selected"
        class="bg-info anchor anchor-top-left"
        @mousedown="
          event => {
            startResize(event, 'wn');
          }
        "
      ></div>
      <div
        v-if="mode == 'edit' && widget._selected"
        class="bg-info anchor anchor-top-middle"
        @mousedown="
          event => {
            startResize(event, 'n');
          }
        "
      ></div>
      <div
        v-if="mode == 'edit' && widget._selected"
        class="bg-info anchor anchor-top-right"
        @mousedown="
          event => {
            startResize(event, 'en');
          }
        "
      ></div>
      <div
        v-if="mode == 'edit' && widget._selected"
        class="bg-info anchor anchor-middle-left"
        @mousedown="
          event => {
            startResize(event, 'w');
          }
        "
      ></div>
      <div
        v-if="mode == 'edit' && widget._selected"
        class="bg-info anchor anchor-middle-right"
        @mousedown="
          event => {
            startResize(event, 'e');
          }
        "
      ></div>
      <div
        v-if="mode == 'edit' && widget._selected"
        class="bg-info anchor anchor-bottom-left"
        @mousedown="
          event => {
            startResize(event, 'ws');
          }
        "
      ></div>
      <div
        v-if="mode == 'edit' && widget._selected"
        class="bg-info anchor anchor-bottom-middle"
        @mousedown="
          event => {
            startResize(event, 's');
          }
        "
      ></div>
      <div
        v-if="mode == 'edit' && widget._selected"
        class="bg-info anchor anchor-bottom-right"
        @mousedown="
          event => {
            startResize(event, 'es');
          }
        "
      ></div>
      <div v-if="widget.border" class="widget-border">
        <WidgetBorder
          :type="widget.border"
          :config="widget.borderConfig||getBorderComponentConfigByName(widget.border)"
          :style="{
            position:'absolute',
            top:'0px',
            left:'0px',
            'z-index':-1,
            width: (widget.width) + 'px',
            height: (widget.height) + 'px'
          }"
        ></WidgetBorder>
      </div>
      <div>
        <component
          :is="widget.type + 'widget'"
          ref="widget"
          :class="mode == 'edit'?'widget':''"
          :widget="widget"
          :mode="mode"
          :canvas="canvas"
          :widgetComponent="widgetComponent"
          :width="widget.width - 2 - widget.padding * 2"
          :height="widget.height - 2 - widget.padding * 2"
          :style="{
            width: (widget.width - 2 - widget.padding * 2) + 'px',
            height: (widget.height - 2 - widget.padding * 2) + 'px',
            overflow: 'auto'
          }"
        ></component>
      </div>
    </div>
  </div>
</template>
<script>
import * as handlers from './index.js';
import { BORDER_LIST } from '../widgetborders/border-list.js';
export default {
  name: '',
  components: {
    ...handlers,
    WidgetBorder: () => import('../widgetborders/widget-border.vue')
  },
  props: {
    mode: { type: String, default: 'edit' }, //模式:edit或read
    canvas: {type: Object}, //报表定义
    widget: { type: Object }, //组件定义
    widgetComponent: { type: Object }, //组件配置
    alignX: {type: Number},
    alignY: {type: Number}
  },
  data() {
    return {
      isDragging: false,
      currentDirection: '',
      offsetX: 0,
      offsetY: 0,
      left: 0,
      top: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getBorderComponentConfigByName(borderName) {
      const b = BORDER_LIST.find(d => d.name === borderName);
      if (b) {
        return b.config;
      }
      return null;
    },
    moveTop() {
      if (this.widget) {
        this.$emit('movetop', this.widget);
      }
    },
    moveFloor() {
      if (this.widget) {
        this.$emit('movefloor', this.widget);
      }
    },
    moveUp() {
      if (this.widget) {
        this.$emit('moveup', this.widget);
      }
    },
    moveDown() {
      if (this.widget) {
        this.$emit('movedown', this.widget);
      }
    },
    removeWidget(widget) {
      this.$emit('remove', this.widget);
    },
    startDrag(event) {
      if (this.mode == 'edit') {
        this.offsetX = event.offsetX;
        this.offsetY = event.offsetY;
        this.$set(this.widget, '_dragging', true);
        this.$set(this.widget, '_resizing', false);
        this.$emit('select', this.widget);
        this.$emit('addHistory');
      }
    },
    startResize(event, direction) {
      event.stopPropagation();
      this.$set(this.widget, '_dragging', false);
      this.$set(this.widget, '_resizing', true);
      this.$emit('addHistory');
      this.currentDirection = direction;
    },
    resize(dx, dy) {
      if (this.currentDirection == 'wn') {
        const ox = this.widget.x;
        const oy = this.widget.y;
        const owidth = this.widget.width;
        const oheight = this.widget.height;
        this.$set(this.widget, 'x', ox + dx);
        this.$set(this.widget, 'y', oy + dy);
        this.$set(this.widget, 'height', oheight - dy);
        this.$set(this.widget, 'width', owidth - dx);
      } else if (this.currentDirection == 'n') {
        const oy = this.widget.y;
        const oheight = this.widget.height;
        this.$set(this.widget, 'y', oy + dy);
        this.$set(this.widget, 'height', oheight - dy);
      } else if (this.currentDirection == 'en') {
        const oy = this.widget.y;
        const owidth = this.widget.width;
        const oheight = this.widget.height;
        this.$set(this.widget, 'y', oy + dy);
        this.$set(this.widget, 'height', oheight - dy);
        this.$set(this.widget, 'width', owidth + dx);
      } else if (this.currentDirection == 'w') {
        const ox = this.widget.x;
        const owidth = this.widget.width;
        this.$set(this.widget, 'x', ox + dx);
        this.$set(this.widget, 'width', owidth - dx);
      } else if (this.currentDirection == 'e') {
        const owidth = this.widget.width;
        this.$set(this.widget, 'width', owidth + dx);
      } else if (this.currentDirection == 'ws') {
        const ox = this.widget.x;
        const owidth = this.widget.width;
        const oheight = this.widget.height;
        this.$set(this.widget, 'x', ox + dx);
        this.$set(this.widget, 'height', oheight + dy);
        this.$set(this.widget, 'width', owidth - dx);
      } else if (this.currentDirection == 's') {
        const oheight = this.widget.height;
        this.$set(this.widget, 'height', oheight + dy);
      } else if (this.currentDirection == 'es') {
        const owidth = this.widget.width;
        const oheight = this.widget.height;
        this.$set(this.widget, 'height', oheight + dy);
        this.$set(this.widget, 'width', owidth + dx);
      }
    },
    move(dx, dy) {
      this.widget.y = this.widget.y + dy;
      this.widget.x = this.widget.x + dx;
      if (this.canvas.isAutoAlign) { //显示对齐辅助线
        //寻找最接近的节点，如果符合接近距离，则显示对齐辅助线
        const offset = 10;
        let targetX = null;
        let targetY = null;
        let minX = offset;
        let minY = offset;
        this.canvas.widgetList.forEach(node => {
          this.$set(node, '_aligned', false);
          if (node !== this.widget) {
            const tx = Math.abs(this.widget.x - node.x);
            const ty = Math.abs(this.widget.y - node.y);
            if (tx <= minX) {
              minX = tx;
              targetX = node;
            }
            if (ty <= minY) {
              minY = ty;
              targetY = node;
            }
          }
        });
        if (targetX) {
          // 添加对齐辅助线
          this.$emit('setAlignX', targetX.x);
          this.$set(targetX, '_aligned', true);
        } else {
          this.$emit('setAlignX', null);
        }
        if (targetY) {
          this.$emit('setAlignY', targetY.y);
          this.$set(targetY, '_aligned', true);
        } else {
          this.$emit('setAlignY', null);
        }
      }
    }
  },
  filter: {},
  computed: {
    zindex() {
      return this.widget._selected ? 99999 : this.widget.zindex;
    }
  },
  watch: {
    'widget._movingData': {
      handler: function(val) {
        if (val) {
          this.move(val.dx, val.dy);
        }
      },
      deep: true
    },
    'widget._resizingData': {
      handler: function(val) {
        if (val) {
          this.resize(val.dx, val.dy);
        }
      },
      deep: true
    },
    'widget._dragging': {
      handler: function(val) {
        if (val == false) {
          if (this.canvas.isAutoAlign) {
            if (this.alignX != null && this.alignX >= 0) {
              this.$set(this.widget, 'x', this.alignX);
            }
            if (this.alignY != null && this.alignY >= 0) {
              this.$set(this.widget, 'y', this.alignY);
            }
          }
        }
      },
      deep: true
    },
    'widget.x': {
      handler: function(val) {
        this.left = val;
      },
      immediate: true
    },
    'widget.y': {
      handler: function(val) {
        this.top = val;
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.remove-btn {
  position: absolute;
  top: -20px;
  right: -10px;
  cursor: pointer;
}
.config-btn{
  position: absolute;
  top: -20px;
  right: 15px;
  cursor: pointer;
}
.position-label {
  position: absolute;
  top: -20px;
  left: 0px;
  font-size: 12px;
  user-select: none;
}
.top-width-label {
  position: absolute;
  top: -20px;
  left: calc(50% - 10px);
  font-size: 12px;
  user-select: none;
}
.left-height-label {
  position: absolute;
  top: calc(50% - 10px);
  left: -30px;
  transform: rotate(90deg);
  font-size: 12px;
  user-select: none;
}
.widget {
  cursor: move;
}
.selected {
  border-width: 1px;
  border-style: dotted;
  background-color: rgba(45, 132, 251, 0.2);
}
.aligned{
  background-color: rgba(109, 109, 109, 0.2);
}
.anchor {
  width: 10px;
  height: 10px;
  border: 0px;
  position: absolute;
  opacity: 0.8;
  z-index: 9999;
}
.anchor-top-left {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}
.anchor-top-middle {
  top: -5px;
  left: calc(50% - 5px);
  cursor: n-resize;
}
.anchor-top-right {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}
.anchor-middle-left {
  top: calc(50% - 5px);
  left: -5px;
  cursor: w-resize;
}
.anchor-middle-right {
  top: calc(50% - 5px);
  right: -5px;
  cursor: e-resize;
}
.anchor-bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}
.anchor-bottom-middle {
  bottom: -5px;
  left: calc(50% - 5px);
  cursor: s-resize;
}
.anchor-bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}

</style>
