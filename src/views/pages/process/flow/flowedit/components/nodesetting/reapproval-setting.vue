
<template>
  <div class="control-box">
    <div class="control-setting">
      <span class="label">
        <span>{{ $t('page.reapproval') }}</span>
      </span>
      <span class="control-btn">
        <TsFormSwitch
          v-model="enableReapproval"
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
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
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
      enableReapproval: 0
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
      this.$emit('change', this.enableReapproval);
    }
  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        this.enableReapproval = val;
      },
      immediate: true
    }
  }
};
</script>
