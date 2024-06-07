<template>
  <div>
    <TsContain
      :enableCollapse="true"
      :siderWidth="260"
      :rightWidth="300"
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <TsFormInput
          ref="name"
          v-model="reportData.name"
          :validateList="[{ name: 'required', message: ' ' }]"
          :placeholder="$t('term.report.reportname')"
        ></TsFormInput>
      </template>
      <template v-slot:topRight>
        <div class="action-group" style="text-align:right">
          <span
            v-if="
              recoverQueue.filter(d => {
                return d.isActive;
              }).length > 0 && recoverQueue.findIndex(d => d.isInUse) != 0
            "
            class="action-item tsfont-undo"
            @click="fallback()"
          >
            {{ $t('page.revocation') }}
          </span>
          <span
            v-if="
              recoverQueue.findIndex(d => {
                return d.isInUse;
              }) > -1 &&
                recoverQueue.findIndex(d => {
                  return d.isInUse;
                }) !=
                recoverQueue.length - 1
            "
            class="action-item tsfont-revover"
            @click="forward()"
          >
            {{ $t('page.redo') }}
          </span>
          <span class="action-item">
            <TsFormSwitch
              v-model="reportData.isAutoAlign"
              :trueText="$t('term.report.alignguideline')"
              :falseText="$t('term.report.alignguideline')"
              :showStatus="true"
              :true-value="true"
              :false-value="false"
            ></TsFormSwitch>
          </span>
          <Divider type="vertical" />
          <span class="action-item">
            <TsFormSwitch
              v-model="reportData.isActive"
              :showStatus="true"
              :true-value="1"
              :false-value="0"
            ></TsFormSwitch>
          </span>
          <span class="action-item tsfont-fullscreen" @click="fullscreen">{{ $t('page.fullscreen') }}</span>
          <span class="action-item tsfont-save" @click="saveReport()">{{ $t('page.save') }}</span>
          <span v-if="id" class="action-item"><Button type="error" @click="deleteReport()">{{ $t('page.delete') }}</Button></span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="formitem-container">
          <Collapse :value="['#', ...widgetTypeList.map(d => d.name)]">
            <Panel v-if="reportData.widgetList && reportData.widgetList.length > 0" name="#">
              {{ $t('term.report.selectedwidget') }}
              <div slot="content">
                <TsRow :gutter="8">
                  <Col
                    v-for="widget in reportData.widgetList"
                    :key="widget.uuid"
                    :span="8"
                    class="form-item mt-md"
                  >
                    <div
                      v-if="getWidgetComponentByType(widget)"
                      :draggable="true"
                      style="cursor:pointer"
                      :class="currentWidget && currentWidget.uuid === widget.uuid ? 'text-href' : ''"
                      @click="selectWidget(widget)"
                    >
                      <div v-if="getWidgetComponentByType(widget).icon" :class="getWidgetComponentByType(widget).icon" style="font-size:24px"></div>
                      <div class="overflow" :title="getWidgetComponentByType(widget).label">{{ getWidgetComponentByType(widget).label }}</div>
                    </div>
                  </Col>
                </TsRow>
              </div>
            </Panel>
            <Panel v-for="widgetType in widgetTypeList" :key="widgetType.name" :name="widgetType.name">
              {{ widgetType.label }}
              <div slot="content">
                <TsRow :gutter="8">
                  <Col
                    v-for="widget in getWidgetByType(widgetType.name)"
                    :key="widget.name"
                    :span="8"
                    class="form-item mt-md"
                  >
                    <div :draggable="true" @dragstart="startDrag($event, widget)">
                      <div v-if="widget.icon" :class="widget.icon" style="font-size:24px"></div>
                      <div v-else class="tsfont-question-o" style="font-size:24px"></div>
                      <div class="overflow" :title="widget.label">{{ widget.label }}</div>
                    </div>
                  </Col>
                </TsRow>
              </div>
            </Panel>
          </Collapse>
        </div>
      </template>
      <template v-slot:content>
        <div ref="canvasContainer" class="bg-block radius-md canvasContainer">
          <div v-if="isAlignShow && alignX" class="align-x" :style="{ left: alignX + 'px' }"></div>
          <div v-if="isAlignShow && alignY" class="align-y" :style="{ top: alignY + 'px' }"></div>
          <div
            v-if="reportData.width"
            class="ruler-top"
            :class="canvasClass"
            :style="{ left: canvasX + 'px', width: reportData.width + 'px' }"
          >
            <span
              v-for="c in Math.floor(reportData.width / 50)"
              :key="c"
              :class="canvasClass"
              class="ruler-marker"
              :style="{ left: c * 50 - 15 + 'px', width: '30px' }"
            >
              <span v-if="c % 2 == 0">{{ c * 50 }}</span>
            </span>
          </div>
          <div
            v-if="reportData.height"
            class="ruler-left"
            :class="canvasClass"
            :style="{ top: canvasY + 'px', height: reportData.height + 'px' }"
          >
            <span
              v-for="c in Math.floor(reportData.height / 50)"
              :key="c"
              :class="canvasClass"
              class="ruler-marker"
              :style="{ top: c * 50 - 8 + 'px' }"
            >
              <span v-if="c % 2 == 0">{{ c * 50 }}</span>
            </span>
          </div>
          <div class="canvas-background" :style="{ background: reportData.config.backgroundColor, 'background-size': reportData.config.backgroundImageLayout == 'resize' ? '100% 100%' : 'auto', 'background-image': 'url(' + reportData.config.backgroundImage + ')', position: 'absolute', top: canvasY + 'px', left: canvasX + 'px', height: reportData.height + 'px', width: reportData.width + 'px' }"></div>
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
            @click="onClick"
          >
            <Widget
              v-for="widget in reportData.widgetList"
              ref="widgetHandler"
              :key="widget.uuid"
              :canvas="reportData"
              :widget="widget"
              :widgetComponent="getWidgetComponentByType(widget)"
              :alignX="alignX"
              :alignY="alignY"
              @addHistory="addHistory"
              @select="selectWidget"
              @remove="onRemoveWidget"
              @moveup="moveUpWidget"
              @movedown="moveDownWidget"
              @movetop="moveTopWidget"
              @movefloor="moveFloorWidget"
              @setAlignX="setAlignX"
              @setAlignY="setAlignY"
            />
          </div>
        </div>
      </template>
      <template v-slot:right>
        <div class="pr-md pl-md config-right overflow" style="overflow:auto">
          <div v-if="currentWidget">
            <Tabs>
              <TabPane :label="$t('page.layout')">
                <StatementLayoutEdit :currentWidget="currentWidget" :currentWidgetComponent="currentWidgetComponent"></StatementLayoutEdit>
              </TabPane>
              <TabPane v-if="currentWidgetComponent && currentWidgetComponent.dataTypes && currentWidgetComponent.dataTypes.length > 0" :label="$t('page.data')">
                <StatementDataEdit :currentWidget="currentWidget" :currentWidgetComponent="currentWidgetComponent"></StatementDataEdit>
              </TabPane>
              <TabPane v-if="currentWidgetComponent && currentWidgetComponent.hasCustomConfig" :label="$t('page.config')">
                <WidgetConfig :widget="currentWidget" @setConfig="setWidgetConfig"></WidgetConfig>
              </TabPane>
            </Tabs>
          </div>
          <div v-else><CanvasConfig :canvas="reportData"></CanvasConfig></div>
        </div>
        <Divider
          plain
          orientation="right"
          style="font-size:12px;"
          class="mt-md mb-md"
        >{{ $t('page.thumbnail') }}</Divider>
        <div class="pl-md pr-md"><EagleEye :config="{ canvasHeight: reportData.height, canvasWidth: reportData.width, containerWidth: containerWidth, containerHeight: containerHeight, containerTop: canvasY, containerLeft: canvasX }" :reportData="reportData" @grab="moveContainer"></EagleEye></div>
      </template>
    </TsContain>
  </div>
