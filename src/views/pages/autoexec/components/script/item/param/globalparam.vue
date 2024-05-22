<template>
  <TsFormSelect
    v-model="currentValue"
    v-bind="globalparamForm"
    :params="params"
    :disabled="disabled"
    :readonly="readonly"
    @change="changeValue"
  ></TsFormSelect>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    params: Object,
    value: [Number, String],
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentValue: null,
      globalparamForm: {
        dynamicUrl: '/api/rest/autoexec/global/param/search',
        rootName: 'tbodyList',
        border: 'border',
        transfer: true,
        clearable: false,
        dealDataByUrl: this.dealDataByUrl
      }

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
    dealDataByUrl(list) {
      let dataList = [];
      list.forEach(item => {
        let text = item.key;
        if (item.defaultValue) {
          text += '[' + item.defaultValue + ']';
        }
        dataList.push({
          text: text,
          value: item.key
        });
      });
      return dataList;
    },
    changeValue(val) {
      this.$emit('update:value', val);
      this.$emit('change', val);
    }
  },
  filter: {},
  computed: {},
  watch: {
    value: {
      handler(val) {
        this.currentValue = val;
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
