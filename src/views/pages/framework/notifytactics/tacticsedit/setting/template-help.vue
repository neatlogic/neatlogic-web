<template>
  <div>
    <TsDialog
      :isShow="isDialog"
      width="large"
      height="404px"
      :title="$t('page.help')"
      :bgOp="true"
      @on-close="close"
    >
      <template>
        <TsRow>
          <Col span="8">
            <div class="template-box border-color">
              <div
                v-for="(item, index) in helpList"
                :key="index"
                class="template-li text-action overflow"
                :class="(templateConfig && templateConfig.trigger == item.trigger)? 'li-active li-text' :''"
                @click="selectTemplate(item)"
              >{{ item.trigger }}</div>
            </div>
          </Col>
          <Col span="16">
            <div class="detali">
              <Alert v-if="templateConfig && templateConfig.description">
                <div>
                  <i class="tsfont-info-o text-href"></i><span>{{ templateConfig.description }}</span>
                </div>
              </Alert>
              <div class="title">
                <div class="text-title">{{ $t('page.title') }}</div>
                <div v-if="templateConfig" class="content-text">{{ templateConfig.title }}</div>
              </div>
              <div class="content">
                <div class="text-title">{{ $t('page.content') }}</div>
                <div v-if="templateConfig" class="content-text">{{ templateConfig.content }}</div>
              </div>
            </div>
          </Col>
        </TsRow>
      </template>
      <template v-slot:footer>
        <Button @click="isDialog = false">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="addTemplate">{{ $t('dialog.title.addtarget',{'target':$t('page.template')}) }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    isDialog: {
      type: Boolean,
      default: false
    },
    policyId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      sessionName: 'templatehelpbox',
      leftWidth: '246',
      templateConfig: null,
      helpList: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.policyId) {
      this.getHelpList();
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getHelpList() {
      let data = {
        policyId: this.policyId
      };
      this.$api.framework.tactics.getHelpList(data).then(res => {
        if (res.Status == 'OK') {
          let helpList = res.Return.helpList;
          if (helpList.length > 0) {
            this.helpList = helpList;
            this.templateConfig = helpList[0];
          }
        }
      });
    },
    close() {
      this.$emit('update:isDialog', false);
    },
    addTemplate() {
      this.close();
      this.$emit('add', this.templateConfig);
    },
    selectTemplate(item) {
      this.templateConfig = item;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.template-box {
  border-right: 1px solid;
  height: 380px;
  overflow-y: auto;
  padding-right: 16px;
  .template-li {
    padding: 8px 12px;
  }
}
.detali {
  height: 380px;
  overflow-y: auto;
  line-height: 32px;
  .title {
    padding-bottom: 12px;
  }
  .content-text{
    line-height: 28px;
  }
}
</style>
