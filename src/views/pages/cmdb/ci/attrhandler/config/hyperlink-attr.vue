<template>
  <div>
    <TsForm ref="form" :item-list="formConfig">
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    config: {type: Object},
    attrData: {type: Object}
  },
  data() {
    return {
      dataList: [],
      myConfig: {},
      formConfig: {
        type: {
          type: 'radio',
          label: '类型',
          validateList: ['required'],
          dataList: [
            {value: 'outterlink', text: '外部链接'},
            {value: 'innerlink', text: '内部链接'}
            //{value: 'route', text: '内部路由'}
          ],
          desc: '外部链接：使用新窗口打开页面，必须是http或https开头；内部链接：使用当前窗口打开页面，支持http、https或/开头，支持跳转到其他模块',
          onChange: (val) => {
            this.$set(this.myConfig, 'type', val);
          }
        },
        text: {
          type: 'text',
          label: '显示文本',
          maxlength: 30,
          desc: '如果不指定则使用超链接图标代替',
          onChange: (val) => {
            this.$set(this.myConfig, 'text', val);
          }
        }
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
    valid() {
      const form = this.$refs['form'];
      return form.valid();
    }
  },
  filter: {},
  computed: {},
  watch: {
    myConfig: {
      handler: function(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    },
    config: {
      handler: function(val) {
        this.myConfig = val || {};
        if (this.myConfig) {
          for (const k in this.myConfig) {
            if (this.formConfig[k]) {
              this.formConfig[k].value = this.myConfig[k];
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
