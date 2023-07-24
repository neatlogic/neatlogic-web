<template>
  <UserSelect
    transfer
    :value="value"
    v-bind="getSetting"
    :readonly="readonly"
    @on-change="updateval"
  ></UserSelect>
</template>

<script>
import UserSelect from '@/resources/components/UserSelect/UserSelect';
export default {
  name: '',
  components: {
    UserSelect
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    config: Object,
    value: [String, Boolean, Object, Array],
    readonly: {
      type: Boolean,
      default: false
    }
  },
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
    updateval(val) {
      this.$emit('change', val);
    }
  },

  filter: {},

  computed: {
    getSetting() {
      let json = {};
      let config = this.config.config;
      if (config) {
        json.multiple = !!config.isMultiple; 
        json.groupList = config.initConfig ? config.initConfig.groupList : config.groupList;
        json.readonlyClass = config.readonlyClass;
        json.sperateText = config.sperateText;
      }
      json.width = '100%';
      return json;
    }
  },
  watch: {
    value: {
      handler(val) {
        if (this.config.config.isMultiple && !(val instanceof Array)) {
          this.$emit('change', []);
        } else if (!this.config.config.isMultiple && (typeof val != 'string')) {
          this.$emit('change', '');
        }
      },
      deep: true,
      immediate: true
    }
    
  }

};

</script>
