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
      <label class="ivu-form-item-label overflow">自适应大小</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <TsFormSwitch
            :trueValue="1"
            :falseValue="0"
            :value="config.autoFit"
            @on-change="val => {
              setConfigValue('autoFit', val);
            }"
          ></TsFormSwitch>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">图片</label>
      <div class="ivu-form-item-content">
        <div v-if="config.imageUrl" class="snapshot">
          <img class="radius-md" style="width:60%" :src="config.imageUrl" />
          <i class="tsfont-trash-o" style="cursor:pointer" @click="removeImage"></i>
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
                setConfigValue('imageUrl', HOME + '/api/binary/image/download?id=' + val[0].id);
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
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    config: { type: Object }
  },
  data() {
    return {
      HOME: HOME,
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
    removeImage() {
      this.$emit('setConfig', 'imageUrl', '');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
