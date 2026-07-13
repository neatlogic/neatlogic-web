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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
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
          label: this.$t('page.type'),
          validateList: ['required'],
          dataList: [
            {value: 'outterlink', text: this.$t('term.cmdb.outerlink')},
            {value: 'innerlink', text: this.$t('term.cmdb.innerlink')}
            //{value: 'route', text: '内部路由'}
          ],
          desc: this.$t('term.cmdb.hyperlinktypedesc'),
          onChange: (val) => {
            this.$set(this.myConfig, 'type', val);
          }
        },
        text: {
          type: 'text',
          label: this.$t('term.cmdb.displaytext'),
          maxlength: 30,
          desc: this.$t('term.cmdb.hyperlinktextdesc'),
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
