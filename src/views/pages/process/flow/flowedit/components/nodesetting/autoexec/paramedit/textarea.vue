<template>
  <TsFormInput
    ref="item"
    :value="value"
    v-bind="getSetting"
    maxlength="500"
    type="textarea"
    @on-change="updateval"
  ></TsFormInput>
</template>
<script>
import comMixin from './editmixin.js';
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  mixins: [comMixin],
  props: {},
  data() {
    return {};
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
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
