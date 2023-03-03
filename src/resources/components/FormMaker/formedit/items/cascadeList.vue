<template>
  <cascadeList
    v-if="currentValue"
    :setting="currentConfig"
    :value="currentValue"
    :isReadonly="readonly"
    @update="updateval"
  >
  </cascadelist>
</template>

<script>
import cascadeList from '../view/cascadeList.vue';
export default {
  name: '',
  components: {
    cascadeList
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
    let _this = this;
    return {
      currentValue: null,
      currentConfig: null
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {
    this.val = this.value;
  },

  mounted() {},

  beforeUpdate() {},

  updated() {},

  methods: {
    updateval(val) {
      this.$emit('change', val);
    }
  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        if (!this.value) {
          //如果value值为空需要设置数组为默认值
          this.config.config.levelType == '2' && this.$emit('change', ['', '']);
          this.config.config.levelType == '3' && this.$emit('change', ['', '', '']);
        } else {
          this.currentValue = this.value.concat([]);
        }
      },
      deep: true,
      immediate: true
    },
    config: {
      handler(val) {
        this.currentConfig = JSON.parse(JSON.stringify(val));
        this.currentConfig.config.direction = 'transverse';
        this.currentConfig.config.width = '100%';
        this.currentConfig.config.desc = '';
        this.currentConfig.config.isRequired = false;
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .tsform-readonly {
  cursor: text;
}
</style>
