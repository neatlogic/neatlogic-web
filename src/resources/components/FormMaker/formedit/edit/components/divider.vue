<template>
  <div class="formdivider">
    <!-- start_颜色 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-pickeer">
        颜色 
        <span>
          <Tooltip
            placement="bottom"
            max-width="300"
            theme="light"
            transfer
          >
            <b class="tsfont-info-o text-href"></b>
            <div slot="content">
              <p>颜色为空，则会使用系统默认样色</p>
            </div>
          </Tooltip>
        </span>
        <ColorPicker v-model="dividerColor" recommend class="colorPicker" />
      </label>
    </div>
    <!-- end_颜色 -->
    <!-- start_类型 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">类型</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="dividerType" class="col-4">
          <Radio label="solid">实线</Radio>
          <Radio label="dashed">虚线</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- end_类型 -->
    <!-- start_线宽 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">线宽</label>
      <div class="formsetting-text">
        <TsFormInput
          ref="dividerWidth"
          v-model="dividerWidth"
          :validateList="validateSetting.inputWidth"
          type="number"
          :min="0"
          :max="100"
        ></TsFormInput>
      </div>
    </div>
    <!-- end_线宽 -->
  </div>
</template>

<script>
export default {
  name: 'Formdivider',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    setting: Object
  },
  data() {
    return {
      dividerColor: '',
      dividerType: '',
      dividerWidth: '',
      validateSetting: {
        inputWidth: [
          'integer_natural',
          {
            name: 'max100',
            validator: function(rule, value) {
              if (value == '') {
                return true;
              }
              return value <= 100 && value > 0;
            },
            trigger: 'change',
            message: '请输入大于0小于等于100的值'
          }
        ]
      }
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    this.initDividersetting();
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    initDividersetting() {
      this.dividerColor = this.setting.dividerColor || this.dividerColor;
      this.dividerType = this.setting.dividerType || this.dividerType;
      this.dividerWidth = this.setting.dividerWidth || this.dividerWidth;
      this.dividerWidth = Math.max(this.dividerWidth, 1);
    },
    validComponent() {
      let _this = this;
      let componet = [{ ref: 'dividerWidth', message: '线宽：请填写正确格式' }];
      let validList = [];
      componet.forEach(item => {
        _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && validList.push(item.message);
      });
      return validList;
    }
  },
  filter: {},

  computed: {},

  watch: {
    setting(val) {
      this.initDividersetting();
    },
    dividerColor(val) {
      this.$parent.updatesetting('dividerColor', val);
    },
    dividerType(val) {
      this.$parent.updatesetting('dividerType', val);
    },
    dividerWidth(val) {
      this.$parent.updatesetting('dividerWidth', val);
    }
  }
};
</script>
<style lang="less">
.formdivider {
  .formsetting-block {
    overflow: hidden;
    .label-pickeer {
      width: 100%;
      .colorPicker {
        float: right;
        height: 32px;
        line-height: 32px;
      }
    }
  }
}
</style>
