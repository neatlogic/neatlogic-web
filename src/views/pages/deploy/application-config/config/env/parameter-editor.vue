<template>
  <div class="parameter-editor">
    <div class="editor-toolbar">
      <span>{{ t('mode') }}</span>
      <RadioGroup
        :key="modeRevision"
        :value="mode"
        type="button"
        @on-change="changeMode"
      >
        <Radio label="fields">{{ t('form') }}</Radio>
        <Radio label="text">{{ t('textmode') }}</Radio>
      </RadioGroup>
    </div>
    <template v-if="mode === 'text'">
      <div class="text-grey text-help">
        <div>{{ t('format') }}</div>
        <div>{{ t('types') }}</div>
        <div>{{ t(allowUnsetText ? 'unset' : 'empty') }}</div>
        <div>{{ t('example') }} <code>text: app_name = demo</code></div>
      </div>
      <Input
        ref="text"
        v-model="text"
        class="parameter-text"
        type="textarea"
        :rows="13"
        @on-change="error = ''"
      ></Input>
      <div v-if="error" class="text-error mt-xs" role="alert">{{ error }}</div>
      <div class="text-grey mt-sm">{{ t('retained') }}</div>
    </template>
    <template v-else>
      <div v-if="error" class="text-error mb-sm" role="alert">{{ error }}</div>
      <TsTable :theadList="columns" :tbodyList="rows" :fixedHeader="false">
        <template slot="key" slot-scope="{row,index}">
          <TsFormSelect
            v-if="variables"
            :ref="'key-' + index"
            :value="row.key"
            :dataList="variables"
            :isChangeWrite="false"
            :errorMessage="row.errorMessage"
            search
            transfer
            @on-change="(key, value, selected) => chooseVariable(row,index,key,selected)"
          ></TsFormSelect>
          <!-- 名称不做输入自动修剪，历史首尾空白必须原样保留。 -->
          <Input
            v-else
            :ref="'key-' + index"
            v-model="row.key"
          ></Input>
          <div v-if="!variables && row.errorMessage" class="text-error" role="alert">{{ row.errorMessage }}</div>
        </template>
        <template slot="type" slot-scope="{row,index}">
          <span v-if="variables">{{ t(row.type || 'text') }}</span>
          <Select
            v-else
            :ref="'type-' + index"
            :value="row.type"
            transfer
            @on-change="value => changeType(row,value)"
          >
            <Option v-for="item in types" :key="item.value" :value="item.value">{{ item.text }}</Option>
          </Select>
        </template>
        <template slot="value" slot-scope="{row,index}">
          <PasswordHandler
            v-if="row.type === 'password'"
            :key="'password-' + passwordState(row).id"
            :ref="'value-' + index"
            :value="row.value"
            :defaultValue="passwordState(row).defaultValue"
            :disabled="!!row.isEmpty"
            :config="{errorMessage: row.valueErrorMessage}"
            @change="value => passwordChanged(row, value)"
            @input.native="valueChanged(row)"
          ></PasswordHandler>
          <Input
            v-else
            :ref="'value-' + index"
            v-model="row.value"
            :type="row.type || 'text'"
            :password="false"
            :disabled="!!row.isEmpty"
            @on-change="valueChanged(row)"
          ></Input>
          <div v-if="row.valueErrorMessage" class="text-error" role="alert">{{ row.valueErrorMessage }}</div>
        </template>
        <template slot="isEmpty" slot-scope="{row}">
          <div class="empty-switch">
            <TsFormSwitch
              :value="row.isEmpty"
              :trueValue="1"
              :falseValue="0"
              @on-change="value => setEmpty(row,value)"
            ></TsFormSwitch>
            <span>{{ $t('page.settonull') }}</span>
          </div>
        </template>
        <template slot="remove" slot-scope="{index}">
          <button
            type="button"
            class="tsfont-trash-o text-action"
            :aria-label="$t('page.delete')"
            @click="rows.splice(index,1)"
          ></button>
        </template>
      </TsTable>
      <button type="button" class="tsfont-plus text-href mt-nm" @click="add">{{ $t('page.param') }}</button>
    </template>
  </div>
</template>
<script>
import {parseParameters, serializeParameters, validateParameters, parameterTypes, passwordMask, ParameterError} from './parameter-text';

