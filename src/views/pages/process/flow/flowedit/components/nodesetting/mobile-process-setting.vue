<template>
  <div class="settingList">
    <div class="control-box">
      <div class="control-setting">
        <span class="label">{{ $t('term.process.allowprocessonmobile') }}</span>
        <span class="control-btn">
          <TsFormSwitch
            v-model="mobileValue"
            :true-value="1"
            :false-value="0"
          ></TsFormSwitch>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    value: {
      type: [String, Number],
      default: null
    }
  },
  created() {
    if (this.value == null) {
      this.$emit('input', 1);
    }
  },
  computed: {
    mobileValue: {
      get() {
        return this.value == null ? 1 : this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    }
  }
};
</script>
