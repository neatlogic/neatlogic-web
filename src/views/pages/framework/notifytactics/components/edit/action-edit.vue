<template>
  <TsDialog v-bind="dialogConfig" @on-close="close(false)">
    <Loading :loadingShow="loading" type="fix"></Loading>
    <div v-if="loadError" class="text-error">
      {{ $t('message.framework.notifyloadfailed') }}
      <span class="tsfont-refresh text-action ml-md" @click="loadData">{{ $t('page.refresh') }}</span>
    </div>
    <div v-if="ready">
      <ConditionEdit
        ref="conditionEditor"
        :value="localConfig.conditionConfig"
        :conditionList="conditionList"
        :disabled="isSaving"
      ></ConditionEdit>
      <Divider></Divider>
      <h4 class="mb-md require-label">{{ $t('page.actions') }}</h4>
      <div v-for="(channel, index) in channelList" :key="index" class="radius-md bg-op padding-md mb-md">
        <TsFormCheckbox
          v-model="channel.selected"
          :dataList="[{ value: channel.value, text: channel.text }]"
          :disabled="isSaving"
        ></TsFormCheckbox>
        <div v-if="channel.selected.length" class="mt-md">
          <div v-if="!channel.available" class="text-error mb-md">{{ $t('message.framework.notifymetadatamissing') }}</div>
          <component
            :is="channelEditors[channel.value] || genericChannel"
            :ref="'channel-' + index"
            :value="channel.config"
            :policyId="policyId"
            :authorityConfig="receiverAuthority"
            :disabled="isSaving"
            @change="channel.config = $event"
            @edit-template="editTemplate"
          ></component>
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <Button :disabled="isSaving" @click="close(false)">{{ $t('page.cancel') }}</Button>
      <Button
        type="primary"
        :disabled="!ready || loading"
        :loading="isSaving"
        @click="save"
      >{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import channelEditors from './index.js';
import GenericChannel from './channel-base.vue';

export default {
  components: {
    ConditionEdit: () => import('./condition-edit.vue'),
    TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox.vue'),
    GenericChannel,
    ...channelEditors
  },
  props: {
    policyId: { type: [Number, String], required: true },
    trigger: { type: String, required: true },
    config: { type: Object, default: null },
    activeTitle: { type: String, default: '' },
    authorityConfig: { type: Object, default: null }
  },
  data() {
    return {
      dialogConfig: { title: this.activeTitle, width: 'large', isShow: true, maskClose: false },
      localConfig: this.$utils.deepClone(this.config || { conditionConfig: {}, actionList: [] }),
      channelEditors,
      genericChannel: GenericChannel,
      channelList: [],
      conditionList: [],
      receiverAuthority: {},
      loading: false,
      loadError: false,
      ready: false,
      isSaving: false,
      requestSerial: 0,
      closed: false
    };
  },
  created() {
    this.loadData();
  },
  beforeDestroy() {
    this.closed = true;
    this.requestSerial++;
  },
  methods: {
    // 元数据全部成功后才初始化草稿；旧请求或已关闭弹窗的响应直接忽略。
    async loadData() {
      const serial = ++this.requestSerial;
      this.loading = true;
      this.ready = false;
      this.loadError = false;
      try {
        const api = this.$api.framework.tactics;
        const results = await Promise.all([
          api.getConditionoption({ policyId: this.policyId }),
          api.handlerList(),
          api.editTriggerConfig({ policyId: this.policyId, trigger: this.trigger })
        ]);
        if (this.closed || serial !== this.requestSerial) return;
        if (results.some(res => !res || res.Status !== 'OK')) throw new Error('notify metadata load failed');
        this.conditionList = (results[0].Return.conditonOptionList || []).map(item => ({ ...item, handler: item.type === 'form' ? item.handler : 'form' + item.controller }));
        this.receiverAuthority = results[2].Return.authorityConfig || this.authorityConfig || {};
        const handlers = results[1].Return || [];
        // 先保留历史渠道及顺序，再补充未选渠道，避免过滤导致配置丢失。
        this.channelList = (this.localConfig.actionList || []).map(action => {
          const handler = handlers.find(item => item.value === action.notifyHandler);
          return {
            value: action.notifyHandler,
            text: handler ? handler.text : action.notifyHandlerName || action.notifyHandler,
            available: !!handler,
            selected: [action.notifyHandler],
            config: this.$utils.deepClone(action)
          };
        });
        handlers.forEach(handler => {
          if (!this.channelList.some(item => item.value === handler.value)) {
            this.channelList.push({
              value: handler.value,
              text: handler.text,
              available: true,
              selected: [],
              config: { notifyHandler: handler.value, templateId: null, receiverList: [] }
            });
          }
        });
        this.ready = true;
      } catch (error) {
        if (!this.closed && serial === this.requestSerial) this.loadError = true;
      } finally {
        if (!this.closed && serial === this.requestSerial) this.loading = false;
      }
    },
    // 收集真实组件草稿；保存锁包含异步校验，防止重复创建动作。
    async save() {
      if (!this.ready || this.loading || this.isSaving || this.closed) return;
      this.isSaving = true;
      const serial = this.requestSerial;
      try {
        const selected = this.channelList.filter(channel => channel.selected.length);
        if (!selected.length) {
          this.$Message.error(this.$t('form.placeholder.pleaseselect', { target: this.$t('page.actions') }));
          return;
        }
        if (selected.some(channel => !channel.available)) {
          this.$Message.error(this.$t('message.framework.notifymetadatamissing'));
          return;
        }
        const condition = this.$refs.conditionEditor;
        const editors = this.getSelectedEditors();
        // 校验前后比较完整草稿，条件或渠道在等待期间变化时要求重新确认。
        const snapshot = this.getDraftSnapshot();
        if (!condition || editors.length !== selected.length || !(await condition.valid())) return;
        let valid = true;
        for (const editor of editors) {
          if (!(await editor.valid())) valid = false;
        }
        if (!valid || this.closed || serial !== this.requestSerial) return;
        if (snapshot !== this.getDraftSnapshot()) {
          this.$Message.error(this.$t('message.framework.notifydraftchanged'));
          return;
        }
        const data = {
          policyId: this.policyId,
          trigger: this.trigger,
          conditionConfig: condition.getConfig(),
          actionList: editors.map(editor => {
            const channel = editor.getConfig();
            return { notifyHandler: channel.notifyHandler, templateId: channel.templateId, receiverList: channel.receiverList };
          })
        };
        if (this.localConfig.id != null) data.id = this.localConfig.id;
        const res = await this.$api.framework.tactics.saveHandlerNotify(data);
        if (this.closed || serial !== this.requestSerial) return;
        if (!res || res.Status !== 'OK') throw new Error('notify action save failed');
        this.$Message.success(this.$t('message.savesuccess'));
        this.close(true);
      } catch (error) {
        if (!this.closed && serial === this.requestSerial) this.$Message.error(this.$t('message.savefailed'));
      } finally {
        if (!this.closed) this.isSaving = false;
      }
    },
    // 按原渠道顺序取得组件，避免取消再勾选导致 Vue 的 ref 数组顺序变化。
    getSelectedEditors() {
      const editors = [];
      this.channelList.forEach((channel, index) => {
        if (channel.selected.length) {
          const reference = this.$refs['channel-' + index];
          const editor = Array.isArray(reference) ? reference[0] : reference;
          if (editor) editors.push(editor);
        }
      });
      return editors;
    },
    // 只比较保存字段，模板复核更新展示名称不算草稿变化。
    getDraftSnapshot() {
      const condition = this.$refs.conditionEditor;
      const channels = this.getSelectedEditors().map(editor => {
        const config = editor.getConfig();
        return { notifyHandler: config.notifyHandler, templateId: config.templateId, receiverList: config.receiverList };
      });
      return JSON.stringify([condition && condition.getConfig(), this.channelList.map(channel => channel.selected), channels]);
    },
    // 模板关闭后只刷新选项，不重新初始化动作草稿。
    refreshTemplates() {
      this.getSelectedEditors().forEach(editor => editor.refreshTemplates());
    },
    // 模板编辑由宿主负责打开，动作组件不依赖整页实例。
    editTemplate(id) {
      this.$emit('edit-template', id);
    },
    // 关闭使所有在途响应失效，成功时通知宿主刷新列表。
    close(needRefresh = false) {
      if (this.closed || (this.isSaving && !needRefresh)) return;
      this.closed = true;
      this.requestSerial++;
      this.$emit('close', needRefresh);
    }
  }
};
</script>
