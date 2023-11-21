<template>
  <div>
    <TsFormSelect
      ref="item"
      :value="value"
      v-bind="getSetting"
      :readonly="readonly"
      :disabled="disabled"
      :transfer="true"
      :isValueObject="isValueObject"
      border="border"
      @on-change="updateval"
    ></TsFormSelect>
  </div>
</template>
<script>
import viewmixin from './viewmixin.js';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: 'File',
  components: {
    TsFormSelect
  },
  filters: {},
  mixins: [viewmixin],
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
  methods: {
  },
  computed: {},
  watch: {}
};
</script>
