<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot>
      <div>
        <p style="white-space: pre" v-html="threaddump"></p>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.close') }}</Button>
      <Button type="primary" @click="printThreaddump()">{{ $t('term.framework.printsnapshot') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.framework.threaddump'),
        type: 'slider',
        width: 'large',
        isShow: true
      },
      threaddump: ''
    };
  },
  beforeCreate() {},
  created() {
    this.printThreaddump();
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
    printThreaddump() {
      this.$api.framework.healthcheck.threaddump().then(res => {
        if (res.Return) {
          this.threaddump = res.Return;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
