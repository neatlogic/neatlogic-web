<template>
  <TsDialog
    type="modal"
    :isShow.sync="showDialog"
    :title="$t('page.execute') + $t('term.autoexec.combinationtool')"
    @on-ok="onOk"
  >
    <TsForm ref="form" v-bind="formConfig"></TsForm>
  </TsDialog>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
export default {
  name: '',
  components: {
    TsForm
  },
  model: {
    prop: 'visible',
    event: 'change'
  },
  filtes: {},
  props: {
    visible: {
      default: false
    },
    dataList: {
      type: Array
    }
  },
  data() {
    let _this = this;
    let num = 10;
    let dataList = [];
    for (let i = 0; i <= num; i++) {
      dataList.push({value: Math.pow(2, i)});
    }
    return {
      showDialog: true,
      formConfig: {
        itemList: {
          roundCount: {
            type: 'select',
            value: 2,
            transfer: true,
            label: this.$t('term.autoexec.batchquantity'),
            desc: this.$t('term.autoexec.roundcountdescrition'),
            textName: 'value',
            dataList: dataList,
            validateList: ['required']
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
    onOk() {
      if (this.$refs.form.valid()) {
        this.showDialog = false;
        this.$emit('on-ok', this.$refs.form.getFormValue());
      }
    }
  },
  computed: {
  },
  watch: {
    showDialog() {
      this.$emit('change', this.showDialog);
    }
  }
};
</script>
<style lang='less' scoped>

</style>
