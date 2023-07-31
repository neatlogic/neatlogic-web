<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <pre>{{ contentFormated }}</pre>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  directives: {},
  components: {},
  props: { argument: { type: String } },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: true,
        width: 'large',
        title: this.$t('page.detailcontent')
      }
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
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    contentFormated() {
      try {
        const { Message, ...rest } = JSON.parse(this.argument);
        return Message || JSON.stringify(rest, null, 2);
      } catch (e) {
        return this.argument;
      }
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
