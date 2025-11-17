<template>
  <div class="hyper-link-box">
    <Tooltip 
      placement="top"
      :transfer="true"
      theme="light"
      max-width="300"
    >
      <span
        :class="[icon, menuState?.editorData?.isActive('link') ? 'text-href' : '']"
        class="link-text"
        @click.stop="openLinkDialog"
      ></span>
      <div slot="content">
        {{ title }}
      </div>
    </Tooltip>
   
    <TsDialog v-bind="dialogSetting" @on-ok="okDialog" @on-close="closeDialog">
      <template v-slot>
        <div>
          <TsFormInput v-model="linkUrl" border="border" placeholder="粘贴或输入链接"></TsFormInput>
        </div>
      </template>
      <template v-slot:footer>
        <Button type="primary" :disabled="!linkUrl" @click="okDialog">确认</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/bubble-menu/src/mixin.js';
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  mixins: [mixin],
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    command: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      linkUrl: '',
      dialogSetting: {
        title: '设置链接',
        width: '400px',
        type: 'modal',
        isShow: false
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    openLinkDialog() {
      this.linkUrl = this.menuState?.editorData?.getAttributes('link').href || '';
      this.dialogSetting.isShow = true;
    },
    closeDialog() {
      this.linkUrl = '';
      this.dialogSetting.isShow = false;
    },
    okDialog() {
      this.$emit('execCommand', {
        command: this.command,
        value: {
          linkUrl: this.linkUrl
        }
      });
      this.closeDialog();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.hyper-link-box {
  .link-text {
    font-size: 16px;
  }
}
</style>
