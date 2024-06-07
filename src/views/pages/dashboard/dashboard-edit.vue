<!--仪表板编辑 -->
<template>
  <div class="dashboard-edit-container">
    <TsContain :enableCollapse="true" :siderWidth="260" :rightWidth="300">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <TsFormInput
          ref="dashboardName"
          v-model.trim="dashboard.name"
          :placeholder="$t('page.name')"
          maxlength="30"
          :validateList="dashboardNameValidateList"
        ></TsFormInput>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
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
          <span class="action-item tsfont-fullscreen" @click="fullscreen">{{ $t('page.fullscreen') }}</span>
          <span class="action-item">
            <Button type="primary" @click="save">
              {{ $t('page.save') }}</Button></span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="formitem-container">
          <Collapse :value="['#', ...widgetTypeList.map(d => d.name)]">
            <Panel v-if="dashboard.widgetList && dashboard.widgetList.length > 0" name="#">
              {{ $t('term.report.selectedwidget') }}
              <div slot="content">
                <TsRow :gutter="8">
                  <Col
                    v-for="widget in dashboard.widgetList"
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
      <div
        slot="content"
        style="width: 100%; height: 100%;padding:0px"
        class="canvas grid"
        @drop="drop"
        @click="clickCanvas"
        @dragover.prevent
      >
        <div ref="canvasContainer" class="bg-grey">
          <grid-layout
            v-if="dashboard && dashboard.widgetList && dashboard.widgetList.length > 0"
            :layout="dashboard.widgetList"
            :col-num="12"
            :row-height="30"
            :is-draggable="true"
            :is-resizable="true"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[10, 10]"
            class="canvas grid"
            :use-css-transforms="true"
          >
            <grid-item
              v-for="item in dashboard.widgetList"
              :key="item.uuid"
              :x="item.x"
              :y="item.y"
              :w="item.w"
              :h="item.h"
              :i="item.i"
              :min-h="4"
              :min-w="2"
              class="dashboard-item"
              @click.native.stop="selectWidget(item)"
              @resize="resizeStart(item.uuid)"
              @resized="resizeEnd(item.uuid)"
            >
              <DashboardWidget
                :ref="'widget' + item.uuid"
                :mode="mode"
                :widget="item"
                :widgetComponent="getWidgetComponentByType(item)"
                :isResizing="getWidgetResizeStatusByUuid(item.uuid)"
                @remove="removeWidget"
              ></DashboardWidget>
            </grid-item>
          </grid-layout>
        </div>
        <Loading
          v-if="isLoading"
          :loading-show="isLoading"
          class="loadingclass"
          type="fix"
        ></Loading>
      </div>
      <template v-slot:right>
        <div class="pr-md pl-md config-right" style="overflow:auto">
          <div v-if="currentWidget">
            <Tabs>
              <TabPane :label="$t('page.layout')" name="layout">
                <LayoutConfig :widget="currentWidget"></LayoutConfig>
              </TabPane>
              <TabPane v-if="currentWidgetComponent && currentWidgetComponent.dataTypes && currentWidgetComponent.dataTypes.length > 0" name="data" :label="$t('page.data')">
                <DataConfig :widget="currentWidget"></DataConfig>
              </TabPane>
              <TabPane v-if="currentWidgetComponent && currentWidgetComponent.hasCustomConfig" name="config" :label="$t('page.config')">
                <WidgetConfig :widget="currentWidget"></WidgetConfig>
              </TabPane>
            </Tabs>
          </div>
          <div v-else><DashboardConfig :dashboard="dashboard"></DashboardConfig></div>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
import { WIDGETS } from './widget/widget-list.js';
import { WIDGET_TYPES } from './widget/widget-list.js';
import VueGridLayout from 'vue-grid-layout';
import screenfull from '@/resources/assets/js/screenfull.js';

