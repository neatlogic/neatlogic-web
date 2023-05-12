<template>
  <div>
    <TsRow>
      <Col span="2">
        <label>{{ $t('page.account') }}</label>
      </Col>
      <Col span="10">
        <TsFormInput v-model="myAuthConfig.username" type="text" />
      </Col>
      <Col span="2">
        <label>{{ $t('page.password') }}</label>
      </Col>
      <Col span="10">
        <TsFormInput v-model="myAuthConfig.password" type="password" />
      </Col>
    </TsRow>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  components: {
    TsFormInput
  },
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
