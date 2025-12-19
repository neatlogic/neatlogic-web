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
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/mixin.js';
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
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
      this.linkUrl = this.editorData?.getAttributes('link').href || '';
      this.dialogSetting.isShow = true;
    },
    closeDialog() {
      this.linkUrl = '';
      this.dialogSetting.isShow = false;
    },
    okDialog() {
      this.$emit('handleSelectMenuContent', {
        commandName: this.command,
        value: {
          linkHref: this.linkUrl,
          ...(this.nodeConfig || {})
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
</style>
