<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog"
      @on-ok="saveDialog"
    >
      <template>
        <div class="config-detail-box">
          <Alert show-icon>
            <template slot="desc">
              “<span class="require-label"></span>”
              <span class="text-tip">{{ $t('term.framework.reqparamstip') }}</span>
            </template>
          </Alert>
          <div class="radius-sm border-color bg-op block-border">
            <div v-for="(item, index) in configDataList" :key="index" class="config-detail-li">
              <div class="left-number-box bg-grey border-color">
                <span class="text-tip">{{ index+1 }}</span>
                <span class="required-box" :class="getRequiredClass(item) ? 'require-label' : ''"></span>
              </div>
              <div ref="codeValue" class="right-code-box" contenteditable="true">
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 查看密码
  components: {},
  props: {
    tagentId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      requiredFieldList: [],
      configDataList: [],
      dialogSetting: {
        type: 'modal',
        isShow: true,
        title: this.$t('page.config')
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getTagentConfigInfo();
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
    saveDialog() {
      // 保存配置详情
      let codeData = [];
      if (this.$refs.codeValue && this.$refs.codeValue instanceof Array) {
        this.$refs.codeValue.forEach((item) => {
          if (item && item.innerText) {
            codeData.push(item.innerText + '\n');
          }
        });
      }
      let params = {
        tagentId: this.tagentId,
        data: codeData
      };
      this.$api.framework.tagent.saveTagentConfig(params)
        .then((res) => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.closeDialog();
          }
        });
    },
    getTagentConfigInfo() {
      if (this.$utils.isEmpty(this.tagentId)) {
        return false;
      }
      this.configDataList = [];
      this.requiredFieldList = [];
      this.$api.framework.tagent.getTagentConfig({tagentId: this.tagentId})
        .then((res) => {
          if (res.Status == 'OK') {
            if (!this.$utils.isEmpty(res.Return)) {
              this.requiredFieldList = res.Return.requiredFieldList || [];
              this.configDataList = res.Return.configJson && res.Return.configJson.std ? res.Return.configJson.std : [];
            }
          }
        });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    getRequiredClass(item) {
      return function(item) {
        let fieldname = item ? (item.split('=') ? item.split('=')[0] : '') : '';
        return this.requiredFieldList.indexOf(fieldname) != -1;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.config-detail-box {
  /deep/ .require-label::before {
    font-size: 21px;
  }
  .config-detail-li {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    .left-number-box {
      display: flex;
      justify-content: center;
      position: relative;
      width: 49px;
      border-right: 1px solid;
      margin-right: 8px;
      .required-box {
        position: absolute;
        right: 5px;
        top: -3px;
      }
  }
  .right-code-box {
      width: calc(100% - 58px);
    .code-input {
        width: 100%;
        outline: none;
        border: none;
        background: none;
      }
    }
  }
}
</style>
