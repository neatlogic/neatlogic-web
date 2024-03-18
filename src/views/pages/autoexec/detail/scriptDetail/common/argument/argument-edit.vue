
<template>
  <div id="argument" class="argument-edit pb-nm">
    <div class="title">
      <div class="pr-nm text">{{ $t('term.autoexec.freeparameter') }}</div>
      <TsFormSwitch
        v-model="isActive"
        :trueValue="true"
        :falseValue="false"
        :beforeChange="beforeChangeActive"
      ></TsFormSwitch>
    </div>
    <template v-if="isActive">
      <div class="param-top text-title">
        <TsRow :gutter="8">
          <Col span="8">
            <div class="overflow">{{ $t('page.name') }}</div>
          </Col>
          <Col span="6">
            <div class="overflow">{{ $t('page.quantitylimit') }}</div>
          </Col>
          <Col span="10">
            <div class="overflow">{{ $t('page.description') }}</div>
          </Col>
        </TsRow>
        <div class="btn-item">
          {{ $t('page.require') }}
        </div>
      </div>
      <div class="param-main">
        <TsRow :gutter="8">
          <Col span="8">
            <TsFormInput
              ref="nameInput"
              v-model="argument.name"
              maxlength="50"
              :validateList="nameValid"
              border="border"
            ></TsFormInput>
          </Col>
          <Col span="6">
            <TsRow :gutter="8">
              <Col :span="isArgumentCount ? 12 : 24">
                <TsFormSelect
                  v-model="isArgumentCount"
                  :dataList="dataList"
                  transfer
                  border="border"
                  @on-change="changeArgumentCount"
                ></TsFormSelect>
              </Col>
              <Col v-if="isArgumentCount" span="12">
                <InputNumber
                  v-model="argument.argumentCount"
                  :max="12"
                  :min="1"
                  class="input-number bg-op"
                ></InputNumber>
              </Col>
            </TsRow>
          </Col>
          <Col span="10">
            <TsFormInput
              v-model="argument.description"
              maxlength="500"
              :placeholder="$t('page.description')"
              border="border"
            ></TsFormInput>
          </Col>
        </TsRow>
        <div class="btn-item">
          <TsFormSwitch v-model="argument.isRequired"></TsFormSwitch>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  filters: {
  },
  props: {
    config: Object
  },
  data() {
    return {
      isActive: false,
      argument: {
        name: '',
        defaultValue: '',
        argumentCount: 0,
        description: '',
        isRequired: 1
      },
      isArgumentCount: 0,
      dataList: [
        {
          text: this.$t('page.notlimit'),
          value: 0
          
        },
        {
          text: this.$t('page.limit'),
          value: 1
        }
      ],
      nameValid: ['required', 'name-special']
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
    initData(val) {
      if (val && !this.$utils.isEmpty(val)) {
        this.isActive = true;
        let config = this.$utils.deepClone(val);
        Object.keys(config).forEach(key => {
          if (this.argument.hasOwnProperty(key)) {
            this.argument[key] = config[key];
            if (key == 'argumentCount' && this.argument[key] > 0) {
              this.isArgumentCount = 1;
            }
          }
        });
      } else {
        this.isActive = false;
      }
    },
    beforeChangeActive() {
      if (this.isActive && this.argument.name) {
        this.$createDialog({
          title: this.$t('page.close'),
          content: this.$t('term.autoexec.closefreeparamtip'),
          btnType: 'error',
          okText: this.$t('page.close'),
          'on-ok': vnode => {
            this.argument = {
              name: '',
              defaultValue: '',
              argumentCount: 0,
              description: '',
              isRequired: 1
            };
            this.isActive = false;
            vnode.isShow = false;
          },
          'on-close': vnode => {
            this.isActive = true;
            vnode.isShow = false;
          }
        });
        return false;
      } else {
        return true;
      }
    },
    changeArgumentCount(val) {
      if (val) {
        this.argument.argumentCount = 1;
      } else {
        this.argument.argumentCount = 0;
      }
    },
    valid() {
      let isValid = true;
      if (this.isActive) {
        let nameInput = this.$refs.nameInput;
        if (nameInput && !nameInput.valid()) {
          isValid = false;
        }
      }
      return isValid;
    },
    save() {
      let data = null;
      if (this.isActive) {
        data = this.argument;
      }
      return data;
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val) {
        this.initData(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.argument-edit{
  .title{
    display: flex;
    align-items: center;
    >.text {
      font-size: 14px;
      flex-shrink: 0;
    }
  }
  .param-top {
    position: relative;
    padding: 10px 60px 10px 0;
  }
  .param-main{
    position: relative;
    padding-right: 60px;
  }
  .btn-item{
    width: 50px;
    position: absolute;
    right: 0;
    top: 0;
    height: 32px;
    line-height: 32px;
  }
  .input-number {
    width: 100%;
  }
}
</style>
