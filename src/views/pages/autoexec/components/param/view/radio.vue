<template>
  <TsFormRadio
    ref="item"
    :value="value"
    v-bind="getSetting"
    :readonly="readonly"
    :disabled="disabled"
    @on-change="updateval"
  ></TsFormRadio>
</template>
<script>
import viewmixin from './viewmixin.js';
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio';
export default {
  name: 'File',
  components: {
    TsFormRadio
  },
  filters: {},
  mixins: [viewmixin],
  data() {
    return {
      type: 'radio'
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
