<template>
  <div class="portal-workbench-edit">
    <TsContain
      :enableCollapse="true"
      :siderWidth="286"
      :rightWidth="320"
      :hasContentPadding="false"
    >
      <template v-slot:navigation>
        <slot name="navigation">
          <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
        </slot>
      </template>
      <template v-slot:topLeft>
        <slot name="top-left" :workbench="workbench" :setName="setWorkbenchName">
          <TsFormInput
            ref="nameInput"
            :value="workbench.name"
            maxlength="50"
            placeholder="工作台名称"
            :validateList="[{ name: 'required', message: ' ' }]"
            border="border"
            @on-blur="setWorkbenchName"
          ></TsFormInput>
        </slot>
      </template>
      <template v-slot:topRight>
        <slot
          name="top-right"
          :workbench="workbench"
          :validate="validate"
          :getNormalizedValue="getNormalizedValue"
        >
          <div class="action-group align-center">
            <span class="action-item">
              <Button type="primary" :loading="saving" @click="requestSave">{{ $t('page.save') }}</Button>
            </span>
          </div>
        </slot>
      </template>
      <template v-slot:sider>
        <div class="widget-library padding-sm">
          <div v-if="availableWidgetLoading" class="library-state flex-center text-center">
            <Loading :loadingShow="true"></Loading>
          </div>
          <div v-else-if="availableWidgetError" class="library-state flex-center text-center">
            <div class="text-grey">{{ availableWidgetError }}</div>
            <span class="text-action pt-sm" @click="$emit('retry-widget-list')">重试</span>
          </div>
          <template v-else>
            <div class="mb-sm">
              <TsFormInput
                v-model.trim="widgetKeyword"
                placeholder="搜索组件"
                clearable
                border="border"
              ></TsFormInput>
            </div>
            <Collapse v-if="!$utils.isEmpty(visibleGroups)" :value="visibleGroups.map(item => item.name)">
              <Panel v-for="group in visibleGroups" :key="group.name" :name="group.name">
                {{ group.label }}
                <div slot="content">
                  <div
                    v-for="definition in group.widgetList"
                    :key="definition.name"
                    class="widget-option radius-sm bg-op bg-hover-grey text-default border-base padding-xs mb-sm cursor-pointer"
                    draggable="true"
                    @dragstart="startDrag($event, definition)"
                    @click="addWidget(definition)"
                  >
                    <i :class="[definition.icon, 'widget-option-icon flex-center radius-md bg-selected text-primary']"></i>
                    <div class="widget-option-main">
                      <div class="widget-option-title overflow">{{ definition.label }}</div>
                      <div class="widget-option-desc overflow text-grey mt-xs">{{ definition.description }}</div>
                    </div>
                  </div>
                </div>
              </Panel>
            </Collapse>
            <NoData v-if="visibleGroups.length === 0" text="暂无匹配组件"></NoData>
          </template>
        </div>
      </template>
      <div
        slot="content"
        class="workbench-canvas bg-grey padding"
        @drop="dropWidget"
        @dragover.prevent
        @click="selectWidget(null)"
      >
        <div class="canvas-inner">
          <grid-layout
            v-if="widgetList.length > 0"
            :layout="widgetList"
            :col-num="12"
            :row-height="30"
            :is-draggable="true"
            :is-resizable="true"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[12, 12]"
            :use-css-transforms="true"
            class="workbench-grid"
          >
            <grid-item
              v-for="widget in widgetList"
              :key="widget.i"
              :x="widget.x"
              :y="widget.y"
              :w="widget.w"
              :h="widget.h"
              :i="widget.i"
              :min-w="widget.minW"
              :min-h="widget.minH"
              @click.native.stop="selectWidget(widget)"
            >
              <WorkbenchGridItem
                :widget="widget"
                :editable="true"
                :selected="currentWidgetId === widget.i"
                @remove="removeWidget"
              >
                <template v-slot:widget="{ widget: slotWidget }">
                  <slot
                    name="widget"
                    :widget="slotWidget"
                    :definition="getWidgetByName(slotWidget.type)"
                    mode="edit"
                  ></slot>
                </template>
              </WorkbenchGridItem>
            </grid-item>
          </grid-layout>
          <div v-else class="canvas-empty bg-op radius-lg flex-center text-center">
            <i class="tsfont-plus flex-center radius-md bg-selected text-primary"></i>
            <div class="empty-title">从左侧添加组件</div>
            <div class="text-grey">组件仅保存布局和展示参数，业务数据由模块组件自行加载。</div>
          </div>
        </div>
        <Loading v-if="loading" :loadingShow="loading" type="fix"></Loading>
      </div>
      <template v-slot:right>
        <div class="config-panel bg-block padding">
          <template v-if="currentWidget">
            <div class="panel-title align-center mb-md">
              <div>
                <div class="text-title">组件配置</div>
                <div class="panel-subtitle text-grey mt-xs">{{ currentWidgetDefinition && currentWidgetDefinition.description }}</div>
              </div>
              <i
                v-if="currentWidgetDefinition"
                :class="[currentWidgetDefinition.icon, 'panel-icon flex-center radius-md bg-selected text-primary']"
              ></i>
            </div>
            <TsFormItem label="标题" labelPosition="top">
              <TsFormInput
                :value="currentWidget.name"
                @input="value => setWidgetField('name', value)"
              ></TsFormInput>
            </TsFormItem>
            <TsFormItem label="显示标题" labelPosition="top">
              <TsFormSwitch
                :value="currentWidget.showTitle"
                :trueValue="1"
                :falseValue="0"
                :showStatus="true"
                @on-change="value => setWidgetField('showTitle', value)"
              ></TsFormSwitch>
            </TsFormItem>
            <TsFormItem label="内边距" labelPosition="top">
              <Slider
                :value="currentWidget.padding"
                :min="0"
                :max="30"
                :step="1"
                @input="value => setWidgetField('padding', value)"
              ></Slider>
            </TsFormItem>
            <slot
              name="widget-config"
              :widget="currentWidget"
              :definition="currentWidgetDefinition"
              :setConfig="setWidgetConfig"
            ></slot>
          </template>
          <template v-else>
            <div class="panel-title align-center mb-md">
              <div>
                <div class="text-title">模板配置</div>
                <div class="panel-subtitle text-grey mt-xs">指定模板启用状态和适用对象，默认适用于所有人。</div>
              </div>
            </div>
            <TsForm
              ref="baseForm"
              v-model="workbench"
              :item-list="baseFormConfig"
              labelPosition="top"
            ></TsForm>
            <slot name="template-config" :workbench="workbench" :emitChange="emitInput"></slot>
          </template>
        </div>
      </template>
    </TsContain>
  </div>
