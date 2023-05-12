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
  <div class="batch-data-contianer" contenteditable="true"></div>
</template>
<script>
export default {
  name: 'BatchData',
  components: {},
  props: {
    jsonList: {
      //{value text}
      type: Array
    }
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initValue();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getValue() {
      let validMessage = '';
      let valueString = this.$el.innerText;
      let strArray = [];
      let ary = valueString.split('\n');
      for (let i = 0; i < ary.length; i++) {
        let str = ary[i].trim();
        if (str) {
          //当不为空时
          let index = str.indexOf(',');
          if (index == 0) {
            if (str.replace(',', '').trim() == '') {
              continue;
            } else {
              validMessage = this.$t('form.validate.required', {target: this.$t('page.value')});
              break;
            }
          } else {
            //校验数据
            index = str.indexOf(',');
            if (str.trim('') == '' || (index === 0 && str.replace(',', '').trim() == '')) {
              continue;
            } else if (index === 0) {
              validMessage = this.$t('form.validate.required', {target: this.$t('page.value')});
              break;
            }

            let json = null;
            if (index < 0) {
              json = { value: str, text: str };
            } else {
              json = { value: str.slice(0, index), text: str.slice(index + 1) };
            }
            json && strArray.push(json);
            strArray.length > 500 && (validMessage = this.$t('term.autoexec.batchedittip3'));
            if (validMessage) {
              break;
            }
          }
          if (!getDefaultValue(strArray, strArray[strArray.length - 1].value, strArray.length - 1)) {
            validMessage = this.$t('term.autoexec.verifydifferentvalues');
            break;
          }
        }
      }

      if (!validMessage) {
        strArray.length > 500 && (validMessage = this.$t('term.autoexec.batchedittip3'));
      }

      if (validMessage) {
        this.$Message.error(validMessage);
        return false;
      }
      return strArray;
    },
    initValue() {
      let str = '';
      this.jsonList.forEach(json => {
        str = str ? str + '\n' + json.value + ',' + json.text : json.value + ',' + json.text;
      });
      this.$el.innerText = str;
    }
  },
  filter: {},
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
<style lang="less">
.batch-data-contianer {
  border: 1px solid #ddd;
  padding: 12px;
  line-height: 2;
  outline: none;
  min-height: 300px;
  &:empty:before {
    content: '值,显示文案';
  }
}
</style>
