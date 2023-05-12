<template>
  <div class="input-border">
    <!-- start_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <!-- end_必填 -->
    <!-- start_默认值 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">默认值</label>
      <TsFormInput v-model="setting.defaultValueList"></TsFormInput>
    </div>
    <!-- end_默认值 -->
    
    <!-- start_输入提示 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">输入提示</label>
      <div class="formsetting-text">
        <TsFormInput
          v-model="setting.placeholder"
          type="text"
          width="100%"
          maxlength="50"
        ></TsFormInput>
      </div>
    </div>
    <!-- end_输入提示 -->
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: 'Formeditor',
  components: { TsFormInput },
  props: {
    setting: Object
  },
  data() {
    return {};
  },
  mounted() {},
  created() {},
  methods: {},
  computed: {},
  watch: {}
};
</script>
