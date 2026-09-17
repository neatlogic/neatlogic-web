import { isNestedSelector, loadAllMatched, queryIdentity, loadMatrixPage, mapMatrixRows } from './nested-selector-utils.js';
import tableValidation from '../common/table-mixin.js';
import { clone, selectorContext, extraContext } from './nested-selector-reactions.js';

const cancelled = () => Object.assign(new Error('Cancelled'), { name: 'AbortError' });
// 父表持有各行、列的状态与查询队列，单元格翻页卸载后仍可处理联动和完整保存。
// 扩展保存策略时，需同步检查状态转换、查询调度、适配组件展示、校验和提交过滤。
export default {
  data() { return { nestedSelectorStates: {} }; },
  beforeDestroy() {
    Object.values(this.nestedSelectorStates).forEach(state => this.cancelNestedSelector(state));
  },
  methods: {
    // 协调行增删、外部赋值和依赖变化；由快照、清空暂停及有效状态共同决定是否查询。
    syncNestedSelectors(requests) {
      if (this.mode.includes('edit')) return;
      const keys = new Set(requests.map(item => item.key));
      Object.keys(this.nestedSelectorStates).forEach(key => {
        if (!keys.has(key)) { this.cancelNestedSelector(this.nestedSelectorStates[key]); this.$delete(this.nestedSelectorStates, key); }
      });
      requests.forEach(request => {
        let state = this.nestedSelectorStates[request.key];
        const initial = !state;
        if (!state) {
          // 已有数组（包括空数组）作为历史快照，副本与当前值隔离，避免编辑修改历史展示数据。
          const snapshot = request.column.config.saveData !== false && Array.isArray(request.observedValue);
          // snapshot 控制历史展示；pausedByClear 阻止自动回填；pendingFilterReset 记录阻塞期间待执行的清空。
          // requestVersion 淘汰旧请求，valueVersion 防止请求覆盖后续赋值，viewVersion 用于重新挂载候选列表。
          state = { key: request.key, row: request.row, column: request.column, identity: request.identity,
            filter: request.filter, inputs: request.inputs, effective: request.effective, ready: request.ready, invalid: request.invalid,
            snapshot, snapshotRows: snapshot ? clone(request.observedValue) : [], results: [],
            status: 'idle', pendingFilterReset: false, error: '', browseError: '', pausedByClear: false, blocked: false,
            requestVersion: 0, valueVersion: 0, viewVersion: 0, controller: null, browseControllers: [],
            currentValue: clone(request.observedValue), validationErrors: [] };
          state.loadPage = (params, options) => this.loadNestedPage(state, params, options);
          this.$set(this.nestedSelectorStates, request.key, state);
        }
        const queryChanged = state.identity !== request.identity;
        const becameReady = !state.ready && request.ready;
        const inputsChanged = !this.$utils.isSame(state.inputs, request.inputs);
        state.row = request.row;
        state.column = request.column;
        if (!this.$utils.isSame(state.filter, request.filter)) state.filter = request.filter;
        if (inputsChanged) state.inputs = request.inputs;
        if (!this.$utils.isSame(state.effective, request.effective)) state.effective = request.effective;
        state.ready = request.ready;
        state.invalid = request.invalid;
        if (!initial && !this.$utils.isSame(state.currentValue, request.observedValue)) {
          this.applyNestedValue(state.key, request.observedValue, request.observedValue == null || !request.observedValue.length ? 'clear' : 'external');
        }
        // 只读的勾选策略保留当前选择；全部匹配策略仍允许条件驱动的自动更新。
        const preserveSelection = state.effective.readonly && state.column.config.saveData !== false && state.column.config.saveMode !== 'allMatched';
        const blocked = state.effective.hidden || state.effective.masked || state.effective.disabled;
        const resumed = state.blocked && !blocked;
        if (blocked && !state.blocked) this.cancelNestedSelector(state);
        state.blocked = blocked;
        if (queryChanged) {
          state.identity = request.identity;
          this.cancelNestedSelector(state);
          // 保留只读选择及父表只读/禁用时的快照；退出快照后，条件回到初始值也不恢复历史数据。
          if (!preserveSelection && !(state.snapshot && (this.readonly || this.disabled))) {
            state.snapshot = false;
            state.pausedByClear = false;
            state.results = [];
            state.error = '';
            if (state.column.config.saveData !== false) {
              if (blocked) state.pendingFilterReset = true;
              else this.commitNestedValue(state, []);
            }
          }
        }
        if (resumed && state.pendingFilterReset) { state.pendingFilterReset = false; if (!preserveSelection) this.commitNestedValue(state, []); }
        // 同次更新中联动清空优先于条件刷新；仅依赖值变化时执行，避免翻页重复清空。
        if (!initial && inputsChanged && request.clear) this.applyNestedValue(state.key, null, 'clear');
        if (!state.ready && !state.snapshot) {
          this.cancelNestedSelector(state);
          if (state.column.config.saveData !== false && !preserveSelection && !blocked && !state.pausedByClear && state.currentValue?.length) this.commitNestedValue(state, []);
        }
        if (!blocked && !state.snapshot && !state.pausedByClear && state.ready &&
          state.column.config.saveData !== false && state.column.config.saveMode === 'allMatched' &&
          (initial || queryChanged || resumed || becameReady) && state.status !== 'loading') this.loadNestedSelector(state);
      });
    },
    cancelNestedSelector(state) {
      state.requestVersion += 1;
      state.controller?.abort();
      state.browseControllers.forEach(controller => controller.abort());
      state.browseControllers = [];
      if (state.status === 'loading') state.status = 'idle';
    },
    // 完整加载与浏览请求共用父表队列，最多并发 4 个；首次发请求才创建队列。
    scheduleNestedRequest(run, signal) {
      if (!this._nestedQueue) this._nestedQueue = { active: 0, jobs: [] };
      return new Promise((resolve, reject) => {
        if (signal.aborted) return reject(cancelled());
        const job = { run, signal, resolve, reject, abort: () => reject(cancelled()) };
        signal.addEventListener('abort', job.abort, { once: true });
        this._nestedQueue.jobs.push(job);
        this.pumpNestedRequests();
      });
    },
    pumpNestedRequests() {
      const queue = this._nestedQueue;
      if (!queue || this._isDestroyed || this._isBeingDestroyed) return;
      while (queue.active < 4 && queue.jobs.length) {
        const job = queue.jobs.shift();
        if (job.signal.aborted) { job.signal.removeEventListener('abort', job.abort); continue; }
        queue.active += 1;
        Promise.resolve().then(() => { if (job.signal.aborted) throw cancelled(); return job.run(); }).then(job.resolve, job.reject).finally(() => {
          job.signal.removeEventListener('abort', job.abort);
          queue.active -= 1;
          this.pumpNestedRequests();
        });
      }
    },
    // 当前提交值与行数据分别复制；不保存列不回写父行。
    commitNestedValue(state, value) {
      state.currentValue = clone(value);
      if (state.column.config.saveData !== false) this.$set(state.row, state.column.uuid, clone(value));
    },
    // selection 保留跨页选择；clear 取消旧请求并暂停回填；external 接收外部赋值。
    // 查询完成走 commitNestedValue，避免把自动保存误当成人工修改。
    applyNestedValue(key, value, source = 'external') {
      const state = this.nestedSelectorStates[key];
      if (!state || state.column.config.saveData === false) return;
      if (source !== 'selection') { this.cancelNestedSelector(state); state.viewVersion += 1; }
      state.valueVersion += 1;
      state.snapshot = false;
      state.pausedByClear = source === 'clear';
      state.error = '';
      state.status = 'ready';
      state.results = clone(value) || [];
      this.commitNestedValue(state, value);
    },
    async loadNestedSelector(state) {
      this.cancelNestedSelector(state);
      const requestVersion = state.requestVersion;
      const valueVersion = state.valueVersion;
      const controller = new AbortController();
      state.controller = controller;
      state.status = 'loading';
      state.error = '';
      try {
        const rows = await loadAllMatched((params, options) => this.scheduleNestedRequest(() => this.$api.framework.matrix.getNewMatrixDataForTable(params, options), options.signal), clone(state.column.config), clone(state.filter), controller.signal);
        // 全量请求成功后才整体写入；同时核对取消信号、请求/值版本及行状态是否仍存在。
        if (rows && !controller.signal.aborted && state.requestVersion === requestVersion && state.valueVersion === valueVersion && this.nestedSelectorStates[state.key] === state) {
          // 手动刷新保留仍然匹配记录的扩展属性，与外部表格选择的行为一致。
          const currentRows = new Map((state.currentValue || []).map(row => [row.uuid, row]));
          const extraColumns = (state.column.config.dataConfig || []).filter(column => column.isExtra);
          rows.forEach(row => {
            const current = currentRows.get(row.uuid);
            extraColumns.forEach(column => {
              if (current && Object.prototype.hasOwnProperty.call(current, column.uuid)) row[column.uuid] = clone(current[column.uuid]);
            });
          });
          state.results = rows;
          state.status = 'ready';
          this.commitNestedValue(state, rows);
        }
      } catch (error) {
        if (!controller.signal.aborted && this.nestedSelectorStates[state.key] === state) { state.status = 'error'; state.error = this.$t('form.nestedSelector.loadFailed'); }
      }
    },
    // 接入公共列表的数据提供接口：统一排队和错误状态，返回已映射字段的分页响应。
    async loadNestedPage(state, params, options = {}) {
      const controller = new AbortController();
      const abort = () => controller.abort();
      if (options.signal?.aborted) controller.abort();
      options.signal?.addEventListener('abort', abort, { once: true });
      state.browseControllers.push(controller);
      const requestVersion = state.requestVersion;
      state.browseError = '';
      try {
        const result = await this.scheduleNestedRequest(() => loadMatrixPage((query, settings) => this.$api.framework.matrix.getNewMatrixDataForTable(query, settings), params, controller.signal), controller.signal);
        if (controller.signal.aborted || requestVersion !== state.requestVersion) throw cancelled();
        return { ...result, Return: { ...result.Return, tbodyList: mapMatrixRows(result.Return.tbodyList, state.column.config) } };
      } catch (error) {
        if (!controller.signal.aborted) state.browseError = this.$t('form.nestedSelector.loadFailed');
        throw error;
      } finally {
        options.signal?.removeEventListener('abort', abort);
        const index = state.browseControllers.indexOf(controller);
        if (index >= 0) state.browseControllers.splice(index, 1);
      }
    },
    retryNestedSelector(key) {
      const state = this.nestedSelectorStates[key];
      if (state?.browseError && !state.blocked) { state.browseError = ''; state.viewVersion += 1; return; }
      if (state?.status === 'error' && !state.blocked && state.ready) this.loadNestedSelector(state);
      else this.editNestedSelector(key);
    },
    // 手动刷新或重新选择解除快照/清空暂停；搜索与翻页不会调用此入口。
    editNestedSelector(key) {
      const state = this.nestedSelectorStates[key];
      if (!state || state.effective.readonly || state.blocked) return;
      this.cancelNestedSelector(state);
      state.snapshot = false;
      state.pausedByClear = false;
      state.viewVersion += 1;
      state.error = '';
      state.browseError = '';
      if (state.ready && state.column.config.saveData !== false && state.column.config.saveMode === 'allMatched') this.loadNestedSelector(state);
    },
    // 扩展属性仅修改提交副本，保留历史快照和查询状态；不触发矩阵重载。
    changeNestedExtra({ key, rowUuid, attrUuid, value }) {
      const state = this.nestedSelectorStates[key];
      if (!state || state.column.config.saveData === false || state.blocked || state.effective.readonly || state.status === 'loading') return;
      const column = (state.column.config.dataConfig || []).find(item => item.uuid === attrUuid && item.isExtra);
      const row = (state.currentValue || []).find(item => item.uuid === rowUuid);
      if (!column || !row) return;
      const { effective } = extraContext(this, state, row, column);
      if (effective.hidden || effective.masked || effective.disabled || effective.readonly || this.$utils.isSame(row[attrUuid], value)) return;
      const rows = clone(state.currentValue);
      rows.find(item => item.uuid === rowUuid)[attrUuid] = clone(value);
      state.valueVersion += 1;
      this.commitNestedValue(state, rows);
      state.results = clone(rows);
    },
    getNestedRecordErrors(state) {
      const validator = { ...tableValidation.methods, $utils: this.$utils, $t: (...args) => this.$t(...args) };
      const columns = state.column.config.dataConfig || [];
      const pageSize = state.column.config.pageSize || 10;
      const errors = [];
      const uniqueRows = [];
      (state.currentValue || []).forEach((row, index) => {
        const uniqueRow = clone(row);
        columns.filter(column => column.isExtra).forEach(column => {
          const { effective } = extraContext(this, state, row, column);
          if (!column.isPC || effective.hidden || effective.masked || effective.disabled || effective.readonly) {
            delete uniqueRow[column.uuid];
            const uniqueColumns = state.column.config.uniqueRuleConfig || [];
            if (uniqueColumns.includes(column.uuid)) uniqueColumns.forEach(uuid => { delete uniqueRow[uuid]; });
            return;
          }
          const config = column.config || {};
          const validateList = [];
          if (effective.required) validateList.push('required');
          if (config.validate) validateList.push(config.validate);
          if (config.regex && this.isValidRegex(config.regex)) validateList.push({ name: 'regex', pattern: config.regex, message: config.regexMessage });
          const childPage = Math.floor(index / pageSize) + 1;
          const fieldErrors = validator._handleTbodyValidErrorInfoList({ row,
            mergedFormData: { ...this.formData, ...state.row, ...row }, pageCount: childPage,
            columnAttrConfig: { key: column.uuid, title: column.label }, formItem: state.column,
            validateMap: { [column.uuid]: { validateList } }, errorList: [] });
          // 公共逐元素格式校验对空数组不迭代，必填仍需判断整个字段是否为空。
          if (!fieldErrors.length && effective.required && this.$utils.isEmpty(row[column.uuid])) {
            fieldErrors.push({ error: this.$t('page.fieldcompleterequired', { label: state.column.label, page: childPage, attr: column.label }) });
          }
          fieldErrors.forEach(error => errors.push({ ...error, childRowUuid: row.uuid, childAttrUuid: column.uuid,
            childPage, error: this.$t('form.nestedSelector.rowError', { row: index + 1, column: column.label, message: error.error }) }));
        });
        uniqueRows.push(uniqueRow);
      });
      validator.validTableAttrUnique({ pageSize, formItem: state.column, config: state.column.config, tbodyList: uniqueRows })
        .forEach(error => errors.push({ ...error, childAttrUuid: error.attrUuid || error.uuid, childPage: error.errorPageList?.[0] || 1 }));
      return errors;
    },
    // 读取父表全部行的状态并复用表格校验；此处不发请求、不回填，清空后的值直接参与适用校验。
    validNestedSelectors() {
      const errors = [];
      Object.values(this.nestedSelectorStates).forEach(state => {
        const effective = state.effective;
        if (state.column.config.saveData === false || effective.hidden || effective.masked || effective.disabled) return;
        let message = '';
        if (!state.snapshot && state.status === 'loading') message = this.$t('form.nestedSelector.loading');
        else if (!state.snapshot && state.status === 'error') message = state.error;
        else if (!effective.readonly && effective.required && !state.currentValue?.length) message = state.ready ? this.$t('form.placeholder.pleaseselect', { target: this.$t('page.data') }) : this.$t('form.nestedSelector.filterRequired');
        const childErrors = !effective.readonly && state.currentValue?.length ? this.getNestedRecordErrors(state) : [];
        const index = this.tbodyList.findIndex(row => row.uuid === state.row.uuid);
        childErrors.forEach(error => errors.push({ ...error, uuid: this.formItem.uuid, attrUuid: state.column.uuid,
          rowUuid: state.row.uuid, errorPageList: [Math.floor(index / this.tablePageConfig.pageSize) + 1],
          error: this.$t('form.nestedSelector.rowError', { row: index + 1, column: state.column.label, message: error.error }) }));
        if (message) {
          errors.push({ uuid: this.formItem.uuid, attrUuid: state.column.uuid, rowUuid: state.row.uuid,
            errorPageList: [Math.floor(index / this.tablePageConfig.pageSize) + 1],
            error: this.$t('form.nestedSelector.rowError', { row: index + 1, column: state.column.label, message }) });
        }
      });
      return errors;
    }
  },
  computed: {
    nestedSelectorColumns() { return (this.config.dataConfig || []).filter(isNestedSelector); },
    nestedSelectorRequests() {
      if (!this.nestedSelectorColumns.length) return [];
      const definitions = [...(this.config.dataConfig || []), ...this.effectiveReferenceFormItemList];
      return this.tbodyList.flatMap(row => this.nestedSelectorColumns.map(column => {
        const key = row.uuid + '_' + column.uuid;
        const previous = this.nestedSelectorStates[key];
        const context = selectorContext(this, column, row, definitions, previous?.inputs || {});
        return { key, row, column, ...context, identity: queryIdentity(column.config, context.filter), observedValue: row[column.uuid] };
      }));
    }
  },
  watch: {
    nestedSelectorRequests: { immediate: true, handler(requests) { this.syncNestedSelectors(requests); } }
  }
};
