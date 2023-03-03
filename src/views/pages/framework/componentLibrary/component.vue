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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: [],
  data() {
    const _this = this;
    return {
      comForm: [
        {
          type: 'select',
          name: 'defaultPriorityUuid',
          label: '插件',
          value: '',
          transfer: true,

          dataList: [
            {
              text: 'itsm工单',
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
          label: '组件名称',
          validateList: ['required']
        },
        {
          name: 'xxx',
          value: '',
          type: 'select',
          dataList: [
            {
              text: 'itsm工单',
              value: 'itsm'
            }
          ],
          label: '适用范围',
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
