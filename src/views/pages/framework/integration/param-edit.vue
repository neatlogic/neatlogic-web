<template>
  <div>
    <Alert show-icon>
      {{ $t('page.help') }}：
      <template slot="desc">
        <div>{{ $t('term.framework.paramcheckdesc') }}</div>
        <div class="flex-start">
          <b class="mr-sm" :class="{ 'text-primary': needValid == 1 }">{{ $t('term.framework.checkenable') }}</b>
          <TsFormSwitch
            v-model="needValid"
            :disabled="disabled"
            :true-value="1"
            :false-value="0"
          ></TsFormSwitch>
        </div>
        <div>{{ $t('term.framework.aftercheckdesc') }}</div>
      </template>
    </Alert>
    <div v-if="fixedParamList.length || paramList.length" class="tstable-container" data-integration-param-container>
      <!-- 每个自定义参数使用独立 tbody，拖动时参数及行下编辑区作为整体移动。 -->
      <Draggable
        :list="paramList"
        :animation="150"
        :move="canMoveParam"
        tag="table"
        class="tstable-body"
        style="table-layout: fixed; width: 100%"
        handle="[data-param-drag]"
        draggable="[data-custom-param-group]"
      >
        <template slot="header">
          <!-- 三个内容区固定为 9em，其余列分配剩余宽度，长文本和控件不再挤出操作列。 -->
          <colgroup>
            <col style="width: 48px">
            <col style="width: calc(9em + 12px)">
            <col>
            <col>
            <col style="width: 40px">
            <col style="width: 60px">
            <col style="width: calc(9em + 12px)">
            <col style="width: calc(9em + 12px)">
            <col v-if="canAddParam" style="width: 48px">
          </colgroup>
          <thead>
            <tr>
              <th :style="mainCellStyle">{{ $t('page.dragrow') }}</th>
              <th :style="mainCellStyle">{{ $t('page.name') }}</th>
              <th :style="mainCellStyle">{{ $t('term.framework.paramtype') }}</th>
              <th :style="mainCellStyle">{{ $t('term.report.datatype.name') }}</th>
              <th :style="mainCellStyle">{{ $t('page.require') }}</th>
              <th :style="mainCellStyle">{{ $t('term.cmdb.searchable') }}</th>
              <th :style="mainCellStyle">{{ $t('page.description') }}</th>
              <th :style="mainCellStyle">{{ $t('page.defaultvalue') }}</th>
              <th v-if="canAddParam" :style="mainCellStyle">
                <span class="tsfont-plus-o text-action" data-add-param @click="addParam"></span>
              </th>
            </tr>
          </thead>
          <!-- 仅展示顶层固定参数且保持只读，子节点保留在定义中供其它页面使用。 -->
          <tbody v-for="item in fixedParamList" :key="fixedKey(item)" class="tbody-main">
            <tr data-fixed-param>
              <td :style="mainCellStyle"></td>
              <td :style="mainCellStyle"><ParamText :value="item.name"></ParamText></td>
              <td :style="mainCellStyle">{{ getModeText(item.mode) }}</td>
              <td :style="mainCellStyle">{{ defaultTypeName(item.type, item.typeName || item.type) }}</td>
              <td :style="mainCellStyle">{{ $t(item.isRequired == 1 ? 'page.yes' : 'page.no') }}</td>
              <td :style="mainCellStyle">{{ item.mode == 'input' ? $t(item.isSearchAble == 1 ? 'page.yes' : 'page.no') : '' }}</td>
              <td :style="mainCellStyle"><ParamText :value="item.description"></ParamText></td>
              <td :style="mainCellStyle">
                <DefaultValueCell
                  :ref="`default-${fixedKey(item)}`"
                  :pattern="item"
                  :config="getFixedDefault(item)"
                  :disabled="disabled"
                  @change="setFixedDefault(item, $event)"
                  @open="openDefault(fixedKey(item), $event)"
                ></DefaultValueCell>
              </td>
              <td v-if="canAddParam" :style="mainCellStyle"></td>
            </tr>
            <tr v-if="isComplex(item) && !isArray(item)" data-default-row>
              <td></td>
              <td :colspan="columnCount - 1">
                <div v-if="isComplex(item) && !isArray(item)" class="flex-start mb-xs">
                  <span class="mr-sm">{{ $t('term.framework.integrationdefault.defaultSummary', { summary: summarizeDefault(getFixedDefault(item)) }) }}</span>
                  <span
                    v-if="!disabled"
                    class="text-href"
                    data-open-default
                    @click="openDefault(fixedKey(item), 'value')"
                  >{{ isDefaultEnabled(getFixedDefault(item)) ? $t('page.edit') : $t('page.setting') }}</span>
                </div>
                <DefaultValuePanel
                  v-if="expandedDefaultKey === fixedKey(item)"
                  :key="fixedKey(item)"
                  :pattern="item"
                  :config="getFixedDefault(item)"
                  :view="defaultView"
                  :disabled="disabled"
                  @change="setFixedDefault(item, $event)"
                  @close="closeDefault"
                  @open-schema="openSchemaDialog(fixedKey(item), $event)"
                ></DefaultValuePanel>
              </td>
            </tr>
          </tbody>
        </template>
        <tbody
          v-for="(item, index) in paramList"
          :key="customKey(item)"
          class="tbody-main"
          data-custom-param-group
        >
          <tr data-custom-param>
            <td :style="mainCellStyle">
              <span v-if="canEditParam(item)" class="tsfont-drag cursor-pointer" data-param-drag></span>
            </td>
            <td :style="mainCellStyle">
              <!-- 输入框只约束布局宽度，保留原编辑方式、长度校验和完整保存值。 -->
              <div v-if="canEditParam(item)" style="width: 9em">
                <TsFormInput
                  v-model="item.name"
                  :maxlength="30"
                  :validate-list="['required']"
                  :error-message="paramError && paramError.index === index ? $t(paramError.message, {target: $t('page.param')}) : ''"
                ></TsFormInput>
              </div>
              <ParamText v-else :value="item.name"></ParamText>
            </td>
            <td :style="mainCellStyle">
              <TsFormSelect
                v-if="canEditParam(item)"
                v-model="item.mode"
                :data-list="editableModeList"
                :validate-list="['required']"
                transfer
              ></TsFormSelect>
              <span v-else>{{ getModeText(item.mode) }}</span>
            </td>
            <td :style="mainCellStyle">
              <DefaultTypeSelect
                v-if="canEditParam(item)"
                :key="typeSelectKeys[customKey(item)] || 0"
                :value="item.type"
                :data-list="translatedParamTypes"
                :validate-list="['required']"
                transfer
                @change="changeParamType(item, $event)"
              ></DefaultTypeSelect>
              <span v-else>{{ defaultTypeName(item.type, item.typeName || item.type) }}</span>
            </td>
            <td :style="mainCellStyle">
              <TsFormSwitch
                v-if="item.mode == 'input'"
                v-model="item.isRequired"
                :disabled="!canEditParam(item)"
                :true-value="1"
                :false-value="0"
              ></TsFormSwitch>
            </td>
            <td :style="mainCellStyle">
              <TsFormSwitch
                v-if="item.mode == 'input'"
                v-model="item.isSearchAble"
                :disabled="!canEditParam(item)"
                :true-value="1"
                :false-value="0"
              ></TsFormSwitch>
            </td>
            <td :style="mainCellStyle">
              <div v-if="canEditParam(item)" style="width: 9em">
                <TsFormInput v-model="item.description" :maxlength="200"></TsFormInput>
              </div>
              <ParamText v-else :value="item.description"></ParamText>
            </td>
            <td :style="mainCellStyle">
              <DefaultValueCell
                :ref="`default-${customKey(item)}`"
                :pattern="item"
                :config="item.defaultConfig"
                :disabled="disabled"
                @change="setCustomDefault(item, $event)"
                @open="openDefault(customKey(item), $event)"
              ></DefaultValueCell>
            </td>
            <td v-if="canAddParam" :style="mainCellStyle">
              <div v-if="canEditParam(item)" class="flex-start">
                <span class="tsfont-plus-o text-action mr-xs" data-insert-param @click.stop="addRowParam(index)"></span>
                <span class="tsfont-minus-o text-action" data-delete-param @click.stop="delParam(index)"></span>
              </div>
            </td>
          </tr>
          <tr v-if="isComplex(item) && !isArray(item)" data-default-row>
            <td></td>
            <td :colspan="columnCount - 1">
              <div v-if="isComplex(item) && !isArray(item)" class="flex-start mb-xs">
                <span class="mr-sm">{{ $t('term.framework.integrationdefault.defaultSummary', { summary: summarizeDefault(item.defaultConfig) }) }}</span>
                <span
                  v-if="!disabled"
                  class="text-href"
                  data-open-default
                  @click="openDefault(customKey(item), 'value')"
                >{{ isDefaultEnabled(item.defaultConfig) ? $t('page.edit') : $t('page.setting') }}</span>
              </div>
              <DefaultValuePanel
                v-if="expandedDefaultKey === customKey(item)"
                :key="customKey(item)"
                :pattern="item"
                :config="item.defaultConfig"
                :view="defaultView"
                :disabled="disabled"
                @change="setCustomDefault(item, $event)"
                @close="closeDefault"
                @open-schema="openSchemaDialog(customKey(item), $event)"
              ></DefaultValuePanel>
            </td>
          </tr>
        </tbody>
      </Draggable>
    </div>
    <!-- 数组结构和默认数据合并在独立草稿弹窗中，确认后才更新外层集成表单。 -->
    <SchemaDialog
      v-if="schemaDialogTarget && schemaDialogParam"
      :key="schemaDialogTarget.key"
      :pattern="schemaDialogParam.item"
      :config="schemaDialogParam.config"
      :initialSteps="schemaDialogTarget.schemaSteps"
      :disabled="disabled"
      @change="applySchemaDialog"
      @close="closeSchemaDialog"
    ></SchemaDialog>
    <div
      v-if="canAddParam && !fixedParamList.length && !paramList.length"
      class="text-action tsfont-plus"
      data-add-param
      @click="addParam"
    >{{ $t('page.param') }}</div>
    <div v-if="defaultError" class="text-error mt-sm" data-default-error>{{ defaultError.message }}</div>
    <!-- 当前规范已移除的固定参数仍保留历史配置，提供单独清除入口解除保存阻塞。 -->
    <div v-for="entry in orphanDefaults" :key="JSON.stringify([entry.mode, entry.name])" class="text-warning mt-sm">
      <span class="mr-sm">{{ $t('term.framework.integrationdefault.orphan', { mode: getModeText(entry.mode), name: entry.name }) }}</span>
      <span v-if="!disabled" class="text-href" @click="removeOrphanDefault(entry)">{{ $t('term.framework.integrationdefault.removeDefault') }}</span>
    </div>
  </div>
