<template>
  <div>
    <!-- start_显示格式 -->
    <TsFormItem :label="$t('page.displayformat')" labelPosition="top">
      <TsFormRadio
        :value="config.format"
        :dataList="formatList"
        :disabled="disabled"
        @on-change="val => {
          setConfig('format', val);
        }"
      ></TsFormRadio>
    </TsFormItem>
    <!-- 校验 -->
    <TsFormItem :label="$t('page.validate')" labelPosition="top">
      <div class="padding-sm radius-sm" :class="validClass('validValueList')">
        <div class="flex-between" style="display:flex">
          <span>{{ $t('page.custom') }}</span>
          <Checkbox
            :value="checkValidType('custom')"
            label="custom"
            :disabled="disabled"
            @on-change="val => {
              if(val) {
                setConfig('validType', ['custom']);
              }else {
                setConfig('validType', []);
              }
            }"
          ></Checkbox>
        </div>
        <!-- 自定义校验 -->
        <div v-if="checkValidType('custom')">
          <TsRow
            v-for="(valid, vindex) in config.validValueList"
            :key="vindex"
            :gutter="8"
            class="filter-row"
          >
            <Col span="6">
              <TsFormSelect
                ref="validText"
                v-model="valid.text"
                :dataList="filterDataList"
                :validateList="validateList"
                border="bottom"
                :disabled="disabled"
                transfer
              ></TsFormSelect>
            </Col>
            <Col :span="valid.filter == 'custom'?9:18">
              <TsFormSelect
                ref="validFilter"
                v-model="valid.filter"
                :dataList="getFilterData()"
                :validateList="validateList"
                border="bottom"
                :disabled="disabled"
                transfer
              >
              </TsFormSelect>
            </Col>
            <Col v-if="valid.filter == 'custom'" span="9">
              <TsFormDatePicker
                ref="validValue"
                v-model="valid.value"
                value-type="format"
                :format="config.format"
                :validateList="validateList"
                type="time"
                width="100%"
                border="bottom"
                :disabled="disabled"
                transfer
              ></TsFormDatePicker>
            </Col>
            <i class="tsfont-close-o valid-remove text-tip-active" :title="$t('page.delete')" @click="removeFilter(vindex)"></i>
          </TsRow>
          <span class="tsfont-plus text-href" @click="addFilter">{{ $t('page.rule') }}</span>
        </div>
      </div>
    </TsFormItem>

    <!-- 默认值 -->
    <!--<TsFormItem label="默认值" labelPosition="top">
      <div class="bg-op padding-sm radius-sm">
        <div>自定义</div>
        <TsFormDatePicker
          :value="config.defaultValue"
          type="time"
          valueType="format"
          :format="config.format"
          width="100%"
          transfer
          @on-change="val => {
            setConfig('defaultValue', val);
          }"
        ></TsFormDatePicker>
      </div>
    </TsFormItem>-->

    <TsFormItem :label="$t('page.inputtip')" labelPosition="top">
      <TsFormInput
        :value="config.placeholder"
        :maxlength="50"
        :disabled="disabled"
        @on-change="val => {
          setConfig('placeholder', val);
        }"
      ></TsFormInput>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  extends: base,
  props: {},
  data() {
    return {
      formatList: [
        { value: 'HH:mm:ss', text: this.$t('page.hou') + ':' + this.$t('page.minu') + ':' + this.$t('page.second') },
        { value: 'HH:mm', text: this.$t('page.hou') + ':' + this.$t('page.minu') }
      ],
      filterDataList: [
        { text: this.$t('page.later'), value: 'later' },
        { text: this.$t('page.earlier'), value: 'earlier' }
      ],
      validateList: ['required']
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    removeFilter(index) {
      this.config.validValueList.splice(index, 1);
    },
    addFilter() {
      if (!this.config.validValueList) {
        this.$set(this.config, 'validValueList', []);
      }
      this.config.validValueList.push({ text: '', value: '', filter: '' });
    }
  },
  filter: {},
  computed: {
    checkValidType() {
      return type => {
        return this.config.validType && this.config.validType.indexOf(type) >= 0;
      };
    },
    getFilterData() {
      return () => {
        let filterList = [{ text: this.$t('page.custom'), value: 'custom' }];
        this.formItemList.forEach((item) => {
          if (item.handler == 'formtime' && item.uuid != this.formItem.uuid) {
            filterList.push({ text: item.label, value: item.uuid });
          }
        });
        return filterList;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.filter-row {
  position: relative;
  padding-right: 12px;
  .valid-remove {
    position: absolute;
    right: -8px;
    top: 0;
    display: none;
  }
  &:hover {
    .valid-remove {
      display: block;
    }
  }
}
</style>
