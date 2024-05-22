<template>
  <TsForm :item-list="formConfig" labelPosition="top">
    <template v-slot:backgroundColor>
      <ColorPicker
        :transfer="true"
        recommend
        :value="canvas.config.backgroundColor"
        :visible="true"
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="setBackgroundColor"
      />
    </template>
    <template v-slot:theme>
      <TsFormSelect
        :transfer="true"
        valueName="name"
        textName="label"
        :value="canvas.config.theme"
        :dataList="themeList"
        @change="
          val => {
            $set(canvas.config, 'theme', val);
          }
        "
      ></TsFormSelect>
    </template>
    <template v-slot:backgroundImage>
      <div>
        <div v-if="canvas.config.backgroundImage" class="snapshot">
          <img class="radius-md" style="width:60%" :src="canvas.config.backgroundImage" />
          <i class="tsfont-trash-o" style="cursor:pointer" @click="removeBackgrounImage"></i>
        </div>
        <TsUpLoad
          v-if="!canvas.config.backgroundImage"
          styleType="button"
          dataType="image"
          className="smallUpload"
          type="drag"
          :multiple="false"
          :format="['png', 'jpg', 'jpeg', 'gif']"
          @getFileList="setBackgroundImage"
        ></TsUpLoad>
      </div>
    </template>
  </TsForm>
</template>
<script>
import { THEME_LIST } from './widgetthemes/theme-list.js';

export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
  props: {
    canvas: { type: Object }
  },
  data() {
    return {
      themeList: THEME_LIST,
      formConfig: {
        width: {
          type: 'number',
          label: this.$t('page.width'),
          value: this.canvas.width,
          desc: this.$t('term.report.describe.least500'),
          onChange: width => {
            if (width > 1000) {
              this.canvas.width = width;
            } else {
              this.canvas.width = 1000;
            }
          }
        },
        height: {
          type: 'number',
          label: this.$t('page.height'),
          value: this.canvas.height,
          desc: this.$t('term.report.describe.least1000'),
          onChange: height => {
            if (height > 500) {
              this.canvas.height = height;
            } else {
              this.canvas.height = 500;
            }
          }
        },
        backgroundColor: {
          type: 'slot',
          label: this.$t('page.backgroundcolor')
        },
        backgroundImage: {
          type: 'slot',
          label: this.$t('page.backgroundimage')
        },
        theme: {
          type: 'slot',
          label: this.$t('page.theme')
        },
        backgroundImageLayout: {
          type: 'radio',
          label: this.$t('term.report.tilingstyle'),
          value: this.canvas.config.backgroundImageLayout,
          isHidden: !this.canvas.config.backgroundImage,
          dataList: [
            { value: 'repeat', text: this.$t('term.report.tiling') },
            { value: 'resize', text: this.$t('term.report.stretch') }
          ],
          onChange: val => {
            this.canvas.config.backgroundImageLayout = val;
          }
        },
        description: {
          type: 'textarea',
          label: this.$t('page.explain'),
          value: this.canvas.description,
          onChange: desc => {
            this.canvas.description = desc;
          }
        }
      }
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
    setBackgroundColor(val) {
      this.$set(this.canvas.config, 'backgroundColor', val);
    },
    setBackgroundImage(val) {
      if (val && val.length > 0) {
        this.$set(this.canvas.config, 'backgroundImage', HOME + '/api/binary/image/download?id=' + val[0].id);
        this.formConfig.backgroundImageLayout.isHidden = false;
      }
    },
    removeBackgrounImage() {
      this.$delete(this.canvas.config, 'backgroundImage');
      this.formConfig.backgroundImageLayout.isHidden = true;
    }
  },
  filter: {},
  computed: {},
  watch: {
    canvas: {
      handler: function(val) {
        if (val) {
          for (let key in this.formConfig) {
            this.$set(this.formConfig[key], 'value', val[key]);
          }
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped></style>
