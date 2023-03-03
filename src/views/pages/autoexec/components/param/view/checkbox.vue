<template>
  <TsFormCheckbox
    ref="item"
    :value="value"
    v-bind="getSetting"
    :readonly="readonly"
    :disabled="disabled"
    @on-change="updateval"
  ></TsFormCheckbox>
</template>
<script>
import viewmixin from './viewmixin.js';
import TsFormCheckbox from '@/resources/plugins/TsForm/TsFormCheckbox';
export default {
  name: 'File',
  components: {
    TsFormCheckbox
  },
  filters: {},
  mixins: [viewmixin],
  data() {
    return {
      type: 'checkbox'
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
