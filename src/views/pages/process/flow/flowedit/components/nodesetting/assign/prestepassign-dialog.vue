<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      title="配置条件路径"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Alert>
            <ul class="pl-sm">
              <li style="list-style:outside;">当条件路径非空：工单流转至前置步骤且处理人选择路径后点击流转时，需额外满足“用户流转的路径”和“条件路径”相同时才弹框指派当前步骤处理人。</li>
              <li style="list-style:outside;">当条件路径为空：工单流转至前置步骤且处理人点击流转时，直接弹框指派当前步骤处理人。</li>
              <!-- <li style="list-style:outside;">详情请查阅在线文档</li> -->
            </ul>
          </Alert>
          <TsFormItem label="条件路径">
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
