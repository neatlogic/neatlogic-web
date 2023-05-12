<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.positions.horizontalalign') }}
      </label>
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
      <label class="ivu-form-item-label overflow">
        {{ $t('page.fontsize') }}
        
      </label>
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
      <label class="ivu-form-item-label overflow">
        {{ $t('page.fontcolor') }}
      </label>
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
      <label class="ivu-form-item-label overflow">
        {{ $t('page.backgroundcolor') }}
      </label>
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
      <label class="ivu-form-item-label overflow">
        {{ $t('page.backgroundimage') }}
      </label>
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
        { value: 'left', text: this.$t('page.leftalign') },
        { value: 'center', text: this.$t('page.centeralign') },
        { value: 'right', text: this.$t('page.rightalign') }
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
