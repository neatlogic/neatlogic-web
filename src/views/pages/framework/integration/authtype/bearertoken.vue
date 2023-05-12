<template>
  <div>
    <TsRow>
      <Col span="2">
        <label>Token</label>
      </Col>
      <Col span="22">
        <TsFormInput v-model="myAuthConfig.token" type="text" />
      </Col>
    </TsRow>
    <TsRow>
      <Col span="2">
      </Col>
      <Col span="22">
        <div class="text-grey"><b>{{ $t('page.tip') }}</b>：{{ $t('message.framework.tokentip') }}</div>
      </Col>
    </TsRow>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: { TsFormInput },
  props: { authConfig: { type: Object } },
  data() {
    return { myAuthConfig: {} };
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
  methods: {},
  filter: {},
  computed: {},
  watch: {
    authConfig: {
      handler: function(val) {
        if (val) {
          this.myAuthConfig = val;
        }
      },
      deep: true,
      immediate: true
    },
    myAuthConfig: {
      handler: function(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
