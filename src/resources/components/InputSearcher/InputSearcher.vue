<template>
  <div class="input-searcher-box form-li" :class="borderClass">
    <Input
      v-model="currentValue"
      :placeholder="placeholder"
      :class="currentValue ? 'input-box' : ''"
      :style="getStyle"
      :clearable="true"
      @on-enter="onSearchValue"
      @on-clear="onSearchValue"
      @on-change="changeValue"
    >
      <template #prefix>
        <Icon type="ios-search" @click="onSearchValue" />
      </template>
    </Input>
  </div>
</template>
<script>
export default {
  name: 'InputSearcher',
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('form.placeholder.keyword');
      }
    },
    border: {
      type: String,
      default: 'border' // 可选：borer/none
    },
    width: {
      type: [String, Number], // 百分比、数值 例如：50 50px 50%
      default: ''
    }
  },
  data() {
    return {
      currentValue: this.$utils.isEmpty(this.value) ? '' : this.value
    };
  },
  mounted() {},
  methods: {
    onSearchValue() {
      this.$emit('change', this.currentValue);
    },
    changeValue() {
      this.$emit('input', this.currentValue);
    }
  },
  computed: {
    borderClass() {
      let resultJson = {};
      if (this.border) {
        resultJson['tsForm-border-' + this.border] = true;
        resultJson['tsForm-item'] = true;
      }
      this.className && (resultJson[this.className] = true);
      return resultJson;
    },
    getStyle() {
      let styleObj = {};
      if (typeof this.width == 'number') {
        styleObj.width = this.width + 'px';
      } else if (typeof this.width == 'string') {
        styleObj.width = this.width;
      }
      return styleObj;
    }
  },
  watch: {
    value(newValue) {
      this.currentValue = newValue;
    }
  }
};
</script>
<style lang="less" scoped>
.input-searcher-box {
 /deep/ .ivu-input {
    padding: 0 26px 0 26px !important;
  }
  /deep/ .ivu-input-prefix {
    left: 8px;
    i {
      font-size: 14px !important;
    }
  }
}
</style>
