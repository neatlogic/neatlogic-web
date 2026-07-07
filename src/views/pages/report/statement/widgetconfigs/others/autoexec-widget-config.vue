<template>
  <div>
    <TsFormItem :label="$t('page.fontsize')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="config.fontsize"
          :min="12"
          :max="50"
          :step="1"
          @on-change="
            val => {
              setConfigValue('fontsize', val);
            }
          "
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.progressbarcolor')" labelPosition="top">
      <div class="bg-op radius-sm padding-sm">
        <Row
          v-for="(item, index) in progressStatusList"
          :key="index"
          :gutter="16"
          type="flex"
          :class="index != progressStatusList.length - 1 ? 'mb-sm' : ''"
        >
          <Col span="6">
            {{ item.progressName }}
          </Col>
          <Col span="10">
            <ColorPicker
              :value="item.progressColor"
              :transfer="true"
              recommend
              format="hex"
              class="colorPicker"
              transfer-class-name="color-picker-transfer-class"
              @on-change="val => {
                item.progressColor = val;
                setConfigValue('progressStatusList', progressStatusList);
              }"
            />
          </Col>
        </Row>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.arrowcolor')" labelPosition="top">
      <ColorPicker
        :value="config.arrowcolor"
        :transfer="true"
        recommend
        format="hex"
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        alpha
        @on-change="val => {
          setConfigValue('arrowcolor', val);
        }"
      />
    </TsFormItem>
    <TsFormItem :label="$t('term.report.phasestatuscolorsetting')" labelPosition="top">
      <div class="bg-op radius-sm padding-sm">
        <TsRow v-if="!$utils.isEmpty(statusColorList)" :gutter="8">
          <Col :span="8">{{ $t('page.status') }}</Col>
          <Col :span="7">{{ $t('page.fontcolor') }}</Col>
          <Col :span="7">{{ $t('page.backgroundcolor') }}</Col>
        </TsRow>
        <TsRow
          v-for="(item, index) in statusColorList"
          :key="index"
          :gutter="8"
          class="mb-sm"
        >
          <Col :span="8">
            <TsFormInput
              v-model="item.name"
              border="border"
              :disabled="item.disabled"
              @on-blur="val => {
                setConfigValue('statusColorList', statusColorList);
              }"
            ></TsFormInput>
          </Col>
          <Col :span="7">
            <ColorPicker
              :value="item.color"
              :transfer="true"
              recommend
              format="hex"
              class="colorPicker"
              transfer-class-name="color-picker-transfer-class"
              @on-change="val => {
                $set(item, 'color', val);
                setConfigValue('statusColorList', statusColorList);
              }"
            />
          </Col>
          <Col :span="7">
            <ColorPicker
              :value="item.bgColor"
              :transfer="true"
              recommend
              class="colorPicker"
              alpha
              transfer-class-name="color-picker-transfer-class"
              @on-change="val => {
                $set(item, 'bgColor', val);
                setConfigValue('statusColorList', statusColorList);
              }"
            />
          </Col>
          <Col :span="2">
            <span v-if="!item.disabled" class="text-href tsfont-trash-o" @click="removeStatusColor(index)"></span>
          </Col>
        </TsRow>
        <Button @click="addStatusColor"><span class="tsfont-plus">{{ $t('page.status') }}</span></Button>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    config: { type: Object }
  },
  data() {
    return {
      progressStatusList: [{
        progressName: this.$t('term.report.notstarted'),
        progressValue: 'pending',
        progressColor: '#fff'
      }, {
        progressName: this.$t('term.report.inprogress'),
        progressValue: 'running',
        progressColor: '#2d8cf0'
      },
      {
        progressName: this.$t('term.report.completed'),
        progressValue: 'completed',
        progressColor: '#19be6b'
      }],
      statusColorList: []
    };
  },
  beforeCreate() {},
  created() {
    const statusColorList = this.config?.statusColorList;
    if (statusColorList && statusColorList.length) {
      this.statusColorList = statusColorList;
    }
  },
  beforeMount() {},
  mounted() {
    this.handleProgressStatusList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleProgressStatusList() {
      const { progressStatusList = [] } = this.config || {};
      if (this.$utils.isEmpty(progressStatusList)) {
        this.setConfigValue('progressStatusList', this.progressList);
      } else {
        this.progressStatusList = progressStatusList;
      }
    },
    setConfigValue(attrName, attrValue) {
      if (attrName) {
        this.$emit('setConfig', attrName, attrValue);
      }
    },
    addStatusColor() {
      this.statusColorList.push({
        name: '',
        color: null,
        bgColor: null
      });
    },
    removeStatusColor(index) {
      this.statusColorList.splice(index, 1);
      this.setConfigValue('statusColorList', this.statusColorList);
    }
  },
  filter: {},
  computed: {
  },
  watch: {
  }
};
</script>
<style lang="less">
</style>
