<template>
  <div
    class="link-hover-box"
    @mousedown.stop
    @pointerdown.stop
    @click.stop
  >
    <div
      :style="{
        position: 'absolute',
        left: linkHoverConfig.left + 'px',
        top: getTop
      }"
    >
      <div class="bg-op radius-sm shadow block-border flex-start padding-sm">
        <div class="href-text mr-sm">
          <TsFormInput
            ref="hrefInput"
            :value="linkHoverConfig.href"
            border="border"
            :readonly="readonly"
            :validate-list="['required']"
            @on-change="handleHrefChange"
          ></TsFormInput>
        </div>
        <Tooltip
          v-if="!readonly"
          placement="top"
          :transfer="true"
          theme="light"
          max-width="300"
          class="mr-sm"
        >
          <span class="tsfont-arrow-corner-left cursor-pointer" @click="replaceLink"></span>
          <div slot="content">
            <span>点击替换链接</span>
          </div>
        </Tooltip>
        <Tooltip
          v-if="!readonly"
          placement="top"
          :transfer="true"
          theme="light"
          max-width="300"
        >
          <span class="tsfont-unbind cursor-pointer" @click="removeLink"></span>
          <div slot="content">
            <span>移除链接</span>
          </div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import { getKnowledgeDocumentIdFromHref, isInnerKnowledgeLink } from '../../utils/link-utils.js';

export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    linkHoverConfig: {
      type: Object,
      default: () => {}
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      linkUrl: ''
    };
  },
  methods: {
    handleHrefChange(href) {
      if (this.readonly) {
        return;
      }
      this.linkUrl = href;
    },
    removeLink() {
      if (this.readonly) {
        return;
      }
      this.$emit('click-menu', {
        commandName: 'link',
        options: {
          // 由鼠标悬停时记录的链接范围精确移除当前链接，避免误删整段文本链接。
          operationType: 'removeLink',
          startPosition: this.linkHoverConfig.startPosition,
          endPosition: this.linkHoverConfig.endPosition
        }
      });
    },
    replaceLink() {
      if (this.readonly) {
        return;
      }
      const formRef = this.$refs.hrefInput;
      if (formRef && typeof formRef.valid === 'function' && !formRef.valid()) {
        return false;
      }
      const linkUrl = this.linkUrl || this.linkHoverConfig.href;
      const linkType = this.getLinkType(linkUrl);
      this.$emit('click-menu', {
        commandName: 'link',
        options: {
          linkText: this.linkHoverConfig.text,
          linkUrl,
          target: this.linkHoverConfig.target || '_blank',
          linkType,
          knowledgeDocumentId: linkType === 'inner' ? this.getKnowledgeDocumentId(linkUrl) : null,
          startPosition: this.linkHoverConfig.startPosition,
          endPosition: this.linkHoverConfig.endPosition,
          operationType: 'replaceLink'
        }
      });
    },
    getLinkType(href) {
      if (isInnerKnowledgeLink(href, this.linkHoverConfig.class)) {
        return 'inner';
      }
      return this.linkHoverConfig.linkType || 'outer';
    },
    getKnowledgeDocumentId(href) {
      return getKnowledgeDocumentIdFromHref(href);
    }
  },
  computed: {
    getTop() {
      const { top } = this.linkHoverConfig || {};
      return top - 55 + 'px';
    }
  }
};
</script>

<style lang="less" scoped>
.link-hover-box {
  .href-text {
    display: inline-block;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 10px;
  }
}
</style>
