<template>
  <div>
    <TsDialog v-bind="dialogSetting" @on-ok="okDialog" @on-close="closeDialog">
      <template v-slot>
        <TsFormItem label="链接类型" required>
          <TsFormRadio v-model="formData.linkType" :data-list="linkTypeList"></TsFormRadio>
        </TsFormItem>
        <TsFormItem
          v-if="formData.linkType === 'outer'"
          label="显示文本"
          required
          class="mt-md"
        >
          <TsFormInput
            ref="nameInput"
            v-model="outerLinkData.name"
            border="border"
            placeholder="请输入显示文本"
            :validate-list="['required']"
          />
        </TsFormItem>
        <TsFormItem
          v-if="formData.linkType === 'outer'"
          label="跳转地址"
          required
          class="mt-md"
        >
          <TsFormInput
            ref="urlInput"
            v-model="outerLinkData.url"
            border="border"
            placeholder="粘贴或输入外链地址"
            :validate-list="['required']"
          />
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
          <TsFormRadio v-model="outerLinkData.target" :data-list="targetList"></TsFormRadio>
        </TsFormItem>
      </template>
    </TsDialog>
  </div>
</template>

<script>
import { getInnerKnowledgeHref } from '../../../../../utils/link-utils.js';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  data() {
    return {
      formData: {
        linkType: 'outer'
      },
      outerLinkData: {
        name: '',
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
        isShow: true,
        title: '设置超链接',
        type: 'modal',
        width: 'small'
      }
    };
  },
  methods: {
    okDialog() {
      if (!this.valid()) {
        return false;
      }
      const linkInfo = this.getLinkInfo();
      this.$emit('close', {
        commandName: 'link',
        options: {
          // 外链和内链分支只输出统一命令字段，后续接口格式调整可在 command 或 adapter 处转换。
          linkText: linkInfo.text || linkInfo.url,
          linkUrl: linkInfo.url,
          target: this.outerLinkData.target || '_blank',
          linkType: this.formData.linkType,
          knowledgeDocumentId: this.innerLinkData.knowledgeDocumentId,
          operationType: 'addLink'
        }
      });
    },
    closeDialog() {
      this.$emit('close');
    },
    handleInnerLinkChange(value, valueObject, selectItem) {
      this.innerLinkItem = selectItem || valueObject || null;
    },
    getLinkInfo() {
      if (this.formData.linkType === 'inner') {
        return {
          url: this.getInnerLinkUrl(this.innerLinkData.knowledgeDocumentId),
          text: this.getInnerLinkText()
        };
      }
      return {
        url: this.outerLinkData.url,
        text: this.outerLinkData.name
      };
    },
    getInnerLinkText() {
      const item = this.innerLinkItem || {};
      return item.text || item.title || item.name || '';
    },
    getInnerLinkUrl(knowledgeDocumentId) {
      return getInnerKnowledgeHref(knowledgeDocumentId);
    },
    valid() {
      const inputList = this.formData.linkType === 'inner'
        ? [this.$refs.innerLinkInput]
        : [this.$refs.nameInput, this.$refs.urlInput];
      return inputList.every(input => {
        return !input || typeof input.valid !== 'function' || input.valid();
      });
    }
  },
  computed: {
    innerLinkParams() {
      return {
        keyword: this.outerLinkData.name || '',
        defaultValue: this.innerLinkData.knowledgeDocumentId ? [this.innerLinkData.knowledgeDocumentId] : []
      };
    }
  },
  watch: {
    'formData.linkType'(linkType) {
      if (linkType === 'inner') {
        // 内链切换时重建选择器，让旧编辑器的关键词搜索接口重新按当前文本加载候选并回显。
        this.innerSelectKey += 1;
      }
    }
  }
};
</script>