export default {
  components: {
    PasswordHandler: () => import('@/views/pages/autoexec/components/param/edit/password.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {initialRows: {type: Array, default: () => []}, variables: {type: Array, default: null}, inheritPassword: Boolean, allowUnsetText: Boolean},
  // 两种模式始终编辑弹窗自己的副本，只有调用方确认后才回填。
  data() {
    return {
      mode: 'fields', modeRevision: 0, text: '', error: '', textSnapshot: [],
      passwordStates: new WeakMap(), passwordRevision: 0,
      rows: this.initialRows.map(row => ({
        ...row, type: row.type || row.componentType || 'text', value: String(row.value ?? ''),
        isEmpty: row.isEmpty == null ? (!row.value && !row.filledFields?.includes('value') ? 1 : 0) : row.isEmpty
      }))
    };
  },
  // 密码的占位适配只在编辑副本中处理，输入交互继续交给旧密码组件。
  created() { this.rows.forEach(row => this.passwordState(row)); },
  beforeDestroy() { this.stopFocus?.(); },
  methods: {
    t(key, params) { return this.$t('term.deploy.parametereditor.' + key, params); },
    add() { this.rows.push({key: '', type: 'text', value: '', isEmpty: 0}); },
    // 正式实例沿用环境已有密码；接入草稿仍由自身凭据标记恢复密码。
    chooseVariable(row, index, key, selected) {
      const variable = selected || this.variables.find(item => item.value === key);
      this.$set(this.rows, index, {key, type: variable?.componentType || 'text', isEmpty: 0,
        value: variable?.componentType === 'password' && !this.inheritPassword ? '' : String(variable?.variableValue ?? '')});
    },
    // 每条记录有独立组件身份和初始值，增删或切换类型不能复用其他记录的密码缓存。
    passwordState(row) {
      let state = this.passwordStates.get(row);
      if (!state) {
        const originalValue = row.value;
        if (row.type === 'password' && !row.isEmpty && !row.value && row.filledFields?.includes('value')) row.value = passwordMask;
        state = {id: this.passwordRevision++, defaultValue: row.value, originalValue};
        this.passwordStates.set(row, state);
      }
      return state;
    },
    // 旧组件聚焦时也会发出 change；此处仅回填，不把临时清空误判为重填密码。
    passwordChanged(row, value) {
      row.value = value;
      this.$delete(row, 'valueErrorMessage');
    },
    // 只有原生输入才清理凭据标记，聚焦和失焦恢复事件不改变标记。
    valueChanged(row) {
      this.$delete(row, 'filledFields');
      this.$delete(row, 'valueErrorMessage');
    },
    changeType(row, type) {
      if (row.type === type) return;
      this.$set(row, 'type', type);
      row.value = '';
      this.$delete(row, 'filledFields');
      this.passwordStates.delete(row);
    },
    setEmpty(row, value) {
      this.$set(row, 'isEmpty', value);
      if (value) {
        row.value = '';
        this.$delete(row, 'filledFields');
        this.passwordStates.delete(row);
      }
    },
    // 无效文本保留在当前模式，错误行使用原文本的物理行号。
    read(requireValues = true) {
      let source;
      try {
        source = this.mode === 'text' ? parseParameters(this.text, this.textSnapshot, this.allowUnsetText) : this.rows.map((row, index) => {
          if (row.type !== 'password' || row.isEmpty) return row;
          const state = this.passwordState(row);
          const ref = this.$refs['value-' + index];
          const input = Array.isArray(ref) ? ref[0] : ref;
          // 保存或切换模式时可能尚未失焦，沿用旧组件当前缓存，避免误存聚焦产生的空串。
          const value = row.value || input?.currentValue || '';
          const result = {...row, value};
          if (row.filledFields?.includes('value') && value === state.defaultValue) result.value = state.originalValue;
          else if (value) delete result.filledFields;
          return result;
        });
        // 只有正式旧入口允许提交文本待填值，接入草稿仍校验必填；模式转换只校验结构。
        const rows = validateParameters(source, this.variables, requireValues && !(this.mode === 'text' && this.allowUnsetText));
        this.error = '';
        return rows.map(({key, type, value, isEmpty, filledFields}) => ({key, type, value, isEmpty, ...(filledFields ? {filledFields: [...filledFields]} : {})}));
      } catch (error) {
        if (!(error instanceof ParameterError)) throw error;
        const index = this.mode === 'text' && error.code === 'reference' ? source?.[error.index]?.textLine ?? error.index : error.index;
        this.error = this.t('error', {line: index + 1, reason: this.t('errors.' + error.code, {key: error.key})});
        if (this.mode === 'fields') {
          const row = this.rows[index];
          if (row) this.$set(row, error.code === 'value' ? 'valueErrorMessage' : 'errorMessage', this.error);
          this.focusRow(index, error.code === 'value' ? 'value' : error.code === 'type' ? 'type' : 'key');
        } else {
          this.$nextTick(() => {
            const input = this.$refs.text?.$el.querySelector('textarea');
            if (!input) return;
            const start = this.text.split('\n').slice(0, index).reduce((offset, line) => offset + line.length + 1, 0);
            input.focus();
            input.setSelectionRange(start, start + (this.text.split('\n')[index]?.length || 0));
          });
        }
        return null;
      }
    },
    // 旧入口的待填值可进入文本补全，接入继续执行完整校验。
    changeMode(mode) {
      if (mode === this.mode) return;
      const rows = this.read(!this.allowUnsetText);
      if (!rows) {
        // 受控值未变化时重建分段按钮，撤销组件内部的乐观选中状态。
        this.modeRevision++;
        return;
      }
      this.rows = rows;
      if (mode === 'text') {
        this.textSnapshot = rows.map(row => ({...row}));
        this.text = serializeParameters(rows);
      } else {
        this.rows.forEach(row => this.passwordState(row));
      }
      this.mode = mode;
    },
    // 变量选择组件按需加载，等待目标挂载后再完成提交浮卡的字段定位。
    focusRow(index, column = 'key') {
      this.stopFocus?.();
      this.mode = 'fields';
      this.$nextTick(() => {
        const focus = () => {
          const target = this.$refs[column + '-' + index];
          const root = (Array.isArray(target) ? target[0] : target)?.$el;
          const selector = 'input:not([type="hidden"]):not(:disabled),textarea:not(:disabled),[tabindex]';
          const input = root?.matches?.(selector) ? root : root?.querySelector?.(selector);
          if (!input?.getClientRects().length) return false;
          input.focus();
          return true;
        };
        if (focus()) return;
        const observer = new MutationObserver(() => { if (focus()) this.stopFocus(); });
        const timer = setTimeout(() => this.stopFocus(), 5000);
        this.stopFocus = () => { observer.disconnect(); clearTimeout(timer); };
        observer.observe(this.$el, {childList: true, subtree: true});
      });
    }

  },
  computed: {
    types() { return parameterTypes.map(value => ({value, text: this.t(value)})); },
    columns() {
      return [
        {key: 'key', title: this.$t('page.variablename'), headerIcon: 'require-label'},
        {key: 'type', title: this.$t('page.type'), width: 125},
        {key: 'value', title: this.$t('page.variablevalue')},
        {key: 'isEmpty', width: 108}, {key: 'remove', width: 32}
      ];
    }
  }
};
</script>
<style scoped>
.editor-toolbar {display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}
.parameter-editor {min-height:360px}
.editor-toolbar ::v-deep .ivu-radio-group-button {padding:3px;border-radius:6px;background:var(--opbg-color,#f4f5f8)}
.editor-toolbar ::v-deep .ivu-radio-wrapper {border:0;border-radius:4px;background:transparent;box-shadow:none;line-height:28px;height:28px;padding:0 18px}
.editor-toolbar ::v-deep .ivu-radio-wrapper::before,.editor-toolbar ::v-deep .ivu-radio-wrapper::after {display:none}
.editor-toolbar ::v-deep .ivu-radio-wrapper-checked {background:var(--primary-grey,#e6f2ff);color:var(--primary-color,#1677ff);box-shadow:none}
.text-help {line-height:24px;margin-bottom:12px}
.parameter-text ::v-deep textarea {height:300px;font-family:monospace;line-height:22px}
.empty-switch {display:flex;align-items:center;gap:6px;white-space:nowrap}
button {border:0;padding:0;background:transparent;font:inherit;cursor:pointer}
</style>
