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
  <div class="protocol">
    <TsFormSelect 
      ref="item" 
      v-bind="getConfig"
      :value="value"
      :readonly="readonly"
      transfer
    ></TsFormSelect>
  </div>
</template>
<script>
import comMixin from '../paramedit/editmixin.js';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {
  },
  mixins: [comMixin],
  props: {
    value: [Number, String]
  },
  data() {
    let _this = this;
    return {
      protocolConfig: {
        dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
        multiple: false,
        rootName: 'tbodyList',
        search: true,
        clearable: true,
        transfer: true,
        dealDataByUrl: _this.dealDataByUrlProtocol || null
      },
      currentValue: ''
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
    dealDataByUrlProtocol(nodeList) { // 处理默认值的数据结构
      return this.dealDataFilterProtocol(nodeList);
    },
    dealDataFilterProtocol(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];           
      nodeList.forEach(v => {
        let text = '';
        if (v.port) {
          text = v.name + '(' + v.port + ')';
        } else {
          text = v.name;
        }
        columlist.push(
          {text: text, value: v.id}
        );
      });
      return columlist;
    }
  },
  computed: {
    getConfig() {
      let config = Object.assign({}, this.protocolConfig);
      config.validateList = [];
      if (typeof this.isRequired == 'boolean') {
        //当从别的判断带过来的关于这个组件是否必填的选项时，进行原来required的覆盖
        if (this.isRequired) {
          config.validateList.push('required');
        } else if (!this.isRequired && config.validateList.indexOf('required') > -1) {
          config.validateList = config.validateList.filter(v => {
            return v != 'required';
          });
        }
      }
      return config;
    }
  },
  watch: {}
};
</script>

