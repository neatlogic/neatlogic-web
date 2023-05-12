<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot>
      <pre id="statusContent">
        {{ status }}
      </pre>
    </template>
    <template v-slot:footer>
      <Button @click="copy()">{{ $t('page.copy') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      status: '',
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: true,
        width: 'medium'
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getInnodbStatus();
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
    getInnodbStatus() {
      this.$api.framework.healthcheck.getInnodbStatus().then(res => {
        this.status = res.Return.status;
      });
    },
    close() {
      this.$emit('close');
    },
    copy() {
      this.$utils.copyText('#statusContent');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
