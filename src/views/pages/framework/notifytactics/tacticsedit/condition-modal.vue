<template>
  <div>
    <ActionEdit
      v-if="isShow"
      ref="actionEditor"
      :policyId="policyId"
      :trigger="trigger"
      :config="config"
      :activeTitle="activeTitle"
      :authorityConfig="authorityConfig"
      @close="close"
      @edit-template="editTemplate"
    ></ActionEdit>
    <SettingTemplate
      v-if="templateDialog"
      :id="policyId"
      :handler="policy.handler"
      :triggerList="policy.config.triggerList"
      :defaultTemplateId="templateId"
      showTemplate="edit"
      @closeEdit="closeTemplate"
    ></SettingTemplate>
  </div>
</template>
<script>
export default {
  components: {
    ActionEdit: () => import('../components/edit/action-edit.vue'),
    SettingTemplate: () => import('./setting/setting-template.vue')
  },
  props: {
    policyId: { type: [Number, String], default: null },
    isShow: { type: Boolean, default: false },
    config: { type: Object, default: null },
    trigger: { type: String, default: null },
    authorityConfig: { type: Object, default: null },
    activeTitle: {
      type: String,
      default() {
        return this.$t('dialog.title.addtarget', { target: this.$t('page.actions') });
      }
    }
  },
  data() {
    return { templateDialog: false, templateId: null, policy: null, requestSerial: 0 };
  },
  beforeDestroy() {
    this.requestSerial++;
  },
  methods: {
    // 兼容旧入口的关闭与保存事件，成功时仍然先关闭再刷新。
    close(needRefresh) {
      this.requestSerial++;
      this.templateDialog = false;
      this.$emit('close', false);
      if (needRefresh) this.$emit('save');
    },
    // 兼容独立宿主的模板编辑，不再注入通知策略整页实例。
    async editTemplate(id) {
      const serial = ++this.requestSerial;
      try {
        const res = await this.$api.framework.tactics.editNotify({ id: this.policyId });
        if (serial !== this.requestSerial || !this.isShow) return;
        if (!res || res.Status !== 'OK') throw new Error('notify policy load failed');
        this.policy = res.Return;
        this.templateId = id || null;
        this.templateDialog = true;
      } catch (error) {
        if (serial === this.requestSerial) this.$Message.error(this.$t('message.framework.notifyloadfailed'));
      }
    },
    // 模板编辑返回时只更新选项，保留当前动作草稿。
    closeTemplate() {
      this.templateDialog = false;
      if (this.$refs.actionEditor) this.$refs.actionEditor.refreshTemplates();
    }
  }
};
</script>
