<template>
  <div class="input-border">
    <!-- start_显示文字 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey  require-label">显示文字</label>
      <div class="formsetting-text">
        <TsFormInput
          ref="text"
          v-model="setting.text"
          :validateList="validLi"
          :maxlength="inputMaxlength"
        ></TsFormInput>
      </div>
    </div>
    <!-- end_显示文字 -->
    <!-- start_跳转地址 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey require-label">跳转地址</label>
      <div class="formsetting-text">
        <TsFormInput
          ref="url"
          v-model="setting.value"
          :validateList="validUrl"
          :maxlength="inputMaxlength"
        ></TsFormInput>
      </div>
    </div>
    <!-- end_跳转地址 -->
    <!-- start_打开方式 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey  require-label">打开方式</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.target">
          <Radio label="_blank">新窗口</Radio>
          <Radio label="_self">当前窗口</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- end_打开方式 -->
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: 'Formdinput',
  components: { TsFormInput },
  props: {
    setting: Object
  },
  data() {
    let _this = this;
    return {
      inputMaxlength: 100,
      validLi: ['required'],
      validUrl: ['required', 'url']
    };
  },
  created() {},
  mounted() {},
  methods: {
    validComponent() {
      let _this = this;
      let validList = [];
      if (!_this.$refs.text.valid()) {
        validList.push('超链接：显示文字不可以为空');
      }
      if (!_this.setting.value && !_this.$refs.url.valid()) {
        validList.push('超链接：跳转地址不可以为空');
      } else if (_this.$refs.url && !_this.$refs.url.valid()) {
        validList.push('超链接：跳转地址不合法');
      }

      return validList;
    }
  },
  computed: {},
  watch: {}
};
</script>
