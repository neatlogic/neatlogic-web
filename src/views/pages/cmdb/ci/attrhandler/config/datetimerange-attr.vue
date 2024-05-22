<template>
  <div>
    <TsForm :item-list="formConfig">
      <template v-slot:format>
        <TsFormSelect
          v-model="myConfig.format"
          :dataList="dynamicFormatList"
          :validateList="['required']"
        ></TsFormSelect>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    config: {type: Object}
  },
  data() {
    const _this = this;
    return {
      myConfig: {},
      typeList: [
        {value: 'daterange', text: '日期范围'},
        {value: 'timerange', text: '时间范围'},
        {value: 'datetimerange', text: '日期时间范围'}
      ],
      formatList: [
        {value: 'yyyy-MM-dd HH:mm', text: 'yyyy-MM-dd HH:mm', type: ['datetimerange']},
        {value: 'yyyy-MM-dd', text: 'yyyy-MM-dd', type: ['daterange']},
        {value: 'MM-dd', text: 'MM-dd', type: ['daterange']},
        {value: 'HH:mm:ss', text: 'HH:mm:ss', type: ['timerange']}],
      dynamicFormatList: [],
      formConfig: {
        type: {
          type: 'select',
          label: '输入类型',
          validateList: ['required'],
          transfer: true,
          onChange: (val) => {
            this.$set(this.myConfig, 'type', val);
          }
        },
        format: {
          type: 'slot',
          label: '格式',
          validateList: ['required'],
          transfer: true,
          onChange: (val) => {
            this.$set(this.myConfig, 'format', val);
          }
        }
      }};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.formConfig.type.dataList = this.typeList;
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {
    type: function() {
      return this.myConfig.type;
    }
  },
  watch: {
    myConfig: {
      handler: function(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    },
    type: {
      handler: function(newval, oldval) {
        if (newval !== oldval) {
          this.dynamicFormatList = this.formatList.filter(f => f.type.includes(newval));
          this.$forceUpdate();
        }
      },
      deep: true
    },
    config: {
      handler: function(val) {
        this.myConfig = val || {};
        if (this.myConfig) {
          for (const k in this.myConfig) {
            this.formConfig[k].value = this.myConfig[k];
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
