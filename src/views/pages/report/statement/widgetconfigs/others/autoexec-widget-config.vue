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
    <TsFormItem :label="$t('page.fontcolor')" labelPosition="top">
      <div>
        <ColorPicker
          :value="config.fontcolor"
          :transfer="true"
          recommend
          format="hex"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => {
            setConfigValue('fontcolor', val);
          }"
        />
      </div>
    </TsFormItem>
    <TsFormItem label="箭头颜色" labelPosition="top">
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
    <TsFormItem label="阶段状态颜色设置" labelPosition="top">
      <TsRow v-if="!$utils.isEmpty(statusColorList)" :gutter="8">
        <Col :span="8">状态</Col>
        <Col :span="7">字体颜色</Col>
        <Col :span="7">背景颜色</Col>
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
          <span class="text-href tsfont-trash-o" @click="removeStatusColor(index)"></span>
        </Col>
      </TsRow>
      <Button @click="addStatusColor"><span class="tsfont-plus">状态</span></Button>
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
      statusColorList: [
        // {
        //   name: 'saved',
        //   label: '待提交',
        //   color: '#f2f4f5'
        // },
        // {
        //   name: 'pending',
        //   label: '待处理',
        //   color: '#8c8c8c'
        // },
        // {
        //   name: 'waiting',
        //   label: '排队中',
        //   color: '#ffba5a'
        // },
        // {
        //   name: 'running',
        //   label: '运行中',
        //   color: '#1690ff'
        // },
        // {
        //   name: 'pausing',
        //   label: '暂停中',
        //   color: '#ffba5a'
        // },
        // {
        //   name: 'paused',
        //   label: '已暂停',
        //   color: '#ffba5a'
        // },
        // {
        //   name: 'aborting',
        //   label: '中止中',
        //   color: '#ffba5a'
        // },
        // {
        //   name: 'aborted',
        //   label: '已中止',
        //   color: '#ffba5a'
        // },
        // {
        //   name: 'completed',
        //   label: '已完成',
        //   color: '#25b864'
        // },
        // {
        //   name: 'failed',
        //   label: '已失败',
        //   color: '#f33b3b'
        // },
        // {
        //   name: 'ready',
        //   label: '已就绪',
        //   color: '#8c8c8c'
        // },
        // {
        //   name: 'waitting',
        //   label: '待输入',
        //   color: '#8c8c8c'
        // },
        // {
        //   name: 'checked',
        //   label: '已验证',
        //   color: '#25b864'
        // },
        // {
        //   name: 'revoked',
        //   label: '已撤销',
        //   color: '#ffba5a'
        // }

      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.config.statusColorList && this.config.statusColorList.length) {
      this.statusColorList = this.config.statusColorList;
    } 
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
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
