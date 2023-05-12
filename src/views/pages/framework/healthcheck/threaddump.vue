<template>
  <div>
    <TsContain>
      <div slot="topRight" style="text-align:right">
        <Button type="primary" @click="printThreaddump()">{{ $t('term.framework.printsnapshot') }}</Button></div><div slot="content">
        <p style="white-space: pre" v-html="threaddump"></p>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      threaddump: ''
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
<style lang="less">
</style>
