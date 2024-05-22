
<template>
  <div class="control-box">
    <div class="control-setting">
      <span class="label">
        <span>{{ $t('term.process.autoapproval') }}</span>
        <Tooltip
          theme="light"
          transfer
          max-width="300px"
        >
          <i class="fz10 tsfont-info-o text-href"></i>
          <div slot="content" class="tooltip-content">{{ $t('term.process.autoapprovaltip') }}</div>
        </Tooltip>
      </span>
      <span class="control-btn">
        <TsFormSwitch
          v-model="autoApproval"
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
      autoApproval: 0
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
      this.$emit('change', this.autoApproval);
    }
  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        this.autoApproval = val;
      },
      immediate: true
    }
  }
};
</script>
