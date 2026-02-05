<template>
  <div class="link-hover-box">
    <div
      :style="{
        position: 'absolute',
        left: linkHoverConfig.left + 'px',
        top: getTop,
      }"
    >
      <div class="bg-op radius-sm shadow block-border flex-start padding-sm">
        <div class="href-text mr-sm">
          <TsFormInput
            ref="hrefInput"
            :value="linkHoverConfig.href"
            border="border"
            :validate-list="['required']"
            @on-change="handleHrefChange"
          ></TsFormInput>
        </div>
        <Tooltip 
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
          placement="top"
          :transfer="true"
          theme="light"
          max-width="300"
        >
          <span
            class="tsfont-unbind cursor-pointer"
            @click="()=> {
              $emit('click-menu', {
                commandName: 'link',
                options: {
                  operationType: 'removeLink',
                }
              })
            }"
          ></span>
          <div slot="content">
            <span>移除链接</span>
          </div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    linkHoverConfig: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isShowEditLinkDialog: false,
      linkUrl: ''
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
    handleHrefChange(href) {
      this.linkUrl = href;
    },
    replaceLink() {
      const formRef = this.$refs.hrefInput;
      if (!formRef.valid()) {
        return false;
      }
      this.$emit('click-menu', {
        commandName: 'link',
        options: {
          linkText: this.linkHoverConfig.text,
          linkUrl: this.linkUrl || this.linkHoverConfig.href,
          operationType: 'replaceLink'
        }
      });
    }
  },
  filter: {},
  computed: {
    getTop() {
      const { top } = this.linkHoverConfig || {};
      return top - 55 + 'px';
    }
  },
  watch: {}
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
