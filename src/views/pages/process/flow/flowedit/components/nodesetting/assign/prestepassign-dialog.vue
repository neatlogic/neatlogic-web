<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :title="$t('term.process.configconditionpath')"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Alert>
            <ul class="pl-sm">
              <li style="list-style:outside;">{{ $t('term.process.conditionpathnotemptytip') }}</li>
              <li style="list-style:outside;">{{ $t('term.process.conditionpathemptytip') }}</li>
              <!-- <li style="list-style:outside;">详情请查阅在线文档</li> -->
            </ul>
          </Alert>
          <TsFormItem :label="$t('term.process.conditionpath')">
            <TsFormSelect
              v-model="uuid"
              :dataList="conditionNodeList"
              textName="name"
              valueName="uuid"
              border="border"
              multiple
              transfer
            ></TsFormSelect>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    config: Object,
    conditionNodeList: Array
  },
  data() {
    return {
      uuid: this.config && this.$utils.deepClone(this.config.condition)
    };
  },
  beforeCreate() {},
  created() {
   
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    okDialog() {
      this.$emit('close', this.uuid);
    },
    closeDialog() {
      this.$emit('close', this.config && this.config.condition);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