</template>
<script>
import { WIDGETS } from './widgets/widget-list.js';
import { WIDGET_TYPES } from './widgets/widget-list.js';
import screenfull from '@/resources/assets/js/screenfull.js';

export default {
  name: '',
  components: {
    StatementDataEdit: () => import('./statement-data-edit.vue'),
    StatementLayoutEdit: () => import('./statement-layout-edit.vue'),
    Widget: () => import('./widgets/widget-handler.vue'),
    WidgetConfig: () => import('./widgetconfigs/widget-config.vue'),
    CanvasConfig: () => import('./canvas-config.vue'),
    EagleEye: () => import('./eagleeye.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {},
  data() {
    return {
      id: this.$route.params['id'],
      recoverQueue: [],
      alignX: 0,
      alignY: 0,
      isAlignShow: false,
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
      reportData: {
        name: '',
        isAutoAlign: false, //激活对齐辅助线
        width: 1920,
        height: 1080,
        description: '',
        config: {
          backgroundColor: '',
          backgroundImageLayout: 'repeat',
          theme: ''
        },
        widgetList: []
      },
      widgetList: WIDGETS,
      widgetTypeList: WIDGET_TYPES,
      datasourceFieldList: [],
      copedWidget: null //复制的组件
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getReportById();
    this.$nextTick(() => {
      this.calcContainSize();
    });
    window.addEventListener('resize', this.calcContainSize);
    window.addEventListener('keydown', this.windowKeypress);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.calcContainSize);
  },
  destroyed() {},
  methods: {
    setAlignX(alignX) {
      this.alignX = alignX;
      this.isAlignShow = true;
    },
    setAlignY(alignY) {
      this.alignY = alignY;
      this.isAlignShow = true;
    },
    forward() {
      if (this.recoverQueue.length > 0) {
        const currentIndex = this.recoverQueue.findIndex(d => d.isInUse);
        if (currentIndex > -1 && currentIndex < this.recoverQueue.length - 1) {
          this.recoverQueue[currentIndex].isInUse = false;
          const historyData = this.recoverQueue[currentIndex + 1];
          historyData.isInUse = true;
          this.reportData = historyData.reportData;
        }
      }
    },
    fallback() {
      if (this.recoverQueue.length > 0) {
        const currentIndex = this.recoverQueue.findIndex(d => d.isInUse);
        if (currentIndex == -1) {
          //第一次fallback把最新状态放入历史队列
          const index = this.recoverQueue.length - 1;
          this.addHistory(true, true);
          const historyData = this.recoverQueue[index];
          historyData.isInUse = true;
          this.reportData = historyData.reportData;
        } else if (currentIndex > 0) {
          this.recoverQueue[currentIndex].isInUse = false;
          const historyData = this.recoverQueue[currentIndex - 1];
          historyData.isInUse = true;
          this.reportData = historyData.reportData;
        }
      }
    },
    addHistory(isActive, isFallback) {
      //给恢复队列增加历史数据
      const historyReportData = this.$utils.deepClone(this.reportData);
      historyReportData.widgetList.forEach(widget => {
        for (let key in widget) {
          if (key.startsWith('_')) {
            this.$delete(widget, key);
          }
        }
      });
      //如果已经是恢复途中，则把isInUse后面的数据先清除再Push
      const inUseIndex = this.recoverQueue.findIndex(d => d.isInUse);
      if (inUseIndex > -1) {
        this.recoverQueue.length = inUseIndex;
      }
      this.recoverQueue.push({
        //hash: this.$md5(JSON.stringify(historyReportData)),//暂时没用
        reportData: historyReportData,
        isActive: !!isActive
      });
      //如果不是fallback而产生的数据，这时候需要清空所有isInUse状态，让数据回到原始状态而不是恢复状态
      if (!isFallback) {
        this.recoverQueue.forEach(element => {
          element.isInUse = false;
        });
      }
      //最多保留10个记录
      if (this.recoverQueue.length > 10) {
        this.recoverQueue.shift();
      }
    },
    windowKeypress(event) {
      //删除组件
      //暂时注释删除功能，不然在编辑器输入内容时会导致误删除
      /*if (event.key == 'Backspace' || event.key == 'Delete') {
        if (this.reportData.widgetList && this.reportData.widgetList.length > 0) {
          for (let i = this.reportData.widgetList.length - 1; i >= 0; i--) {
            if (this.reportData.widgetList[i]._selected) {
              this.addHistory(true);
              this.reportData.widgetList.splice(i, 1);
            }
          }
        }
      } else*/ if (event.key == 'c' && event.ctrlKey) {
        //复制组件
        if (this.reportData.widgetList && this.reportData.widgetList.length > 0) {
          for (let i = this.reportData.widgetList.length - 1; i >= 0; i--) {
            if (this.reportData.widgetList[i]._selected) {
              this.copedWidget = this.$utils.deepClone(this.reportData.widgetList[i]);
              this.$Message.success(this.$t('message.copysuccess'));
              break;
            }
          }
        }
      } else if (event.key == 'v' && event.ctrlKey) {
        //粘贴组件
        if (this.copedWidget) {
          this.copeWidget(this.copedWidget);
          this.copedWidget = null;
          this.$Message.success(this.$t('message.pastesuccess'));
        }
      }
    },
    calcContainSize() {
      const canvasContainer = this.$refs['canvasContainer'];
      if (canvasContainer) {
        const rect = canvasContainer.getBoundingClientRect();
        this.containerWidth = rect.width;
        this.containerHeight = rect.height;
      }
    },
    moveTopWidget(widget) {
      let maxindex = 0;
      this.reportData.widgetList.forEach(element => {
        if (widget.zindex < element.zindex) {
          if (maxindex < element.zindex) {
            maxindex = element.zindex;
          }
          element.zindex -= 1;
        }
      });
      widget.zindex = maxindex;
    },
    moveFloorWidget(widget) {
      let minindex = Number.MAX_VALUE;
      this.reportData.widgetList.forEach(element => {
        if (widget.zindex > element.zindex) {
          if (minindex > element.zindex) {
            minindex = element.zindex;
          }
          element.zindex += 1;
        }
      });
      widget.zindex = minindex;
    },
    moveUpWidget(widget) {
      let minOffset = Number.MAX_VALUE;
      let switchWidget = null;
      this.reportData.widgetList.forEach(element => {
        if (element.zindex > widget.zindex) {
          if (minOffset > element.zindex - widget.zindex) {
            minOffset = element.zindex - widget.zindex;
            switchWidget = element;
          }
        }
      });
      if (switchWidget) {
        const i = switchWidget.zindex;
        switchWidget.zindex = widget.zindex;
        widget.zindex = i;
      }
    },
    moveDownWidget(widget) {
      let minOffset = Number.MAX_VALUE;
      let switchWidget = null;
      this.reportData.widgetList.forEach(element => {
        if (element.zindex < widget.zindex) {
          if (minOffset > widget.zindex - element.zindex) {
            minOffset = widget.zindex - element.zindex;
            switchWidget = element;
          }
        }
      });
      if (switchWidget) {
        const i = switchWidget.zindex;
        switchWidget.zindex = widget.zindex;
        widget.zindex = i;
      }
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

    getWidgetComponentByType(widget) {
      return WIDGETS.find(d => d.type === widget.type);
    },
    changeDataType(val) {
      this.$set(this.currentWidget, 'dataType', val);
    },
    setWidgetConfig(config) {
      this.reportData.widgetList.forEach(element => {
        if (element.uuid === this.currentWidget.uuid) {
          this.$set(element, 'config', config);
        }
      });
    },
    onRemoveWidget(widget) {
      if (this.reportData.widgetList && this.reportData.widgetList.length > 0) {
        const index = this.reportData.widgetList.findIndex(element => element.uuid === widget.uuid);
        if (index > -1) {
          this.currentWidget = null;
          this.addHistory(true);
          this.reportData.widgetList.splice(index, 1);
        }
      }
    },
    selectWidget(widget) {
      if (this.reportData.widgetList && this.reportData.widgetList.length > 0) {
        this.reportData.widgetList.forEach(element => {
          if (element._selected && element != widget) {
            this.$set(element, '_selected', false);
          }
        });
      }
      //先置空，再重新设置，防止tab加载出错
      this.currentWidget = null;
      this.$nextTick(() => {
        this.currentWidget = widget;
        this.$set(widget, '_selected', true);
      });
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
      } else {
        this.isGrabbing = false;
      }
    },
    onClick(event) {
      //点击画布，取消所有选中
      if (event.target && event.target.className === 'canvas') {
        this.reportData.widgetList.forEach(element => {
          if (element._selected) {
            this.$set(element, '_selected', false);
          }
        });
        this.currentWidget = null;
      }
    },
    stopMove() {
      if (!this.isGrabbing) {
        if (this.reportData.widgetList && this.reportData.widgetList.length > 0) {
          this.reportData.widgetList.forEach(element => {
            if (element._dragging) {
              this.$set(element, '_dragging', false);
            }
            if (element._resizing) {
              this.$set(element, '_resizing', false);
            }
            if (element._aligned) {
              this.$set(element, '_aligned', false);
            }
          });
        }
        if (this.recoverQueue.length > 0 && !this.recoverQueue[this.recoverQueue.length - 1].isActive) {
          this.recoverQueue.pop();
        }
      } else {
        this.isGrabbing = false;
      }
      this.isShowGrid = false;
      //清除辅助线
      this.isAlignShow = false;
    },
    onMove(event) {
      const x = event.clientX;
      const y = event.clientY;
      const dx = x - this.mouseX;
      const dy = y - this.mouseY;
      if (this.isGrabbing) {
        this.moveContainer(dx, dy);
      } else {
        if (this.reportData.widgetList && this.reportData.widgetList.length > 0) {
          this.reportData.widgetList.forEach(element => {
            if (element._dragging) {
              this.$set(element, '_movingData', { dx: dx, dy: dy });
              this.isShowGrid = true;
              if (this.recoverQueue.length > 0 && !this.recoverQueue[this.recoverQueue.length - 1].isActive) {
                this.recoverQueue[this.recoverQueue.length - 1].isActive = true;
              }
            } else if (element._resizing) {
              this.$set(element, '_resizingData', { dx: dx, dy: dy });
              this.isShowGrid = true;
              if (this.recoverQueue.length > 0 && !this.recoverQueue[this.recoverQueue.length - 1].isActive) {
                this.recoverQueue[this.recoverQueue.length - 1].isActive = true;
              }
            }
          });
        }
      }
      this.mouseX = x;
      this.mouseY = y;
    },
    moveContainer(dx, dy) {
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
    copeWidget(widget) {
      const newWidget = this.$utils.deepClone(widget);
      newWidget.uuid = this.$utils.setUuid(); //前端使用uuid作为唯一标识
      newWidget.x = newWidget.x + 100;
      newWidget.y = newWidget.y + 100;
      newWidget._selected = false;
      this.addHistory(true);
      this.reportData.widgetList.push(newWidget);
    },
    addWidget(widget, x, y) {
      const newWidget = {
        type: widget.type,
        width: widget.width,
        height: widget.height,
        padding: widget.padding,
        config: widget.config,
        border: ''
      };
      newWidget.x = x;
      newWidget.y = y;
      newWidget.zindex = this.createZindex();
      if (widget.dataTypes) {
        if (widget.dataTypes.length == 1) {
          newWidget.dataType = widget.dataTypes[0].value;
        }
      }
      newWidget.uuid = this.$utils.setUuid(); //前端使用uuid作为唯一标识
      this.reportData.widgetList.push(newWidget);
    },
    createZindex() {
      //从100开始，100以下留给其他用途
      let zindex = 99;
      if (this.reportData.widgetList && this.reportData.widgetList.length > 0) {
        this.reportData.widgetList.forEach(widget => {
          if (widget.zindex >= zindex) {
            zindex = widget.zindex;
          }
        });
      }
      return zindex + 1;
    },
    saveReport() {
      if (this.$refs['name'] && this.$refs['name'].valid()) {
        if (!this.reportData.widgetList || this.reportData.widgetList.length <= 0) {
          this.$Message.warning(this.$t('message.report.addreportwidget'));
          return;
        }
        //_开头的属性都是编辑器的控制属性，不需要保存
        this.reportData.widgetList.forEach(widget => {
          for (let key in widget) {
            if (key.startsWith('_')) {
              this.$delete(widget, key);
            }
          }
        });
        this.$api.report.statement.saveStatement(this.reportData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            if (res.Return) {
              this.$router.push({ path: '/statement-edit/' + res.Return });
            }
          }
        });
      }
    },
    deleteReport() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.report.report')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.report.statement.deleteStatement(this.id).then(res => {
            vnode.isShow = false;
            this.$router.push({
              path: '/statement-manage'
            });
          });
        }
      });
    }
  },
  filter: {},
  computed: {
    getWidgetByType() {
      return type => {
        return this.widgetList.filter(d => d.widgetType === type);
      };
    },
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
.align-x {
  position: absolute;
  top: 0px;
  height: 100%;
  border-left: 1px dashed rgba(45, 132, 251,1);
  z-index: 9999;
}
.align-y {
  position: absolute;
  left: 0px;
  width: 100%;
  border-top: 1px dashed rgba(45, 132, 251, 1);
  z-index: 9999;
}
.config-right {
  height: calc(100vh - 324px);
}
.widget-container {
  display: grid;
  grid-template-columns: 20px auto;
}
.ruler-top {
  position: absolute;
  height: 5px;
  top: 0px;
  z-index: 99999;
  user-select: none;
}
.ruler-left {
  position: absolute;
  left: 0px;
  z-index: 99999;
  width: 5px;
  user-select: none;
}
.ruler-left.grid {
  background: repeating-linear-gradient(0deg, transparent, transparent 99px, #5a5a5a, #5a5a5a 100px);
}
.ruler-top .ruler-marker {
  top: 2px;
}
.ruler-marker {
  position: absolute;
  font-size: 12px;
  color: #5a5a5a;
  text-align: center;
  display: none;
  z-index: 2;
  user-select: none;
}
.ruler-left .ruler-marker {
  left: 2px;
}
.ruler-marker.grid {
  display: inherit;
}
.ruler-top.grid {
  background: repeating-linear-gradient(90deg, transparent, transparent 99px, #5a5a5a, #5a5a5a 100px);
}
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
  z-index: 50;
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
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
.form-item {
  text-align: center;
  cursor: move;
  // width: 50%;
  display: inline-block;
}
.theme(@background-color) {
  .formitem-container {
    /deep/ .ivu-collapse-content {
      background-color: @background-color;
      > .ivu-collapse-content-box {
        padding-top: 0;
      }
    }
    /deep/ .ivu-collapse {
      border: none;
    }
  }
}
html {
  .theme(@default-background);

  &.theme-dark {
    .theme(@dark-background);
  }
}
</style>
