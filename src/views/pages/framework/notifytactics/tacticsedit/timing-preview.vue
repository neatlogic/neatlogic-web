<template>
  <div>
    <TsDialog
      v-if="previewType == 'notify'"
      type="modal"
      :isShow.sync="viewModel"
      :title="$t('page.preview')"
      :defaultFull="true"
      :hasFooter="false"
      @on-close="close"
    >
      <template v-slot>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div v-if="config" class="preview-box">
          <div class="head border-color">
            <div class="title" :class="!config.title ? 'text-tip' : ''">{{ config.title || $t('page.title') }}</div>
            <table class="head-message">
              <tbody>
                <tr v-if="config.toList || config.toText">
                  <td width="80">{{ $t('page.recipient') }}：</td>
                  <td class="text-tip">
                    <div v-if="config.toText">{{ config.toText }}</div>
                    <div v-else>
                      <UserSelect :value="config.toList" readonly></UserSelect>
                    </div>
                  </td>
                </tr>
                <tr v-if="config.ccList || config.ccText">
                  <td width="80">{{ $t('page.cc') }}：</td>
                  <td class="text-tip">
                    <div v-if="config.ccText">{{ config.ccText }}</div>
                    <div v-else>
                      <UserSelect :value="config.ccList" readonly></UserSelect>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="main">
            <div v-if="config.content" class="notify-content" v-html="config.content"></div>
            <div v-if="config.handler" class="title">{{ config.handler }}</div>
            <div v-if="content" v-html="content"></div>
          </div>
        </div>
      </template>
    </TsDialog>
    <TsDialog
      v-else-if="previewType == 'handler'"
      type="modal"
      :title="$t('page.preview')"
      width="large"
      :isShow.sync="viewModel"
      :hasFooter="false"
      @on-close="close"
    >
      <template v-slot>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div v-html="content"></div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import UserSelect from '@/resources/components/UserSelect/UserSelect';
export default {
  name: '',
  components: {
    UserSelect
  },
  filters: {},
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    config: Object,
    previewType: {
      type: String,
      default: 'notify'
    },
    handler: { type: String, default: null },
    notifyHandler: { type: String, default: null },
    condition: Object //预览搜索条件
  },
  data() {
    return {
      isLoading: true,
      viewModel: false,
      dialogConfig: {
        title: this.$t('page.preview'),
        defaultFull: true,
        hasFooter: false
      },
      content: null
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
    close() {
      this.viewModel = false;
      this.isLoading = true;
      this.$emit('update:isShow', false);
    },
    async getHandlertPreview() {
      const data = {
        handler: this.handler,
        notifyHandler: this.notifyHandler,
        config: this.condition
      };
      let res = await this.$api.framework.tactics.handlertPreview(data);
      this.content = res.Return.content;
      this.isLoading = false;
    }
  },
  computed: {},
  watch: {
    isShow(val) {
      if (val) {
        this.getHandlertPreview();
      } else {
        this.isLoading = false;
      }
      this.viewModel = val;
    }
  }
};
</script>
<style lang="less" scoped>
.preview-box {
  .head {
    padding: 16px;
    border-bottom: 1px solid;
    margin-bottom: 32px;
    padding-bottom: 16px;
    .head-message {
      width: 100%;
      position: relative;
      margin-top: 10px;
    }
  }
  .main {
    padding: 0 16px;
  }
  .title {
    font-weight: bold;
    font-size: 18px;
  }
  .notify-content {
    padding-bottom: 16px;
  }
}
</style>
