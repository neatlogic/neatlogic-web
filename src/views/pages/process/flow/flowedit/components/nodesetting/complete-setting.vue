
<template>
  <div class="control-box">
    <div class="control-setting">
      <span class="label">
        <span>{{ $t('term.process.autocirculation') }}</span>
      </span>
      <span class="control-btn">
        <TsFormSwitch
          v-model="autoComplete"
          :true-value="1"
          :false-value="0"
          @on-change="changeSwitch"
        ></TsFormSwitch>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  filters: {
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: Number
  },
  data() {
    return {
      autoComplete: 0
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
    changeSwitch() {
      this.$emit('change', this.autoComplete);
    }
  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        this.autoComplete = val;
      },
      immediate: true
    }
  }
};
</script>
