<template>
  <div>
    <TsFormItem :label="$t('term.framework.selectlevel')" labelPosition="left" contentAlign="right">
      <Slider
        v-model="config.levelType"
        show-stops
        show-tip="hover"
        :min="2"
        :max="5"
        :disabled="disabled"
      ></Slider>
    </TsFormItem>
    <TsFormItem :label="$t('page.datasource')" labelPosition="top">
      <TsFormRadio v-model="config.dataSource" :dataList="dataSourceList" :disabled="disabled"></TsFormRadio>
    </TsFormItem>
    <TsFormItem v-if="config.dataSource === 'static'" :label="$t('page.dropdownoption')" labelPosition="top">
      <div class="radius-sm padding-md" :class="validClass('dataList')">
        <Tabs value="level1">
          <TabPane
            v-for="level of config.levelType"
            :key="level"
            :label="levelText(level) + $t('term.framework.grade')"
            :name="'level' + level"
          >
            <div v-if="level > 1">
              <div
                v-for="subLevel of level - 1"
                :key="subLevel"
              >
                <TsFormItem
                  v-if="levelDataList['L' + subLevel]"
                  :label="levelText(subLevel) + $t('term.framework.leveloptions')"
                  labelPosition="top"
                >
                  <TsFormSelect
                    :dataList="getLevelDataList(subLevel)"
                    transfer
                    border="border"
                    :disabled="disabled"
                    @on-change="
                      val => {
                        const selectItem = levelDataList['L' + subLevel].find(d => d.value === val);
                        $set(levelDataList, 'L' + (subLevel + 1), null);
                        if (selectItem) {
                          if (!selectItem.hasOwnProperty('children')) {
                            $set(selectItem, 'children', []);
                          }
                          $nextTick(() => {
                            $set(levelDataList, 'L' + (subLevel + 1), selectItem['children']);
                          });
                        }
                      }
                    "
                  ></TsFormSelect>
                </TsFormItem>
              </div>
            </div>
            <StaticDataEditor
              v-if="levelDataList['L' + level]"
              v-model="levelDataList['L' + level]"
              :needCopyValue="false"
              :needBatchEdit="level == 1"
              :disabled="disabled"
              @change-level="changeLevel"
            ></StaticDataEditor>
          </TabPane>
        </Tabs>
      </div>
    </TsFormItem>
    <TsFormItem v-if="config.dataSource === 'matrix'" :label="$t('page.matrix')" labelPosition="top">
      <div class="radius-sm padding-md" :class="validClass('matrixUuid')"><TsFormSelect
        v-model="config.matrixUuid"
        dynamicUrl="/api/rest/matrix/search"
        rootName="tbodyList"
        textName="name"
        valueName="uuid"
        :disabled="disabled"
        transfer
      ></TsFormSelect></div>
    </TsFormItem>
    <TsFormItem v-if="config.dataSource === 'matrix' && config.matrixUuid && mappingDataList.length > 0" labelPosition="top" label="字段映射">
      <div class="padding-md radius-md" :class="validClass('mapping')">
        <Row :gutter="10">
          <Col span="12">
            <label class="text-grey require-label">{{ $t('page.value') }}</label>
            <div class="formsetting-text">
              <TsFormSelect
                ref="mappingValue"
                v-model="config.mapping.value"
                type="text"
                :validateList="['required']"
                :dataList="mappingDataList"
                valueName="uuid"
                textName="name"
                :transfer="true"
                :disabled="disabled"
              ></TsFormSelect>
            </div>
          </Col>
          <Col span="12">
            <label class="text-grey require-label">{{ $t('page.displaytext') }}</label>
            <div class="formsetting-text">
              <TsFormSelect
                ref="mappingText"
                v-model="config.mapping.text"
                type="text"
                :validateList="['required']"
                valueName="uuid"
                :dataList="mappingDataList"
                textName="name"
                :transfer="true"
                :disabled="disabled"
              ></TsFormSelect>
            </div>
          </Col>
        </Row>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.inputtip')" labelPosition="top">
      <TsFormInput v-model="config.placeholder" :maxlength="50" :disabled="disabled"></TsFormInput>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    StaticDataEditor: () => import('./common/static-data-editor.vue')
  },
  extends: base,
  props: {},
  data() {
    return {
      dataSourceList: [
        { value: 'static', text: this.$t('page.staticdatasource') }
        //{ value: 'matrix', text: '矩阵' }
      ],
      defaultValueTypeList: [
        { value: 'self', text: this.$t('page.custom') },
        { value: 'quote', text: this.$t('page.reference') }
      ],
      mappingDataList: [],
      levelDataList: {}
    };
  },
  beforeCreate() {},
  created() {
    this.$set(this.levelDataList, 'L1', this.config.dataList);
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
    changeLevel(level) {
      this.$set(this.config, 'levelType', level);
    }
  },
  filter: {},
  computed: {
    levelText() {
      return level => {
        switch (level) {
          case 1:
            return '一';
          case 2:
            return '二';
          case 3:
            return '三';
          case 4:
            return '四';
          case 5:
            return '五';
          case 6:
            return '六';
        }
      };
    },
    getLevelDataList() {
      return level => {
        const dataList = [];
        if (this.levelDataList['L' + level] && this.levelDataList['L' + level].length > 0) {
          this.levelDataList['L' + level].forEach(d => {
            let isValid = false;
            const data = {};
            const value = d.value || d.value === 0 ? d.value : null;
            const text = d.text || d.text === 0 ? d.text : null;
            if (value != null && text != null) {
              data.value = value;
              data.text = text;
              isValid = true;
            } else if (value == null && text != null) {
              data.value = text;
              data.text = text;
              isValid = true;
            } else if (value != null && text == null) {
              data.value = value;
              data.text = value;
              isValid = true;
            }
            if (isValid && !dataList.find(dd => dd.value == data.value)) {
              dataList.push(data);
            }
          });
        }
        return dataList;
      };
    },
    defaultValueSetting() {
      const setting = {};
      const config = this.config;
      if (config.isMultiple) {
        setting.multiple = config.isMultiple;
      }
      if (config.dataSource === 'matrix') {
        setting.dynamicUrl = '/api/rest/matrix/column/data/search/forselect';
        setting.rootName = 'dataList';
        const params = { matrixUuid: config.matrixUuid };
        if (this.config.mapping) {
          params.keywordColumn = this.config.mapping.text;
          params.valueField = this.config.mapping.value;
          params.textField = this.config.mapping.text;
        }
        setting.params = params;
      } else {
        setting.dataList = config.dataList;
      }
      return setting;
    }
  },
  watch: {
    levelDataList: {
      handler: function(val) {
        if (val && val['L1']) {
          this.config.dataList = val['L1'];
        }
      },
      deep: true
    },
    'config.matrixUuid': {
      handler: function(newVal, oldVal) {
        if (newVal) {
          if (oldVal && newVal != oldVal) {
            this.config.mapping.value = '';
            this.config.mapping.text = '';
          }
          this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: newVal }).then(res => {
            if (res.Status == 'OK') {
              this.mappingDataList = res.Return.tbodyList;
            }
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
