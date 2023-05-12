/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="dataList bg-op padding">
    <!-- start_静态数据源 -->
    <div class="static-main">
      <div class="static-title text-tip">
        <div class="formsetting-label require-label">{{ $t('page.value') }}</div>
        <div class="formsetting-label require-label">{{ $t('page.displaytext') }}</div>
      </div>
      <draggable
        v-if="dataList && dataList.length > 0"
        tag="ul"
        class="dataSource-ul"
        :list="dataList"
        handle=".ts-bars"
        ghost-class="li-active"
      >
        <li v-for="(item, index) in dataList" :key="index">
          <div class="li-input">
            <TsFormInput
              ref="valueValid"
              v-model="item.value"
              :placeholder="$t('form.placeholder.pleaseinput', {target: $t('page.value')})"
              maxlength="50"
              :index="index"
              :text="'text'"
              :validateList="validJson"
              class="item-text"
              @on-blur="autocompleteText(item, index)"
            ></TsFormInput>
            <TsFormInput
              ref="textValid"
              v-model="item.text"
              :placeholder="$t('form.placeholder.pleaseinput', {target: $t('page.displaytext')})"
              maxlength="50"
              :index="index"
              :text="'value'"
              :validateList="validJson"
              class="item-text"
              @on-blur="updateText(item.text)"
            ></TsFormInput>
          </div>
          <div class="li-btnList">
            <span
              v-if="dataList.length <= 500"
              class="tsfont-plus-o span-btn btn-add text-action"
              :title="$t('page.new')"
              @click="addOption(index)"
            ></span>
            <span
              v-if="dataList.length > 1"
              class="tsfont-minus-o span-btn btn-remove text-action"
              :title="$t('page.delete')"
              @click="removeOption(index)"
            ></span>
            <span v-if="dataList.length > 1" class="ts-bars span-btn btn-move" :title="$t('page.move')"></span>
          </div>
        </li>
      </draggable>
    </div>
    <!-- end_静态数据源 -->
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
let _this;
export default {
  name: 'DataList',
  components: {
    draggable,
    TsFormInput
  },
  props: {
    dataList: {
      type: Array,
      default: () => [{ value: '', text: '' }]
    },
    level: {
      type: [Number, String],
      default: 1
    }
  },

  data() {
    let _this = this;
    return {
      validJson: _this.level > 1 ? [{
        name: 'isAllEmpty',
        trigger: 'change',
        validator(rule, value, _vue) {
          if (_vue) {
            let index = _vue.$el.getAttribute('index');
            let text = _vue.$el.getAttribute('text');
            if (typeof value == 'string' && value.trim() != '') {
              return true;
            } else if (_this.dataList[index][text]) {
              return false;
            } else {
              _this.$refs[text + 'Valid'][index].validMesage = '';
            } 
          }
          return true;
        },
        message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.content')})
      }] : ['required']
    };
  },
  created() {},
  mounted() {
    _this = this;
  },
  destroyed() {},
  methods: {
    addOption(index) {
      //新增下拉选项
      this.dataList.splice(index + 1, 0, { value: '', text: '' });
    },
    removeOption(index) {
      //移除下拉选项
      this.$delete(this.dataList, index);
      this.updateDataList();
    },

    autocompleteText(item, index) {
      //失焦后，如果下拉显示为空，自动把值赋值过来
      let somevalue = 0;
      let value = item.value;
      if (value && !getDefaultValue(this.dataList, value, index)) {
        for (let a = 1; ; a++) {
          value = item.value + '_' + a;
          if (getDefaultValue(this.dataList, value)) {
            break;
          }
        }
      }
      item.value = value;
      if (!item.text && item.value) {
        item.text = item.value;
      }
      value && this.updateDataList();
    },
    updateText(text) {
      text && this.updateDataList();
    },
    validComponent() {
      let _this = this;
      let isValid = true;
      let val = [];
      let hasNull = false; //是否含有空的静态数据
      this.$refs.valueValid && this.$refs.valueValid.forEach(item => item.valid());
      this.$refs.textValid && this.$refs.textValid.forEach(item => item.valid());
      _this.dataList &&
        _this.dataList.forEach((item, a) => {
          if (item.value == '' && !hasNull) {
            hasNull = true;
            isValid = false;
          }
          if (item.text == '' && !hasNull) {
            hasNull = true;
            isValid = false;
          }
          if (item.isDefaultValue) {
            //默认选中数据处理
            val.push(item.value);
          }
        });
      return isValid;
    },
    updateDataList() {
      this.$emit('updateDataList', this.dataList);
    }
  },
  computed: {},
  watch: {}
};

function getDefaultValue(list, value, index) {
  //判断是否有重复数据
  let isDefaultValue = true;
  for (let i = 0; i < list.length; i++) {
    if (typeof index != 'undefined' && index != i && list[i].value == value) {
      isDefaultValue = false;
      break;
    } else if (typeof index == 'undefined' && list[i].value == value) {
      isDefaultValue = false;
      break;
    }
  }
  return isDefaultValue;
}
</script>
<style lang="less" scoped>
.dataList {
  border-radius: 10px;
  margin-top: 6px;
  .static-main {
    .static-title {
      display: flex;
      padding-right: 70px;
      .formsetting-label{
        flex: 1;
        line-height: 1;
        padding-bottom: 4px;
        font-size: 12px;
        &:not(:last-child){
          margin-right: 10px;
        }
      }
    }
    .dataSource-ul {
      list-style: none;
      > li {
        position: relative;
        padding-right: 70px;
        &:not(:last-child){
          margin-bottom: 8px;
        }
        .li-btnList {
          width: 60px;
          position: absolute;
          right: 0;
          top: 0;
          text-align: left;
          display: flex;
          align-items: center;
          .span-btn {
            &:not(:last-child){
              margin-right: 4px;
            }
          }
        }
        .li-input{
          display: flex;
          .item-text{
            flex: 1;
            &:not(:last-child){
              margin-right: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
