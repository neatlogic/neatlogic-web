<template>
  <div>
    <TsForm ref="form" :item-list="formConfig"></TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    config: { type: Object }
  },
  data() {
    return {
      formConfig: {
        groupList: {
          type: 'checkbox',
          label: '可选范围',
          validateList: ['required'],
          value: this.config.groupList,
          dataList: [
            { value: 'common', text: '公共' },
            { value: 'user', text: '用户' },
            { value: 'team', text: '分组' },
            { value: 'role', text: '角色' }
          ],
          onChange: val => {
            this.$set(this.config, 'groupList', val);
          }
        },
        isMultiple: {
          type: 'radio',
          value: this.config.isMultiple,
          dataList: [{value: 1, text: '是'}, {value: 0, text: '否'}],
          validateList: ['required'],
          label: '多选',
          onChange: val => {
            this.$set(this.config, 'isMultiple', val);
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
      return this.$refs['form'].valid();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
