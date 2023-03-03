<template>
  <div>
    <TsFormDatePicker
      v-model="value"
      v-bind="config"
      :format="config.tsFormDateFormat"
      value-type="format"
      type="date"
      transfer
      border="border"
      :validateList="validateList"
    ></TsFormDatePicker>
  </div>
</template>
<script>
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
export default {
  name: '',
  components: {
    TsFormDatePicker
  },
  filters: {
  },
  props: {
    config: {
      type: Object
    },
    validateList: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      value: ''
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
  watch: {
    value: {
      handler: function(val, oldVal) {
        !this.$utils.isSame(val, oldVal) && this.$emit('setParam', val);
      }
    },
    config: {
      handler: function(val, oldVal) {
        if (this.config && this.config.defaultValue) {
          !this.$utils.isSame(val, oldVal) && (this.value = this.config.defaultValue);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
