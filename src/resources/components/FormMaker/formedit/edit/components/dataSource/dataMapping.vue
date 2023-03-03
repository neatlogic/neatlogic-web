<template>
  <Row v-if="mapping" class="formsetting-text">
    <Col span="12" style="padding-right:5px;">
      <label class="formsetting-label text-grey require-label" style=" line-height: 1;margin-bottom: 8px;">值</label>
      <div class="formsetting-text">
        <TsFormSelect
          ref="mappingValue"
          v-model="mapping.value"
          type="text"
          :validateList="validJson"
          :dataList="dataList"
          valueName="uuid"
          textName="name"
          :transfer="true"
          :errorMessage="mapping.message"
          @on-change="onChange"
        ></TsFormSelect>
      </div>
    </Col>
    <Col span="12" style="padding-left:5px;">
      <label class="formsetting-label text-grey require-label" style="line-height: 1;margin-bottom: 8px;">显示文字</label>
      <div class="formsetting-text">
        <TsFormSelect
          ref="mappingText"
          v-model="mapping.text"
          type="text"
          :validateList="validJson"
          :dataList="dataList"
          valueName="uuid"
          textName="name"
          :transfer="true"
          @on-change="onChange"
        ></TsFormSelect>
      </div>
    </Col>
  </Row>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: 'DataMapping',
  components: { TsFormSelect },
  props: {
    matrixUuid: String,
    mapping: {
      type: Object,
      default: function() {
        return { value: '', text: '' };
      }
    },
    dataList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      validJson: ['required']
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
    onChange() {
      this.$emit('changeDefaultValue');
    },
    validComponent() {
      let _this = this;
      let componet = [
        { ref: 'mappingValue', message: '字段映射:值不能为空' },
        { ref: 'mappingText', message: '字段映射:显示文案不能为空' }
      ];
      let validList = [];
      componet.forEach(item => {
        _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && validList.push(item.message);
      });
      return validList;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
