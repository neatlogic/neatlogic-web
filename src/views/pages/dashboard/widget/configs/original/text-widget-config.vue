<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">水平对齐</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <TsFormRadio
            :dataList="alignList"
            :value="config.align"
            @change="
              val => {
                setConfigValue('align', val);
              }
            "
          ></TsFormRadio>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">字体大小</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
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
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">字体颜色</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          v-model="config.color"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('color', val);
            }
          "
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">背景颜色</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :transfer="true"
          recommend
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
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">背景图片</label>
      <div class="ivu-form-item-content">
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
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
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
        { value: 'left', text: '左对齐' },
        { value: 'center', text: '居中' },
        { value: 'right', text: '右对齐' }
      ]
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
