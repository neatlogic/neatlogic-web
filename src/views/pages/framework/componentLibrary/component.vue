<template>
  <div>
    <TsForm ref="comForm" :itemList="comForm"></TsForm>
    <!-- <TsForm v-if="formType='itsm'" ref="item" :itemList="item"></TsForm> -->

  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: [],
  data() {
    const _this = this;
    return {
      comForm: [
        {
          type: 'select',
          name: 'defaultPriorityUuid',
          label: this.$t('page.plugins'),
          value: '',
          transfer: true,

          dataList: [
            {
              text: this.$t('term.framework.itsmworkorder'),
              value: 'itsm'
            }
          ],
          validateList: [
            //验证规则
            'required'
          ]
        }
      ],
      item: [
        {
          name: 'nnn',
          value: '',
          type: 'text',
          label: this.$t('term.dashboard.widgetname'),
          validateList: ['required']
        },
        {
          name: 'xxx',
          value: '',
          type: 'select',
          dataList: [
            {
              text: this.$t('term.framework.itsmworkorder'),
              value: 'itsm'
            }
          ],
          label: this.$t('term.framework.scope'),
          transfer: true,
          validateList: ['required']
        }
      ]
      // formType: ''
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
    // typeSelect(val) {
    //   this.formType = val;
    // },
    // submit() {
    //   if (this.$refs.comForm.valid()) {
    //     console.log(1);
    //   }
    // }
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>
<style lang='less' scoped>
</style>