</template>
<script>
import { defaultTypeName } from './defaults-editor/index.js';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormSwitch from '@/resources/plugins/TsForm/TsFormSwitch';
import Draggable from 'vuedraggable';
import DefaultValueCell from './defaults-editor/default-value-cell.vue';
import DefaultValuePanel from './defaults-editor/default-value-panel.vue';
import SchemaDialog from './defaults-editor/schema-dialog.vue';
import DefaultTypeSelect from './defaults-editor/default-type-select.js';
import ParamText from './defaults-editor/param-text.vue';
import {cloneParamConfig, validateCustomParams, withParamRowKeys} from './integration-param-utils.js';
import {cloneJson, cloneDefaultConfig, getBuiltinDefault, getDeclaredSchema, isDefaultEnabled, normalizeDefaultType, summarizeDefault as summarizeDefaultValue, validateIntegrationDefaults} from './integration-default-utils.js';
import {reconcileValue, resolveSchema} from './defaults-editor/editor-utils.js';

export default {
  components: {DefaultTypeSelect, Draggable, TsFormInput, TsFormSelect, TsFormSwitch, DefaultValueCell, DefaultValuePanel, SchemaDialog, ParamText},
  props: {
    integration: {type: Object},
    allowEditInputParam: {type: Number, default: 0},
    allowEditOutputParam: {type: Number, default: 0},
    handlerPattern: {type: Array, default: () => []},
    // 集成编辑权限独立于处理器的定义编辑开关，固定参数同样可以配置默认值。
    disabled: {type: Boolean, default: false}
  },
  data() {
    return {
      // 仅主参数行收紧左右留白，展开区继续使用原有跨列布局和独立横向滚动。
      mainCellStyle: {paddingLeft: '6px', paddingRight: '6px'},
      paramList: [],
      builtinDefaultList: [],
      paramTypeList: [],
      needValid: 0,
      paramError: null,
      defaultError: null,
      expandedDefaultKey: '',
      defaultView: 'value',
      schemaDialogTarget: null,
      typeSelectKeys: {},
      modeList: [
        {value: 'input', text: this.$t('page.inputparam')},
        {value: 'output', text: this.$t('page.outputparam')}
      ]
    };
  },
  beforeCreate() {
    // 行键只用于页面，不写入配置；重命名、切换方向及拖动保持展开状态。
    this.paramRowKeys = new WeakMap();
    this.paramRowSequence = 0;
  },
  mounted() {
    this.getParamTypeList();
  },
  methods: {
    defaultTypeName,
    summarizeDefault(config) {
      return summarizeDefaultValue(config && config.value, config && config.enabled);
    },
    isDefaultEnabled,
    isComplex(item) {
      return ['array', 'object'].includes(normalizeDefaultType(item.type));
    },
    isArray(item) {
      return normalizeDefaultType(item.type) === 'array';
    },
    fixedKey(item) {
      return JSON.stringify(['builtin', this.integration && this.integration.handler, item.mode, item.name]);
    },
    customKey(item) {
      if (!this.paramRowKeys.has(item)) this.paramRowKeys.set(item, `custom-${++this.paramRowSequence}`);
      return this.paramRowKeys.get(item);
    },
    getFixedDefault(item) {
      return getBuiltinDefault(this.config, this.integration && this.integration.handler, item);
    },
    setFixedDefault(item, config) {
      if (this.disabled) return;
      const handler = this.integration && this.integration.handler;
      // 更新当前处理器的对应方向，保留其它规范配置，不复制任何固定参数定义。
      const next = this.builtinDefaultList.filter(entry => entry.handler !== handler || entry.mode !== item.mode || entry.name !== item.name);
      if (config) next.push({handler, mode: item.mode, name: item.name, defaultConfig: cloneJson(config)});
      this.builtinDefaultList = next;
      this.defaultError = null;
    },
    setCustomDefault(item, config) {
      if (this.disabled) return;
      if (config) this.$set(item, 'defaultConfig', cloneJson(config));
      else this.$delete(item, 'defaultConfig');
      this.defaultError = null;
    },
    removeOrphanDefault(entry) {
      if (this.disabled) return;
      // 移除只关闭有效值，保留补充结构，便于恢复规范后重新录入。
      const config = cloneJson(entry.defaultConfig);
      config.enabled = false;
      delete config.value;
      this.setFixedDefault(entry, config);
    },
    openDefault(key, view) {
      if (this.disabled) return;
      const target = this.findDefaultParam(key);
      // 数组所有编辑入口（含保存校验定位）均进入同一个弹窗，不再渲染行下表格。
      if (target && normalizeDefaultType(target.item.type) === 'array') {
        this.openSchemaDialog(key);
        return;
      }
      this.expandedDefaultKey = key;
      this.defaultView = view;
    },
    closeDefault() {
      this.expandedDefaultKey = '';
    },
    findDefaultParam(key) {
      const fixed = this.fixedParamList.find(item => this.fixedKey(item) === key);
      if (fixed) return { key, kind: 'builtin', item: fixed, config: this.getFixedDefault(fixed) };
      const custom = this.paramList.find(item => this.customKey(item) === key);
      return custom ? { key, kind: 'custom', item: custom, config: custom.defaultConfig } : null;
    },
    getSchemaDialogStamp(target) {
      if (!target) return '';
      const {defaultConfig, ...pattern} = target.item;
      return JSON.stringify([this.integration && this.integration.handler, pattern, target.config]);
    },
    openSchemaDialog(key, schemaSteps = []) {
      if (this.disabled) return;
      const target = this.findDefaultParam(key);
      if (!target || normalizeDefaultType(target.item.type) !== 'array') return;
      this.closeDefault();
      // 使用稳定行键定位，快照只用于阻止切换规范或外部更新后的过期写回。
      this.schemaDialogTarget = { key, stamp: this.getSchemaDialogStamp(target), schemaSteps: cloneJson(schemaSteps) };
    },
    closeSchemaDialog() {
      this.schemaDialogTarget = null;
    },
    applySchemaDialog(config) {
      const target = this.schemaDialogParam;
      if (this.disabled || !this.schemaDialogTarget || this.schemaDialogTarget.stamp !== this.getSchemaDialogStamp(target)) {
        this.closeSchemaDialog();
        return;
      }
      // 先保护外层按钮，再销毁内层弹窗，避免双击的后一次点击落到外层取消或保存。
      this.$emit('default-dialog-confirmed');
      if (target.kind === 'builtin') this.setFixedDefault(target.item, config);
      else this.setCustomDefault(target.item, config);
      // 弹窗提交完整默认值配置，关闭时不产生额外行，也不复制固定参数定义。
      this.closeSchemaDialog();
    },
    changeParamType(item, type) {
      if (!this.canEditParam(item) || item.type === type) return;
      const key = this.customKey(item);
      const refs = this.$refs[`default-${key}`];
      const cell = Array.isArray(refs) ? refs[0] : refs;
      if (cell) cell.flushInput();
      const config = item.defaultConfig && cloneDefaultConfig(item.defaultConfig);
      const previous = resolveSchema(item, config).schema;
      // 别名切换保留原有内部定义；真正改为另一类型时只采用新类型声明，不推断结构。
      const schema = normalizeDefaultType(item.type) === normalizeDefaultType(type)
        ? {...cloneJson(previous), type: normalizeDefaultType(type)}
        : getDeclaredSchema({name: item.name, isRequired: item.isRequired, type});
      const reconciled = config && Object.prototype.hasOwnProperty.call(config, 'value')
        ? reconcileValue(config.value, previous, schema)
        : {changed: false};
      const apply = (clear = false) => {
        this.$set(item, 'type', type);
        const option = this.paramTypeList.find(entry => entry.value === type);
        this.$set(item, 'typeName', option ? option.text : type);
        if (config) {
          // 兼容时同步结构快照并保留启用状态，禁用草稿不能因切换类型被自动启用。
          const next = clear ? {enabled: false} : {...config, schema};
          if (!clear && Object.prototype.hasOwnProperty.call(config, 'value')) {
            if (reconciled.value === undefined) {
              delete next.value;
              next.enabled = false;
            } else next.value = cloneJson(reconciled.value);
          }
          this.$set(item, 'defaultConfig', next);
        }
        this.closeDefault();
        this.defaultError = null;
        this.$nextTick(() => {
          const current = this.$refs[`default-${key}`];
          const target = Array.isArray(current) ? current[0] : current;
          if (item.type === type && (reconciled.validatePaths || []).length && target) target.validateType();
        });
      };
      if (reconciled.changed) {
        // 受控下拉重建回原值，取消确认时类型与默认值保持不变。
        this.$set(this.typeSelectKeys, key, (this.typeSelectKeys[key] || 0) + 1);
        this.$createDialog({
          title: this.$t('term.framework.integrationdefault.changeType'),
          content: this.$t('term.framework.integrationdefault.changeTypeConfirm'),
          'on-ok': dialog => {
            apply(true);
            dialog.isShow = false;
          }
        });
      } else apply();
    },
    getModeText(val) {
      const mode = this.modeList.find(item => item.value === val);
      return mode ? mode.text : val;
    },
    // 修改、删除和拖动均使用当前行的方向权限，禁止影响只读方向。
    canEditParam(item) {
      if (this.disabled) return false;
      if (item.mode === 'input') return this.allowEditInputParam === 1;
      if (item.mode === 'output') return this.allowEditOutputParam === 1;
      // 旧版允许保存空方向的行，有编辑权限时允许修正或删除，避免无法通过保存校验。
      return this.allowEditInputParam === 1 || this.allowEditOutputParam === 1;
    },
    canMoveParam(event) {
      const {element, index, futureIndex} = event.draggedContext;
      return this.canEditParam(element) && this.paramList.slice(Math.min(index, futureIndex), Math.max(index, futureIndex) + 1).every(this.canEditParam);
    },
    getParamTypeList() {
      this.$api.framework.integration.getParamTypeList().then(res => {
        if (res.Status === 'OK') this.paramTypeList = res.Return;
      });
    },
    // 新增默认首个允许编辑的方向，固定参数从不加入保存配置。
    addRowParam(index) {
      if (!this.canAddParam || (index >= 0 && !this.canEditParam(this.paramList[index]))) return;
      this.paramList.splice(index + 1, 0, {uuid: this.$utils.setUuid(), mode: this.editableModeList[0].value, isRequired: 0, isSearchAble: 0});
    },
    addParam() {
      if (this.canAddParam) this.paramList.push({uuid: this.$utils.setUuid(), mode: this.editableModeList[0].value, isRequired: 0, isSearchAble: 0});
    },
    delParam(index) {
      if (this.canEditParam(this.paramList[index])) this.paramList.splice(index, 1);
    },
    getConfig() {
      return cloneParamConfig(this.config);
    },
    defaultCells() {
      // ref 使用原参数稳定键，拖动不串位；仅遍历当前仍存在的行，删除和切换规范不会复用旧提示。
      const keys = [...this.fixedParamList.map(this.fixedKey), ...this.paramList.map(this.customKey)];
      return keys.flatMap(key => this.$refs[`default-${key}`] || []);
    },
    async flushDefaultInputs() {
      this.defaultCells().forEach(cell => cell.flushInput());
      // 单元格配置和父级集成表单各有一层响应式回写，保存前等待两层均完成。
      await this.$nextTick();
      await this.$nextTick();
    },
    valid() {
      this.defaultCells().forEach(cell => cell.validateForSubmit());
      this.paramError = validateCustomParams(this.config, this.handlerPattern);
      if (this.paramError) this.$Message.warning(this.$t(this.paramError.message, {target: this.$t('page.param')}));
      this.defaultError = validateIntegrationDefaults(this.handlerPattern, this.config, this.integration && this.integration.handler);
      if (this.defaultError) {
        this.$Message.warning(this.defaultError.message);
        const custom = this.paramList[this.defaultError.index];
        const fixed = this.fixedParamList.find(item => item.mode === this.defaultError.mode && item.name === this.defaultError.name);
        if (custom) this.openDefault(this.customKey(custom), 'value');
        else if (fixed) this.openDefault(this.fixedKey(fixed), 'value');
      }
      return !this.paramError && !this.defaultError;
    }
  },
  computed: {
    translatedParamTypes() { return this.paramTypeList.map(item => ({ ...item, text: defaultTypeName(item.value, item.text) })); },
    schemaDialogParam() {
      return this.schemaDialogTarget ? this.findDefaultParam(this.schemaDialogTarget.key) : null;
    },
    schemaDialogStamp() {
      return this.getSchemaDialogStamp(this.schemaDialogParam);
    },
    columnCount() {
      return this.canAddParam ? 9 : 8;
    },
    orphanDefaults() {
      return this.builtinDefaultList.filter(entry => entry.handler === (this.integration && this.integration.handler) && isDefaultEnabled(entry.defaultConfig) && !this.handlerPattern.some(item => item.mode === entry.mode && item.name === entry.name));
    },
    editableModeList() {
      return this.modeList.filter(item => this.canEditParam({mode: item.value}));
    },
    canAddParam() {
      return this.editableModeList.length > 0;
    },
    fixedParamList() {
      // 所有规范均只遍历顶层固定定义，复用层级行键但不展开 children。
      return withParamRowKeys(this.handlerPattern);
    },
    savedParam() {
      return this.integration && this.integration.config && this.integration.config.param;
    },
    config() {
      return {needValid: this.needValid, paramList: this.paramList, builtinDefaultList: this.builtinDefaultList};
    }
  },
  watch: {
    // 目标删除、类型或规范变化、外部配置替换及权限回收时，丢弃过期草稿。
    schemaDialogStamp(value) {
      if (this.schemaDialogTarget && value !== this.schemaDialogTarget.stamp) this.closeSchemaDialog();
    },
    disabled(value) {
      if (value) this.closeSchemaDialog();
    },
    // 仅观察参数配置，初始化先回显；相同配置不往返回写，避免复制和父组件更新造成覆盖。
    savedParam: {
      handler(val) {
        const next = cloneParamConfig(val);
        if (JSON.stringify(next) !== JSON.stringify(this.config)) {
          this.closeSchemaDialog();
          this.paramList = next.paramList;
          this.builtinDefaultList = next.builtinDefaultList || [];
          this.needValid = next.needValid;
          this.paramError = null;
          this.defaultError = null;
        }
      },
      deep: true,
      immediate: true
    },
    config: {
      handler(val) {
        if (JSON.stringify(val) !== JSON.stringify(cloneParamConfig(this.savedParam))) this.$emit('setParam', cloneParamConfig(val));
      },
      deep: true
    }
  }
};
</script>
