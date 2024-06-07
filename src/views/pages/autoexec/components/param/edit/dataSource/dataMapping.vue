
<template>
  <div v-if="mapping" class="mapping-block bg-op padding">
    <div class="item">
      <div class="formsetting-label text-grey require-label">{{ $t('page.value') }}</div>
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
    </div>
    <div class="item">
      <div class="formsetting-label text-grey require-label">{{ $t('page.displaytext') }}</div>
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
    </div>
  </div>
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
      this.$emit('updateMapping');
    },
    validComponent() {
      let _this = this;
      let isValid = true;
      let componet = ['mappingValue', 'mappingText'];
      componet.forEach(item => {
        if (_this.$refs[item] && !_this.$refs[item].valid()) {
          isValid = false;
        }
      });
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
.mapping-block{
  width: 100%;
  display: flex;
  border-radius: 10px;
  .item {
    flex: 1;
      &:not(:last-child){
        margin-right: 10px;
    }
    .formsetting-label {
      padding-bottom: 4px;
      font-size: 12px;
      line-height: 1;
    }
  }
}
</style>
