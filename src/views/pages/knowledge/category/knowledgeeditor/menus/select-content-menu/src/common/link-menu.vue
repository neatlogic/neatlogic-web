<template>
  <div class="hyper-link-box">
    <Tooltip
      placement="top"
      :transfer="true"
      theme="light"
      max-width="300"
    >
      <span
        :class="[icon, activeMenuClassName('link')]"
        :style="iconStyle"
        @click.stop="openLinkDialog"
      ></span>
      <div slot="content">
        <div v-for="(item, index) in tipContentList" :key="index">{{ item }}</div>
      </div>
    </Tooltip>

    <TsDialog v-bind="dialogSetting" @on-ok="okDialog" @on-close="closeDialog">
      <template v-slot>
        <TsFormItem label="链接类型" required>
          <TsFormRadio
            v-model="linkType"
            :data-list="linkTypeList"
          ></TsFormRadio>
        </TsFormItem>
        <TsFormItem
          v-if="linkType === 'outer'"
          label="跳转地址"
          required
          class="mt-md"
        >
          <TsFormInput
            ref="linkUrlInput"
            v-model="outerLinkData.url"
            border="border"
            placeholder="粘贴或输入链接"
            :validate-list="['required']"
          ></TsFormInput>
        </TsFormItem>
        <TsFormItem
          v-else
          label="内部文档"
          required
          class="mt-md"
        >
          <TsFormSelect
            :key="innerSelectKey"
            ref="innerLinkInput"
            v-model="innerLinkData.knowledgeDocumentId"
            border="border"
            placeholder="请选择内部知识文档"
            url="api/rest/knowledge/document/list/forinternallink"
            root-name="list"
            transfer
            search
            :params="innerLinkParams"
            :validate-list="['required']"
            @on-change="handleInnerLinkChange"
          ></TsFormSelect>
        </TsFormItem>
        <TsFormItem label="打开方式" class="mt-md">
          <TsFormRadio
            v-model="outerLinkData.target"
            :data-list="targetList"
          ></TsFormRadio>
        </TsFormItem>
      </template>
      <template v-slot:footer>
        <Button type="primary" :disabled="!canSubmitLink" @click="okDialog">确认</Button>
      </template>
    </TsDialog>
  </div>
</template>

<script>
import mixin from '@/views/pages/knowledge/category/knowledgeeditor/menus/select-content-menu/src/mixin.js';
import { getInnerKnowledgeHref, getKnowledgeDocumentIdFromHref, isInnerKnowledgeLink } from '../../../../utils/link-utils.js';

export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  mixins: [mixin],
  props: {
    icon: {
      type: String,
      default: 'tsfont-attachment'
    },
    command: {
      type: String,
      default: 'link'
    },
    tipContentList: {
      type: Array,
      default: () => ['超链接']
    }
  },
  data() {
    return {
      linkType: 'outer',
      outerLinkData: {
        url: '',
        target: '_blank'
      },
      innerLinkData: {
        knowledgeDocumentId: null
      },
      innerLinkItem: null,
      innerSelectKey: 0,
      linkTypeList: [
        {
          text: '外部链接',
          value: 'outer'
        },
        {
          text: '内部链接',
          value: 'inner'
        }
      ],
      targetList: [
        {
          text: '新窗口',
          value: '_blank'
        },
        {
          text: '当前窗口',
          value: '_self'
        }
      ],
      dialogSetting: {
        title: '设置链接',
        width: '400px',
        type: 'modal',
        isShow: false
      }
    };
  },
  methods: {
    openLinkDialog() {
      const attrs = this.editorData?.getAttributes('link') || {};
      this.linkType = isInnerKnowledgeLink(attrs.href, attrs.class) ? 'inner' : 'outer';
      this.outerLinkData.url = this.linkType === 'outer' ? attrs.href || '' : '';
      this.outerLinkData.target = attrs.target || '_blank';
      this.innerLinkData.knowledgeDocumentId = this.linkType === 'inner' ? getKnowledgeDocumentIdFromHref(attrs.href) : null;
      this.innerSelectKey += 1;
      this.dialogSetting.isShow = true;
    },
    closeDialog() {
      this.linkType = 'outer';
      this.outerLinkData.url = '';
      this.outerLinkData.target = '_blank';
      this.innerLinkData.knowledgeDocumentId = null;
      this.innerLinkItem = null;
      this.dialogSetting.isShow = false;
    },
    okDialog() {
      const input = this.linkType === 'inner' ? this.$refs.innerLinkInput : this.$refs.linkUrlInput;
      if (input && typeof input.valid === 'function' && !input.valid()) {
        return false;
      }
      const linkUrl = this.linkType === 'inner'
        ? this.getInnerLinkUrl(this.innerLinkData.knowledgeDocumentId)
        : this.outerLinkData.url;
      this.$emit('menu-item-selected', {
        commandName: this.command,
        options: {
          linkUrl,
          linkText: this.selectedText,
          target: this.outerLinkData.target || '_blank',
          linkType: this.linkType,
          knowledgeDocumentId: this.innerLinkData.knowledgeDocumentId,
          operationType: 'replaceLink',
          ...(this.nodeConfig || {})
        }
      });
      this.closeDialog();
    },
    handleInnerLinkChange(value, valueObject, selectItem) {
      this.innerLinkItem = selectItem || valueObject || null;
    },
    getInnerLinkUrl(knowledgeDocumentId) {
      return getInnerKnowledgeHref(knowledgeDocumentId);
    }
  },
  computed: {
    canSubmitLink() {
      return this.linkType === 'inner' ? !!this.innerLinkData.knowledgeDocumentId : !!this.outerLinkData.url;
    },
    innerLinkParams() {
      return {
        keyword: this.selectedText || '',
        defaultValue: this.innerLinkData.knowledgeDocumentId ? [this.innerLinkData.knowledgeDocumentId] : []
      };
    }
  },
  watch: {
    linkType(linkType) {
      if (linkType === 'inner') {
        // 内链切换时重建选择器，保证旧接口按选中文本搜索并回显当前内部文档
        this.innerSelectKey += 1;
      }
    }
  }
};
</script>

<style lang="less" scoped>
</style>
