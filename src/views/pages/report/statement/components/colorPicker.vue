<template>
  <el-input
    v-model="colorValue"
    clearable
    :placeholder="$t('form.placeholder.inputcolor')"
    size="mini"
    @change="changeColor"
  >
    <template slot="append">
      <el-color-picker
        v-model="colorValue"
        :predefine="predefineColors"
        show-alpha
        size="mini"
        @change="changeColor"
      />
    </template>
  </el-input>
</template>

<script>
export default {
  name: 'ColorPicker',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: [String],
      default: ''
    }
  },
  data() {
    return {
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585'
      ],
      colorValue: ''
    };
  },
  mounted() {
    this.colorValue = this.value;
  },
  methods: {
    changeColor(val) {
      this.colorValue = val || '';
      this.$emit('input', this.colorValue);
      this.$emit('change', this.colorValue);
    }
  },
  watch: {
    value(val) {
      this.colorValue = val || '';
    }
  }
};
</script>
<style  scoped>
/deep/.el-color-picker--mini,
/deep/.el-color-picker--mini .el-color-picker__trigger {
  width: 23px;
  height: 23px;
}
</style>
