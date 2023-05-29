<template>
  <div>
    <TsDialog :is-show="isShow" v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        详细内容
      </template>
      <template v-slot><pre>{{ contentFormated }}</pre></template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
      </template>
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
      isShow: false,
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: false,
        width: '1000px'
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
