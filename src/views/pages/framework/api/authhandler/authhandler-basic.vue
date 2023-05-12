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
          label: this.$t('page.account'),
          onChange: val => {
            this.$set(this.config, 'username', val);
          }
        },
        password: {
          type: 'password',
          label: this.$t('page.password'),
          onChange: val => {
            this.$set(this.config, 'password', val);
          }
        },
        getType: {
          type: 'select',
          label: this.$t('page.requestmethod'),
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
