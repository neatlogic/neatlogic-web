<template>
  <div>
    <TsRow>
      <Col span="2">{{ $t('page.type') }}</Col>
      <Col span="22">
        <TsFormSelect
          v-model="authType"
          :data-list="authenticationTypeList"
          width="100%"
          transfer
          @on-change="authConfig = {}"
        ></TsFormSelect>
      </Col>
    </TsRow>
    <Divider />
    <div>
      <component :is="authType" :authConfig="authConfig" @setConfig="setConfig" />
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import * as components from './authtype';
export default {
  name: '',
  components: { TsFormSelect, ...components },
  props: { integration: { type: Object } },
  data() {
    return {
      authType: 'noauth',
      authConfig: {},
      authenticationTypeList: []
    };
  },
  beforeCreate() {},
  created() {
    this.$api.framework.integration.getAuthenticationTypeList().then(res => {
      if (res.Status == 'OK') {
        this.authenticationTypeList = res.Return;
      }
    });
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setConfig: function(config) {
      this.authConfig = config;
    }
  },
  filter: {},
  computed: {
    returnJson: function() {
      let json = { type: this.authType, config: this.authConfig };
      return json;
    }
  },
  watch: {
    integration: {
      handler: function(val) {
        if (val.config && val.config.authentication) {
          this.authType = val.config.authentication.type || 'noauth';
          this.authConfig = val.config.authentication.config;
        }
      },
      deep: true,
      immediate: true
    },
    returnJson: {
      handler: function(val) {
        this.$emit('setAuthentication', val);
      },
      deep: true
    }
    // ,
    // authType: {
    //   handler: function(val) {
    //     this.authConfig = {};
    //   }
    // }
  }
};
</script>
<style lang="less"></style>
