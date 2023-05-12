<template>
  <TsFormSelect
    ref="item"
    :value="value"
    v-bind="getSetting"
    :readonly="readonly"
    transfer
    @on-change="updateval"
  ></TsFormSelect>
</template>
<script>
import comMixin from './editmixin.js';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  filters: {},
  mixins: [comMixin],
  data() {
    return {
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
  methods: {},
  computed: {},
  watch: {}
};
</script>
