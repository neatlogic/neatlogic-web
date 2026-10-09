<template>
  <div>
    <TsFormItem :label="$t('page.template')" :required="true" labelPosition="left">
      <TsRow :gutter="16">
        <Col :span="18">
          <TsFormSelect
            :key="templateKey"
            ref="templateSelect"
            v-model="draft.templateId"
            dynamicUrl="/api/rest/notify/policy/template/list"
            :params="templateParams"
            rootName="templateList"
            valueName="id"
            textName="name"
            :historyValue="templateHistory"
            :defaultValueIsFirst="!draft.templateId"
            :disabled="disabled"
            :validateList="required"
            :placeholder="$t('form.placeholder.pleaseselect', {target: $t('page.template')})"
            :clearable="false"
            transfer
            @on-change="changeTemplate"
          >
            <template slot="first-ul">
              <li class="tsfont-plus text-href first-slot" @click.stop="editTemplate()">{{ $t('dialog.title.createtarget', {target: $t('page.template')}) }}</li>
            </template>
          </TsFormSelect>
          <div v-if="templateError" class="text-error pt-xs">{{ $t('message.framework.notifytemplateinvalid') }}</div>
        </Col>
        <Col :span="6">
          <div class="action-group">
            <span
              v-if="draft.templateId"
              class="action-item tsfont-edit text-action"
              :title="$t('page.edit')"
              @click="editTemplate(draft.templateId)"
            ></span>
            <span
              class="action-item tsfont-refresh text-action"
              :title="$t('page.refresh')"
              @click="refreshTemplates"
            ></span>
          </div>
        </Col>
      </TsRow>
    </TsFormItem>
    <TsFormItem :label="$t('page.recipient')" :required="true" labelPosition="left">
      <UserSelect
        ref="receiverSelect"
        :value.sync="draft.receiverList"
        :groupList="authorityConfig.groupList"
        :includeList="authorityConfig.includeList"
        :excludeList="authorityConfig.excludeList"
        :validateList="required"
        :disabled="disabled"
        :placeholder="$t('form.placeholder.pleaseselect', {target: $t('page.notifyobj')})"
        transfer
      ></UserSelect>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: 'NotifyChannelEditBase',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect')
  },
  props: {
    value: {type: Object, default: () => ({})},
    policyId: {type: [Number, String], default: null},
    authorityConfig: {type: Object, default: () => ({})},
    disabled: {type: Boolean, default: false}
  },
  data() {
    return {
      draft: this.$utils.deepClone(this.value),
      templateKey: 0,
      templateError: false,
      requestVersion: 0,
      destroyed: false,
      required: [{name: 'required', message: this.$t('page.pleaseselect')}]
    };
  },
  beforeDestroy() {
    // 阻止模板校验或刷新响应在渠道被取消后继续更新草稿。
    this.destroyed = true;
    this.requestVersion++;
  },
  methods: {
    // 返回隔离的渠道草稿，切换勾选时也保留模板显示信息。
    getConfig() {
      return this.$utils.deepClone(this.draft);
    },
    // 使用选择器返回的模板名称更新历史回显，原配置不会被修改。
    changeTemplate(templateId, valueObject, selectedItem) {
      this.requestVersion++;
      this.templateError = false;
      const template = selectedItem || valueObject || {};
      if (template.name) {
        this.$set(this.draft, 'templateName', template.name);
      }
    },
    // 将模板编辑交给弹窗所有者处理，不依赖整个页面的注入对象。
    editTemplate(templateId) {
      if (this.disabled) {
        return;
      }
      this.$emit('edit-template', templateId);
    },
    // 刷新选择器及已选模板名称；模板失效也保留原 ID 供用户修正。
    async refreshTemplates() {
      if (this.disabled) {
        return;
      }
      const version = ++this.requestVersion;
      const templateId = this.draft.templateId;
      try {
        if (templateId) {
          const res = await this.$api.framework.tactics.getTemplateData({policyId: this.policyId, id: templateId});
          if (this.destroyed || version !== this.requestVersion) {
            return;
          }
          const template = res && res.Status === 'OK' && res.Return;
          this.templateError = !template || template.notifyHandler !== this.draft.notifyHandler;
          if (!this.templateError) {
            this.$set(this.draft, 'templateName', template.name);
          }
        }
      } catch (error) {
        if (!this.destroyed && version === this.requestVersion) {
          this.$Message.error(this.$t('message.framework.notifymetadatamissing'));
        }
      } finally {
        if (!this.destroyed && version === this.requestVersion) {
          this.templateKey++;
        }
      }
    },
    // 本地校验后复核模板存在且属于当前渠道，防止删除或类型变更后误保存。
    async valid() {
      const templateValid = this.$refs.templateSelect && this.$refs.templateSelect.valid();
      const receiverValid = this.$refs.receiverSelect && this.$refs.receiverSelect.valid();
      if (!templateValid || !receiverValid || !this.draft.templateId || !Array.isArray(this.draft.receiverList) || !this.draft.receiverList.length) {
        return false;
      }
      const version = ++this.requestVersion;
      const templateId = this.draft.templateId;
      const snapshot = JSON.stringify([this.draft.notifyHandler, templateId, this.draft.receiverList]);
      try {
        const res = await this.$api.framework.tactics.getTemplateData({policyId: this.policyId, id: templateId});
        // 等待期间接收人或渠道变化时，必须基于新草稿重新校验。
        if (this.destroyed || version !== this.requestVersion || snapshot !== JSON.stringify([this.draft.notifyHandler, this.draft.templateId, this.draft.receiverList])) {
          return false;
        }
        const template = res && res.Status === 'OK' && res.Return;
        this.templateError = !template || template.notifyHandler !== this.draft.notifyHandler;
        if (this.templateError) {
          this.$Message.error(this.$t('message.framework.notifytemplateinvalid'));
          return false;
        }
        this.$set(this.draft, 'templateName', template.name);
        return true;
      } catch (error) {
        if (!this.destroyed && version === this.requestVersion) {
          this.$Message.error(this.$t('message.framework.notifymetadatamissing'));
        }
        return false;
      }
    }
  },
  computed: {
    templateParams() {
      return {policyId: this.policyId, notifyHandler: this.draft.notifyHandler};
    },
    templateHistory() {
      if (!this.draft.templateId) {
        return [];
      }
      return [{id: this.draft.templateId, name: this.draft.templateName || String(this.draft.templateId)}];
    }
  },
  watch: {
    value(value) {
      // 父组件保存 change 返回值时不重置同一草稿，防止选择器反馈循环。
      if (JSON.stringify(value) !== JSON.stringify(this.draft)) {
        this.requestVersion++;
        this.draft = this.$utils.deepClone(value);
        this.templateError = false;
      }
    },
    draft: {
      deep: true,
      handler() {
        this.$emit('change', this.getConfig());
      }
    }
  }
};
</script>