</template>

<script>
import VueGridLayout from 'vue-grid-layout';
import WorkbenchGridItem from './components/workbench-grid-item.vue';
import { createWorkbenchWidget, getWorkbenchBottom, isWorkbenchWidgetListComplete, resolveWorkbenchLayout } from './utils/workbench-layout.js';

const UNGROUPED_WIDGET_GROUP = '__ungrouped__';
const LAST_GROUP_SORT = Number.MAX_SAFE_INTEGER;

function getSortValue(value, fallbackValue) {
  if (value === null || value === undefined || value === '') {
    return fallbackValue;
  }
  const sort = Number(value);
  return Number.isFinite(sort) ? sort : fallbackValue;
}

export default {
  name: 'PortalWorkbenchEdit',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    WorkbenchGridItem,
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    value: {
      type: Object,
      default: () => ({
        name: '',
        isActive: 1,
        authorityList: ['common#alluser'],
        config: { widgetList: [] }
      })
    },
    widgetDefinitions: { type: Array, default: () => [] },
    availableWidgetList: { type: Array, default: () => [] },
    availableWidgetLoading: { type: Boolean, default: false },
    availableWidgetError: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    saving: { type: Boolean, default: false }
  },
  data() {
    return {
      widgetKeyword: '',
      currentWidgetId: null,
      draggingWidget: null,
      baseFormConfig: {
        isActive: {
          type: 'switch',
          label: '是否启用',
          trueValue: 1,
          falseValue: 0,
          onChange: () => this.emitInput()
        },
        authorityList: {
          type: 'userselect',
          label: '适用用户',
          groupList: ['common', 'user', 'role', 'team'],
          isMultiple: true,
          transfer: true,
          validateList: ['required'],
          onChange: (value, selectedList) => {
            this.$set(this.workbench, 'authorityList', value || []);
            this.$set(this.workbench, 'authorityVoList', selectedList || []);
            this.emitInput();
          }
        }
      }
    };
  },
  methods: {
    getWidgetByName(name) {
      return this.widgetDefinitions.find(item => item.name === name) || null;
    },
    startDrag(event, definition) {
      this.draggingWidget = definition;
      event.dataTransfer.setData('widgetName', definition.name);
    },
    dropWidget(event) {
      const name = event.dataTransfer.getData('widgetName') || (this.draggingWidget && this.draggingWidget.name);
      const isAvailable = this.availableWidgetList.some(item => item && item.name === name);
      const definition = isAvailable && this.draggingWidget && this.draggingWidget.name === name
        ? this.draggingWidget
        : (isAvailable ? this.getWidgetByName(name) : null);
      if (definition) {
        this.addWidget(definition);
      }
      this.draggingWidget = null;
    },
    addWidget(definition) {
      const uuid = this.$utils.setUuid();
      const widget = createWorkbenchWidget(definition, {
        i: uuid,
        x: (this.widgetList.length * 4) % 12,
        y: getWorkbenchBottom(this.widgetList)
      });
      this.widgetList.push(widget);
      this.replaceWidgetList(resolveWorkbenchLayout(this.widgetList));
      this.selectWidget(widget);
    },
    removeWidget(widget) {
      const widgetList = this.widgetList.filter(item => item.i !== widget.i);
      this.replaceWidgetList(widgetList);
      if (this.currentWidgetId === widget.i) {
        this.currentWidgetId = null;
      }
    },
    selectWidget(widget) {
      if (widget) {
        this.ensureWidgetConfig(widget);
      }
      this.currentWidgetId = widget ? widget.i : null;
    },
    ensureWidgetConfig(widget) {
      const definition = this.getWidgetByName(widget.type);
      const defaultConfig = (definition && definition.config) || {};
      this.$set(widget, 'config', widget.config || {});
      Object.keys(defaultConfig).forEach(name => {
        if (!Object.prototype.hasOwnProperty.call(widget.config, name)) {
          this.$set(widget.config, name, defaultConfig[name]);
        }
      });
    },
    setWorkbenchName(value) {
      this.$set(this.workbench, 'name', value);
      this.emitInput();
    },
    setWidgetField(name, value) {
      if (this.currentWidget) {
        this.$set(this.currentWidget, name, value);
        this.emitInput();
      }
    },
    setWidgetConfig(name, value) {
      if (this.currentWidget) {
        this.$set(this.currentWidget, 'config', this.currentWidget.config || {});
        this.$set(this.currentWidget.config, name, value);
        this.emitInput();
      }
    },
    replaceWidgetList(widgetList) {
      this.$set(this.workbench, 'config', this.workbench.config || {});
      this.$set(this.workbench.config, 'widgetList', widgetList);
      this.emitInput();
    },
    emitInput() {
      this.$emit('input', this.workbench);
    },
    requestSave() {
      if (this.validate()) {
        this.$emit('save', this.getNormalizedValue());
      }
    },
    validate() {
      if (this.$refs.nameInput && !this.$refs.nameInput.valid()) {
        return false;
      }
      if (!this.widgetList.length) {
        this.$Message.warning('请至少添加一个组件');
        return false;
      }
      if (!Array.isArray(this.workbench.authorityList) || !this.workbench.authorityList.some(item => !!item)) {
        this.$Message.warning('请选择适用用户');
        return false;
      }
      if (!isWorkbenchWidgetListComplete(this.widgetList, this.widgetDefinitions)) {
        this.$Message.warning('组件布局数据不完整，请重新添加组件');
        return false;
      }
      return true;
    },
    getNormalizedValue() {
      const workbench = {
        ...this.workbench,
        config: {
          ...(this.workbench.config || {}),
          widgetList: resolveWorkbenchLayout(this.widgetList)
        }
      };
      return JSON.parse(JSON.stringify(workbench));
    }
  },
  computed: {
    workbench() {
      return this.value;
    },
    widgetList() {
      const config = this.workbench.config || {};
      return config.widgetList || [];
    },
    visibleGroups() {
      const keyword = this.widgetKeyword.trim().toLowerCase();
      const availableMap = new Map();
      const groupMap = new Map();
      this.availableWidgetList.forEach(item => {
        if (item && item.name && !availableMap.has(item.name)) {
          availableMap.set(item.name, item);
        }
      });
      this.widgetDefinitions.forEach((definition, definitionIndex) => {
        const availableWidget = availableMap.get(definition.name);
        if (!availableWidget) {
          return;
        }
        const availableDefinition = {
          ...definition,
          label: availableWidget.label || definition.label,
          description: availableWidget.description || definition.description
        };
        const text = ((availableDefinition.label || '') + ' ' + (availableDefinition.description || '')).toLowerCase();
        if (keyword && text.indexOf(keyword) === -1) {
          return;
        }
        const apiGroup = availableWidget.group && typeof availableWidget.group === 'object'
          ? availableWidget.group
          : null;
        const isUngrouped = !(apiGroup && apiGroup.name);
        const groupName = isUngrouped ? UNGROUPED_WIDGET_GROUP : apiGroup.name;
        const groupSort = isUngrouped
          ? LAST_GROUP_SORT
          : getSortValue(apiGroup.sort, LAST_GROUP_SORT - 1);
        if (!groupMap.has(groupName)) {
          groupMap.set(groupName, {
            name: groupName,
            label: isUngrouped ? '未分组' : (apiGroup.label || apiGroup.name),
            sort: groupSort,
            fallbackSort: definitionIndex,
            isUngrouped,
            widgetList: []
          });
        }
        const group = groupMap.get(groupName);
        group.sort = Math.min(group.sort, groupSort);
        group.fallbackSort = Math.min(group.fallbackSort, definitionIndex);
        group.widgetList.push({
          definition: availableDefinition,
          sort: getSortValue(availableWidget.sort, LAST_GROUP_SORT),
          fallbackSort: definitionIndex
        });
      });
      return Array.from(groupMap.values())
        .map(group => ({
          ...group,
          widgetList: group.widgetList
            .sort((a, b) => a.sort - b.sort || a.fallbackSort - b.fallbackSort)
            .map(item => item.definition)
        }))
        .sort((a, b) => {
          if (a.isUngrouped !== b.isUngrouped) {
            return a.isUngrouped ? 1 : -1;
          }
          return a.sort - b.sort || a.fallbackSort - b.fallbackSort;
        });
    },
    currentWidget() {
      return this.widgetList.find(item => item.i === this.currentWidgetId) || null;
    },
    currentWidgetDefinition() {
      return this.currentWidget ? this.getWidgetByName(this.currentWidget.type) : null;
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.portal-workbench-edit {
  height: 100%;
  color: inherit;
  .widget-library {
    height: 100%;
    overflow: auto;
  }
  .library-state {
    min-height: 180px;
    flex-direction: column;
  }
  .widget-option {
    min-height: 52px;
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 9px;
    align-items: center;
  }
  .widget-option-icon {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
  .widget-option-main {
    min-width: 0;
  }
  .widget-option-title {
    line-height: 18px;
    font-weight: 600;
  }
  .widget-option-desc {
    font-size: 12px;
    line-height: 16px;
  }
  .workbench-canvas {
    position: relative;
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
  }
  .canvas-inner {
    min-height: 100%;
    background-size: 24px 24px;
    background-image: linear-gradient(var(--border-color, @default-border) 1px, transparent 1px), linear-gradient(90deg, var(--border-color, @default-border) 1px, transparent 1px);
  }
  .workbench-grid {
    min-height: 100%;
    ::v-deep .vue-grid-item {
      z-index: 1 !important;
      overflow: hidden;
    }
    ::v-deep .vue-grid-item.vue-draggable-dragging,
    ::v-deep .vue-grid-item.resizing {
      z-index: 1 !important;
    }
    ::v-deep .vue-grid-item.vue-grid-placeholder {
      z-index: 0 !important;
      pointer-events: none;
    }
  }
  .canvas-empty {
    min-height: 260px;
    border: 1px dashed;
    border-color: var(--border-color, @default-border);
    flex-direction: column;
    gap: 8px;
    i {
      width: 42px;
      height: 42px;
      font-size: 20px;
    }
    .empty-title {
      font-weight: 700;
    }
    .theme-dark & {
      background: @dark-op;
    }
  }
  .config-panel {
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
  }
  .panel-title {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 34px;
    gap: 12px;
  }
  .panel-icon {
      width: 34px;
      height: 34px;
      font-size: 18px;
  }
  .panel-subtitle {
    font-size: 12px;
    line-height: 18px;
  }
}
</style>
