<template>
  <div>
    <TsForm ref="form" v-model="argumentFormValue" :item-list="argumentSettingFormConfig"></TsForm>
  </div>
</template>
<script>
export default {
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: { 
    argumentData: { 
      type: Object
    } 
  },
  data() {
    return {
      argumentFormValue: {
        toUsers: [],
        subject: '',
        content: ''
      }, // 参数设置form表单值
      argumentSettingFormConfig: {
        toUsers: {
          type: 'userselect',
          label: this.$t('page.recipient'),
          groupList: ['user'],
          validateList: ['required'],
          search: true,
          multiple: true
        },
        subject: {
          label: this.$t('page.theme'),
          type: 'text',
          validateList: ['required']
        },
        content: {
          label: this.$t('page.content'),
          type: 'codemirror'
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
      return this.$refs.form.valid();
    },
    getFormValue() {
      // 提供给外部获取form表单值使用
      let deepClone = this.$utils.deepClone(this.argumentFormValue);
      return JSON.stringify(deepClone);
    }
  },
  filter: {},
  computed: {},
  watch: {
    argumentData: {
      handler: function(argumentsData) {
        if (argumentsData) {
          for (let key in argumentsData) {
            this.argumentFormValue[key] = argumentsData[key];
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
