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
          <template v-else>
            <div v-if="availableWidgetError" class="library-warning bg-error-grey text-danger radius-md padding-xs mb-sm">
              {{ availableWidgetError }}
              <span class="text-action ml-xs" @click="$emit('retry-widget-list')">重试</span>
            </div>
            <div class="mb-sm">
              <TsFormInput
                v-model.trim="widgetKeyword"
                placeholder="搜索组件"
                clearable
                border="border"
              ></TsFormInput>
            </div>
            <Collapse
              v-if="!$utils.isEmpty(visibleModuleGroups)"
              :value="visibleModuleGroups.map(item => item.name)"
            >
              <Panel v-for="module in visibleModuleGroups" :key="module.name" :name="module.name">
                <span class="module-title">{{ module.label }}</span>
                <span class="module-count text-grey">{{ module.widgetCount }}</span>
                <div slot="content">
                  <div
                    v-for="definition in module.widgetList"
                    :key="definition.name"
                    :class="[
                      'widget-option radius-sm bg-op text-default border-base padding-xs mb-sm',
                      isDefinitionAvailable(definition) ? 'bg-hover-grey' : 'is-disabled'
                    ]"
                    :draggable="isDefinitionAvailable(definition)"
                    @dragstart="startDrag($event, definition)"
                  >
                    <i :class="[definition.icon, 'widget-option-icon flex-center radius-md bg-selected text-primary']"></i>
                    <div class="widget-option-main">
                      <div class="widget-option-heading">
                        <div class="widget-option-title overflow">{{ definition.label }}</div>
                      </div>
                      <div class="widget-option-desc overflow text-grey mt-xs">{{ definition.description }}</div>
                      <div
                        v-if="getAddedCount(definition.name) || definition.__authorizationUnchecked || !isDefinitionAvailable(definition)"
                        class="widget-option-meta text-grey mt-xs"
                      >
                        <span v-if="getAddedCount(definition.name)">已添加 {{ getAddedCount(definition.name) }}</span>
                        <span v-if="definition.__authorizationUnchecked" class="text-warning">授权未校验</span>
                        <span v-else-if="!isDefinitionAvailable(definition)" class="text-danger">
                          {{ definition.__unavailableReason || '不可用' }}
                        </span>
                      </div>
                      <div class="widget-option-actions mt-xs">
                        <span
                          :class="isDefinitionAvailable(definition) ? 'text-action' : 'text-disabled'"
                          @click.stop="addWidget(definition)"
                        >
                          添加
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            </Collapse>
            <NoData v-if="visibleModuleGroups.length === 0" text="暂无匹配组件"></NoData>
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
                @on-blur="value => setWidgetField('name', value)"
              ></TsFormInput>
            </TsFormItem>
            <TsFormItem label="说明" labelPosition="top">
              <TsFormInput
                :value="currentWidget.description"
                type="textarea"
                :maxlength="200"
                :height="64"
                @change="value => setWidgetField('description', value)"
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
                <div class="panel-subtitle text-grey mt-xs">
                  {{ showTemplateAuthority ? '指定模板启用状态和适用对象，默认适用于所有人。' : '个人模板仅当前用户可用，可在此设置启用状态。' }}
                </div>
              </div>
            </div>
            <TsForm
              ref="baseForm"
              v-model="workbench"
              :item-list="templateFormConfig"
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
    saving: { type: Boolean, default: false },
    showTemplateAuthority: { type: Boolean, default: true }
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
      return this.widgetDefinitionMap.get(name) || null;
    },
    isDefinitionAvailable(definition) {
      return !!(definition && definition.__available);
    },
    getAddedCount(name) {
      return this.widgetList.filter(widget => {
        const definition = this.getWidgetByName(widget.type);
        return definition ? definition.name === name : widget.type === name;
      }).length;
    },
    startDrag(event, definition) {
      if (!this.isDefinitionAvailable(definition)) {
        event.preventDefault();
        return;
      }
      this.draggingWidget = definition;
      event.dataTransfer.setData('widgetName', definition.name);
    },
    dropWidget(event) {
      const name = event.dataTransfer.getData('widgetName') || (this.draggingWidget && this.draggingWidget.name);
      const targetDefinition = this.getWidgetByName(name);
      const isAvailable = this.isDefinitionAvailable(targetDefinition);
      const definition = isAvailable && this.draggingWidget && this.draggingWidget.name === name
        ? this.draggingWidget
        : (isAvailable ? targetDefinition : null);
      if (definition) {
        this.addWidget(definition);
      }
      this.draggingWidget = null;
    },
    addWidget(definition) {
      if (!this.isDefinitionAvailable(definition)) {
        return;
      }
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
      if (
        this.showTemplateAuthority &&
        (!Array.isArray(this.workbench.authorityList) || !this.workbench.authorityList.some(item => !!item))
      ) {
        this.$Message.warning('请选择适用用户');
        return false;
      }
      if (!isWorkbenchWidgetListComplete(this.widgetList, this.widgetDefinitions)) {
        this.$Message.warning('组件布局数据不完整，请重新添加组件');
        return false;
      }
      const invalidWidget = this.widgetList.find(widget => {
        const definition = this.getWidgetByName(widget.type);
        if (!definition || typeof definition.validateConfig !== 'function') {
          return false;
        }
        const result = definition.validateConfig(widget.config || {}, widget);
        if (result === true || result === undefined) {
          return false;
        }
        widget.__validateMessage = typeof result === 'string' ? result : `${definition.label || widget.name}配置不完整`;
        return true;
      });
      if (invalidWidget) {
        this.$Message.warning(invalidWidget.__validateMessage);
        this.$delete(invalidWidget, '__validateMessage');
        this.selectWidget(invalidWidget);
        return false;
      }
      return true;
    },
    getNormalizedValue() {
      const workbench = {
        ...this.workbench,
        config: {
          ...(this.workbench.config || {}),
          widgetList: resolveWorkbenchLayout(this.widgetList).map(widget => {
            const definition = this.getWidgetByName(widget.type);
            const config = definition && typeof definition.serializeConfig === 'function'
              ? definition.serializeConfig(widget.config || {}, widget)
              : widget.config;
            return {
              ...widget,
              configVersion: (definition && Number(definition.version)) || widget.configVersion || 1,
              config
            };
          })
        }
      };
      return JSON.parse(JSON.stringify(workbench));
    }
  },
  computed: {
    workbench() {
      return this.value;
    },
    templateFormConfig() {
      if (this.showTemplateAuthority) {
        return this.baseFormConfig;
      }
      return {
        isActive: this.baseFormConfig.isActive
      };
    },
    widgetList() {
      const config = this.workbench.config || {};
      return config.widgetList || [];
    },
    visibleModuleGroups() {
      const keyword = this.widgetKeyword.trim().toLowerCase();
      const moduleMap = new Map();
      this.availableWidgetList.forEach((availableWidget, definitionIndex) => {
        const mergedDefinition = this.widgetDefinitionMap.get(availableWidget.name);
        if (
          !mergedDefinition ||
          mergedDefinition.__visibleInLibrary === false
        ) {
          return;
        }
        const category = mergedDefinition.category || mergedDefinition.group || {};
        const text = [
          mergedDefinition.label,
          mergedDefinition.description,
          mergedDefinition.ownerModuleName,
          category.label
        ].filter(Boolean).join(' ').toLowerCase();
        if (keyword && text.indexOf(keyword) === -1) {
          return;
        }
        const moduleName = mergedDefinition.ownerModule || 'framework';
        if (!moduleMap.has(moduleName)) {
          moduleMap.set(moduleName, {
            name: moduleName,
            label: mergedDefinition.ownerModuleName || moduleName,
            sort: definitionIndex,
            widgetList: []
          });
        }
        const module = moduleMap.get(moduleName);
        module.widgetList.push({
          definition: mergedDefinition,
          categorySort: getSortValue(category.sort, LAST_GROUP_SORT - 1),
          sort: getSortValue(mergedDefinition.sort, LAST_GROUP_SORT),
          fallbackSort: definitionIndex
        });
      });
      return Array.from(moduleMap.values())
        .sort((a, b) => a.sort - b.sort)
        .map(module => {
          const widgetList = module.widgetList
            .sort((a, b) => {
              return a.categorySort - b.categorySort || a.sort - b.sort || a.fallbackSort - b.fallbackSort;
            })
            .map(item => item.definition);
          return {
            name: module.name,
            label: module.label,
            widgetList,
            widgetCount: widgetList.length
          };
        });
    },
    widgetDefinitionMap() {
      // Provider 保留运行时实现；接口决定左侧组件库的成员、顺序和展示数据。
      const widgetDefinitionMap = new Map();
      this.widgetDefinitions.forEach(definition => {
        widgetDefinitionMap.set(definition.name, {
          ...definition,
          __available: false,
          __visibleInLibrary: false
        });
      });
      this.availableWidgetList.forEach(availableWidget => {
        const definition = widgetDefinitionMap.get(availableWidget.name) || {};
        widgetDefinitionMap.set(availableWidget.name, {
          ...definition,
          ...availableWidget,
          __available: availableWidget.isAvailable !== 0 && !availableWidget.__runtimeMissing,
          __visibleInLibrary: true,
          __authorizationUnchecked: !!availableWidget.authorizationUnchecked,
          __unavailableReason: availableWidget.unavailableReason || availableWidget.disabledReason || ''
        });
      });
      return widgetDefinitionMap;
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
  .library-warning {
    font-size: 11px;
    line-height: 16px;
  }
  .module-title {
    font-weight: 600;
  }
  .module-count {
    margin-left: 6px;
    font-size: 11px;
  }
  .widget-option {
    min-height: 74px;
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 9px;
    align-items: start;
    cursor: grab;
    &.is-disabled {
      opacity: 0.72;
      cursor: not-allowed;
    }
  }
  .widget-option-icon {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
  .widget-option-main {
    min-width: 0;
  }
  .widget-option-heading {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 5px;
    align-items: center;
  }
  .widget-option-title {
    line-height: 18px;
    font-weight: 600;
  }
  .widget-option-desc {
    font-size: 12px;
    line-height: 16px;
  }
  .widget-option-meta {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    font-size: 10px;
    line-height: 14px;
  }
  .widget-option-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    font-size: 11px;
  }
  .text-disabled {
    cursor: not-allowed;
    opacity: 0.45;
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
