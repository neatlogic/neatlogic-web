<template>
  <div>
    <TsForm :item-list="formConfig">
    </TsForm>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';

export default {
  name: '',
  components: {
    TsForm
  },
  props: {},
  data() {
    return {
      config: {},
      formConfig: {
        username: {
          type: 'text',
          label: '帐号',
          onChange: val => {
            this.$set(this.config, 'username', val);
          }
        },
        password: {
          type: 'password',
          label: '密码',
          onChange: val => {
            this.$set(this.config, 'password', val);
          }
        },
        getType: {
          type: 'select',
          label: '请求方式',
          dataList: [{text: 'get', value: 'get'}, {text: 'post', value: 'post'}],
          onChange: val => {
            this.$set(this.config, 'method', val);
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
  methods: {},
  filter: {},
  computed: {},
  watch: {
    config: {
      handler: function(val) {
        this.$emit('setConfig', this.config);
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
