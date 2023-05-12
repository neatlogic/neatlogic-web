<template>
  <div>
    <TsFormItem :label="$t('term.report.positions.horizontalalign') " labelPosition="top">
      <TsFormRadio
        :dataList="alignList"
        :value="config.align"
        @change="
          val => {
            setConfigValue('align', val);
          }
        "
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('page.textfontsize')" labelPosition="left" contentAlign="right">
      <Slider
        :value="config.textFontSize"
        :min="12"
        :max="50"
        :step="1"
        @on-change="
          val => {
            setConfigValue('textFontSize', val);
          }
        "
      ></Slider>
    </TsFormItem>
    <TsFormItem :label="$t('page.textfontcolor')" labelPosition="left" contentAlign="right">
      <ColorPicker
        v-model="config.textFontColor"
        :transfer="true"
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            setConfigValue('textFontColor', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem :label="$t('page.numberfontsize')" labelPosition="left" contentAlign="right">
      <Slider
        :value="config.numberFontSize"
        :min="12"
        :max="100"
        :step="1"
        @on-change="
          val => {
            setConfigValue('numberFontSize', val);
          }
        "
      ></Slider>
    </TsFormItem>
    <TsFormItem :label="$t('page.numberfontcolor')" labelPosition="left" contentAlign="right">
      <ColorPicker
        v-model="config.numberFontColor"
        :transfer="true"
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            setConfigValue('numberFontColor', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem :label="$t('page.padding')" labelPosition="left" contentAlign="right">
      <Slider
        :value="config.margin"
        :min="0"
        :max="50"
        :step="5"
        @on-change="
          val => {
            setConfigValue('margin', val);
          }
        "
      ></Slider>
    </TsFormItem>
    <TsFormItem :label="$t('page.margin')" labelPosition="left" contentAlign="right">
      <Slider
        :value="config.padding"
        :min="0"
        :max="50"
        :step="5"
        @on-change="
          val => {
            setConfigValue('padding', val);
          }
        "
      ></Slider>
    </TsFormItem>
    <TsFormItem :label="$t('page.borderradius')" labelPosition="left" contentAlign="right">
      <Slider
        :value="config.radius"
        :min="0"
        :max="20"
        :step="1"
        @on-change="
          val => {
            setConfigValue('radius', val);
          }
        "
      ></Slider>
    </TsFormItem>
    <TsFormItem :label="$t('page.backgroundcolor')" labelPosition="left" contentAlign="right">
      <ColorPicker
        :transfer="true"
        recommend
        alpha
        :value="config.backgroundColor"
        :visible="true"
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            setConfigValue('backgroundColor', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem :label="$t('page.backgroundimage')" labelPosition="top">
      <div v-if="config.backgroundImage" class="snapshot">
        <img class="radius-md" style="width:60%" :src="config.backgroundImage" />
        <i class="tsfont-trash-o" style="cursor:pointer" @click="removeBackgrounImage"></i>
      </div>
      <TsUpLoad
        v-else
        styleType="button"
        dataType="image"
        className="smallUpload"
        type="drag"
        :multiple="false"
        :format="['png', 'jpg', 'jpeg', 'gif']"
        @getFileList="
          val => {
            if (val && val.length > 0) {
              setConfigValue('backgroundImage', HOME + '/api/binary/image/download?id=' + val[0].id);
            }
          }
        "
      ></TsUpLoad>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
  },
  props: {
    config: { type: Object }
  },
  data() {
    return {
      HOME: HOME,
      colorList: ['#EFF0F3', '#F5F6FA', '#E5E5E5', '#A1A1A1', '#212121', '#1670F0', '#FFBA5A', '#25B864', '#F33B3B', '#E7F0FF', '#FFF5E7', '#E4F6EC', '#F8E3E3'],
      alignList: [
        {
          value: 'left',
          text: this.$t('page.leftalign')
        },
        { value: 'center', text: this.$t('page.centeralign') },
        { value: 'right', text: this.$t('page.rightalign') }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    console.log(HOME);
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
    removeBackgrounImage() {
      this.$emit('setConfig', 'backgroundImage', '');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
