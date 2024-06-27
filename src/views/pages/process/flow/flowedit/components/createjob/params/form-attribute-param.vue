<template>
  <div>
    <div class="pb-sm">
      <span>{{ $t('term.process.formparamsvalue') }}</span>
      <span>
        <Tooltip
          placement="right"
          max-width="400"
          theme="light"
          transfer
        >
          <b class="tsfont-info-o text-href"></b>
          <div slot="content">
            <p>{{ $t('term.process.formparamsvaluetip') }}</p>
          </div>
        </Tooltip>
      </span>
    </div>
    <template v-if="formAttributeMappingList.length > 0">
      <div class="pb-sm text-title">
        <TsRow :gutter="8">
          <Col span="11">
            <div>{{ $t('page.formparams') }}</div>
          </Col>
          <Col span="11">
            <div>{{ $t('term.process.exportparameters') }}</div>
          </Col>
        </TsRow>
      </div>
      <div v-for="(item, index) in formAttributeMappingList" :key="index" class="pb-sm">
        <TsRow :gutter="8">
          <Col span="11">
            <TsFormSelect
              v-model="item.key"
              :dataList="formDataList"
              textName="label"
              valueName="uuid"
              transfer
              border="border"
              @on-change="changeFormItem"
            ></TsFormSelect>
          </Col>
          <Col span="11">
            <TsFormSelect
              v-model="item.value"
              :dataList="exportParamList"
              :firstSelect="false"
              transfer
              border="border"
            ></TsFormSelect>
          </Col>
          <Col span="2">
            <span class="del-btn tsfont-trash-o text-tip-active" @click="delFormParam(index)"></span>
          </Col>
        </TsRow>
      </div>
    </template>
    <Button
      v-if="formAttributeMappingList.length !== formDataList.length"
      type="primary"
      ghost
      @click="addFormParam()"
    >
      <span class="tsfont-plus pr4"></span><span>{{ $t('page.param') }}</span>
    </Button>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    formAttributeMappingList: Array,
    allFormitemList: Array,
    exportParamList: Array
  },
  data() {
    return {
      formDataList: [] //表单赋值：仅支持文本框、文本域类型的控件赋值
    };
  },
  beforeCreate() {},
  created() {
    if (this.allFormitemList && this.allFormitemList.length > 0) {
      this.formDataList = this.$utils.deepClone(this.allFormitemList).filter(item => {
        return item.handler === 'formtext' || item.handler === 'formtextarea';
      });
    }
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
    changeFormItem() {
      this.formDataList.forEach(e => {
        let find = this.formAttributeMappingList.find(f => f.key == e.uuid);
        if (find) {
          this.$set(e, '_disabled', true);
        } else {
          this.$set(e, '_disabled', false);
        }
      });
    },
    addFormParam() {
      let obj = {
        key: '',
        value: ''
      };
      this.formAttributeMappingList.push(obj);
      this.changeFormItem();
    },
    delFormParam(index) {
      this.formAttributeMappingList.splice(index, 1);
      this.changeFormItem();
    },
    valid() {
      let isValid = true;
      for (let key in this.$refs) {
        let item = this.$refs[key];
        if (Array.isArray(item)) {
          item.forEach(v => {
            if (v && v.valid) {
              !v.valid() && (isValid = false);
            }
          });
        } else {
          if (item && item.valid) {
            !item.valid() && (isValid = false);
          }
        }
      }
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.del-btn {
  line-height: 32px;
}
</style>
