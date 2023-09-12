<template>
  <div>
    <TsFormInput
      v-model="value"
    ></TsFormInput>
  </div>
</template>
<script>
import jsep from 'jsep';
jsep.addBinaryOp('include');
jsep.addBinaryOp('exclude');
jsep.addBinaryOp('like');
jsep.addBinaryOp('not like');
jsep.removeAllUnaryOps();
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {},
  data() {
    return {
      value: '',
      astData: null
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
  },
  filter: {},
  computed: {
    wordList() {
      const wordList = [];
      if (this.$utils.isEmpty(this.astData)) {
        //
      }
      return wordList;
    }
  },
  watch: {
    value: {
      handler: function(val) {
        try {
          this.astData = jsep(val);
        } catch (e) {
          //
        }
        console.log(JSON.stringify(this.astData, null, 2));
      }
    }
  }
};
</script>
<style lang="less">
</style>