export default {
  name: '',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    DashboardConfig: () => import('./dashboard-config.vue'),
    WidgetConfig: () => import('./widget/configs/widget-config.vue'),
    DataConfig: () => import('./dashboard-data-config.vue'),
    LayoutConfig: () => import('./dashboard-layout-config.vue'),
    DashboardWidget: () => import('./widget/dashboard-widget.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue')
  },
  props: [],
  data() {
    return {
      id: this.$route.params['id'],
      recoverQueue: [],
      widgetList: WIDGETS,
      widgetTypeList: WIDGET_TYPES,
      dashboard: { name: '', isActive: 1, widgetList: [] },
      currentWidget: null, //当前选中的组件
      isLoading: false,
      isWindowReszing: false,
      resizeStatus: {},
      copedWidget: null, //复制的组件
      mode: 'edit',
      dashboardNameValidateList: [
        { name: 'required', message: ' ' },
        { name: 'name-special', message: ' ' }
      ]
    };
  },
  beforeCreate() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeWindow);
    if (screenfull.isEnabled) {
      screenfull.off('change', this.screenfullChange);
    }
  },
  created() {
    //用于复制时传参
    if (this.$route.params['dashboard']) {
      this.dashboard = this.$route.params['dashboard'];
      this.dashboard.name = this.dashboard.name + '_copy';
      this.dashboard.id = null;
    }
  },
  beforeMount() {},
  mounted() {
    this.getDashboardById();
    window.addEventListener('resize', this.resizeWindow);
    window.addEventListener('keydown', this.windowKeypress);
  },
  methods: {
    copeWidget(widget) {},
    windowKeypress(event) {
      if (event.key == 'c' && event.ctrlKey) {
        //复制组件
        if (this.dashboard.widgetList && this.dashboard.widgetList.length > 0) {
          for (let i = this.dashboard.widgetList.length - 1; i >= 0; i--) {
            if (this.dashboard.widgetList[i]._selected) {
              this.copedWidget = this.$utils.deepClone(this.dashboard.widgetList[i]);
              this.$Message.success(this.$t('message.copysuccess'));
              break;
            }
          }
        }
      } else if (event.key == 'v' && event.ctrlKey) {
        //粘贴组件
        if (this.copedWidget) {
          this.copyWidget(this.copedWidget);
          this.copedWidget = null;
          this.$Message.success(this.$t('message.pastesuccess'));
        }
      }
    },
    forward() {
      if (this.recoverQueue.length > 0) {
        this.isWindowReszing = true;
        this.$nextTick(() => {
          const currentIndex = this.recoverQueue.findIndex(d => d.isInUse);
          if (currentIndex > -1 && currentIndex < this.recoverQueue.length - 1) {
            this.recoverQueue[currentIndex].isInUse = false;
            const historyData = this.recoverQueue[currentIndex + 1];
            historyData.isInUse = true;
            this.dashboard = historyData.dashboardData;
          }
          this.isWindowReszing = false;
        });
      }
    },
    fallback() {
      if (this.recoverQueue.length > 0) {
        this.isWindowReszing = true;
        this.$nextTick(() => {
          const currentIndex = this.recoverQueue.findIndex(d => d.isInUse);
          if (currentIndex == -1) {
            //第一次fallback把最新状态放入历史队列
            const index = this.recoverQueue.length - 1;
            this.addHistory(true, true);
            const historyData = this.recoverQueue[index];
            historyData.isInUse = true;
            this.dashboard = historyData.dashboardData;
          } else if (currentIndex > 0) {
            this.recoverQueue[currentIndex].isInUse = false;
            const historyData = this.recoverQueue[currentIndex - 1];
            historyData.isInUse = true;
            this.dashboard = historyData.dashboardData;
          }
          this.isWindowReszing = false;
        });
      }
    },
    addHistory(isActive, isFallback) {
      //给恢复队列增加历史数据
      const dashboardData = this.$utils.deepClone(this.dashboard);
      dashboardData.widgetList.forEach(widget => {
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
        //hash: this.$md5(JSON.stringify(dashboardData)),//暂时没用
        dashboardData: dashboardData,
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
    getDashboardById() {
      if (this.id) {
        this.$api.dashboard.dashboard.getDashboard(this.id).then(res => {
          if (res.Status == 'OK') {
            this.dashboard = res.Return;
          }
        });
      }
    },
    resizeWindow() {
      this.isWindowReszing = true;
      this.$nextTick(() => {
        this.isWindowReszing = false;
      });
    },
    clickCanvas(event) {
      //点击画布，取消所有选中
      if (event.target && event.target.className.indexOf('canvas') > -1) {
        this.dashboard.widgetList.forEach(element => {
          if (element._selected) {
            this.$set(element, '_selected', false);
          }
        });
        this.currentWidget = null;
      }
    },
    selectWidget(widget) {
      if (this.dashboard.widgetList && this.dashboard.widgetList.length > 0) {
        this.dashboard.widgetList.forEach(element => {
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
    removeWidget(widget) {
      if (this.dashboard.widgetList && this.dashboard.widgetList.length > 0) {
        const index = this.dashboard.widgetList.findIndex(element => element.uuid === widget.uuid);
        if (index > -1) {
          this.currentWidget = null;
          this.addHistory(true);
          this.dashboard.widgetList.splice(index, 1);
        }
      }
    },
    resizeStart(uuid) {
      this.$set(this.resizeStatus, uuid, true);
      this.addHistory(true);
    },
    resizeEnd(uuid) {
      this.$set(this.resizeStatus, uuid, false);
    },
    toDashboardManage() {
      this.$router.push({
        path: '/dashboard-manage'
      });
    },
    getWidgetComponentByType(widget) {
      return WIDGETS.find(d => d.type === widget.type);
    },
    startDrag(event, data) {
      //拖拽左边组件到dashboard面板
      event.dataTransfer.setData('widget', JSON.stringify(data));
    },
    drop(event) {
      let widget = event.dataTransfer.getData('widget');
      if (widget) {
        widget = JSON.parse(widget);
        this.addWidget(widget);
      }
    },
    copyWidget(widget) {
      const newWidget = this.$utils.deepClone(widget);
      let maxI = 0;
      let maxY = 0;
      this.dashboard.widgetList.forEach(element => {
        if (maxI < element.i) {
          maxI = element.i;
        }
        if (maxY < element.y) {
          maxY = element.y;
        }
      });
      newWidget.name = newWidget.name + '_copy';
      newWidget.i = maxI + 1;
      newWidget.x = 0;
      newWidget.y = maxY + 1;
      newWidget._selected = false;
      newWidget.uuid = this.$utils.setUuid(); //前端使用uuid作为唯一标识
      this.addHistory(true);
      this.dashboard.widgetList.push(newWidget);
    },
    addWidget(widget) {
      let maxI = 0;
      let maxY = 0;
      this.dashboard.widgetList.forEach(element => {
        if (maxI < element.i) {
          maxI = element.i;
        }
        if (maxY < element.y) {
          maxY = element.y;
        }
      });

      const newWidget = {
        type: widget.type,
        w: widget.width,
        h: widget.height,
        x: 0,
        y: maxY + 1,
        i: maxI + 1,
        name: widget.label,
        padding: widget.padding,
        isOpacity: widget.isOpacity || 0,
        config: widget.config
      };
      if (widget.dataTypes) {
        if (widget.dataTypes.length == 1) {
          newWidget.dataType = widget.dataTypes[0].value;
        }
      }
      newWidget.uuid = this.$utils.setUuid(); //前端使用uuid作为唯一标识
      this.addHistory(true);
      this.dashboard.widgetList.push(newWidget);
    },
    fullscreen() {
      let fullDiv = this.$refs.canvasContainer;
      if (screenfull.isEnabled) {
        screenfull.request(fullDiv);
        screenfull.on('change', this.screenfullChange); // 开启监听change事件
      }
    },
    screenfullChange() {
      this.mode = screenfull.isFullscreen ? 'read' : 'edit'; // 全屏模式，组件上不显示删除图标
    },
    save() {
      if (this.dashboard.name) {
        if (this.dashboard.widgetList.length > 0) {
          //_开头的属性都是编辑器的控制属性，不需要保存
          this.dashboard.widgetList.forEach(widget => {
            for (let key in widget) {
              if (key.startsWith('_')) {
                this.$delete(widget, key);
              }
            }
          });
          this.$api.dashboard.dashboard.saveDashboard(this.dashboard).then(res => {
            if (res.Status == 'OK' && res.Return) {
              this.$Message.success(this.$t('message.savesuccess'));
              this.currentWidget = null;
              this.$store.commit('leftMenu/setDashboardCount', 'add');
              this.$router.push({ path: '/dashboard-edit/' + res.Return });
            }
          });
        } else {
          this.$Message.info(this.$t('form.placeholder.pleaseadd', { target: this.$t('page.component') }));
        }
      } else {
        this.$Message.info(this.$t('form.placeholder.pleaseinput', { target: this.$t('page.name') }));
      }
    }
  },
  computed: {
    getWidgetByType() {
      return type => {
        return this.widgetList.filter(d => d.widgetType === type);
      };
    },
    getWidgetResizeStatusByUuid() {
      return uuid => {
        return this.isWindowReszing || this.resizeStatus[uuid];
      };
    },
    currentWidgetComponent() {
      if (this.currentWidget) {
        return WIDGETS.find(d => d.type === this.currentWidget.type);
      }
      return {};
    }
  },
  watch: {
    dashboard: {
      handler: function(val) {},
      deep: true
    }
  }
};
</script>

<style lang="less">
@import '~@/views/pages/dashboard/dashboard-edit.less';
</style>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';

.vue-grid-layout {
  margin: 0 6px;
}
.canvas.grid {
  background: radial-gradient(circle, #5a5a5a 0.5px, transparent 0.5px);
  background-size: 10px 10px;
}
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
