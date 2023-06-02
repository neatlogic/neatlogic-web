<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot><pre>{{ contentFormated }}</pre></template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  directives: {},
  components: {
  },
  props: { argument: {type: String}},
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: false,
        width: 'large',
        title: this.$t('page.detailcontent')
      }};
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
    getArgument: function() {
      this.isShow = true;
    },
    close: function() {
      this.isShow = false;
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    contentFormated: function() {
      try {
        let j = JSON.parse(this.argument);
        if ('Message' in j) {
          return j['Message'];
        }
        return JSON.stringify(j, null, 2);
      } catch (e) {
        return this.argument;
      }
    }
  },
  watch: {
    argument: {handler: function(val) {
      if (val) {
        this.getArgument();
      }
    }}
  }
};
</script>
<style lang="less">
</style>
