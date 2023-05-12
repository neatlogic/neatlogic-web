<template>
  <form class="flowSetting setting-box">
    <div class="flow-panel name">
      <p class="panel-title">{{ $t('term.process.linename') }}</p>
      <div class="panel-contain input-border">
        <TsFormInput
          ref="name"
          v-model="namevalue"
          name="name"
          maxlength="50"
          @on-change="linkNameChange"
        ></TsFormInput>
      </div>
    </div>
    <div class="flow-panel paddinglr">
      <span class="panel-title">{{ $t('page.type') }}：</span><span>{{ typeLabel }}</span>
    </div>
  </form>
</template>

<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: 'FlowLinkSettingVue',
  components: {
    TsFormInput
  },
  props: {
    config: Object
  },
  data() {
    return {
      namevalue: this.config.name || ''
    };
  },
  methods: {
    linkNameChange(val) {
      this.$emit('setlinkname', val || '');
    }
  },
  computed: {
    typeLabel() {
      let label = this.$t('term.process.circulation');
      switch (this.config.type) {
        case 'forward':
          label = this.$t('term.process.circulation');
          break;
        case 'backward':
          label = this.$t('page.rollback');
          break;
      }
      return label;
    }
  },
  watch: {
    'config.name': {
      handler(value) {
        this.namevalue = value || '';
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
  .paddinglr {
    padding: 0 16px;
  }
</style>
