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
  <div>
    <TsRow :gutter="8">
      <Col span="24">
        <TsFormSelect
          ref="account"
          :value="value"
          v-bind="getSetting"
          :readonly="readonly"
          @on-change="updateval"
        >
        </TsFormSelect>
      </Col>
    </TsRow>
  </div>
</template>
<script>
import comMixin from './editmixin.js';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {},
  mixins: [comMixin],
  props: {},
  data() {
    return {
      accountConfig: {
        dynamicUrl: '/api/rest/resourcecenter/account/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAccountNodeList,
        search: true,
        transfer: true,
        border: 'border',
        width: '100%'
      }
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
  methods: {},
  computed: {
    getSetting() {
      let setting = Object.assign(this.accountConfig, this.config);
      setting.validateList = setting.validateList || [];
      if (typeof this.isRequired == 'boolean') {
        //当从别的判断带过来的关于这个组件是否必填的选项时，进行原来required的覆盖
        if (this.isRequired && setting.validateList.indexOf('required') < 0) {
          setting.validateList.push('required');
        } else if (!this.isRequired && setting.validateList.indexOf('required') > -1) {
          setting.validateList = setting.validateList.filter(v => {
            return v != 'required';
          });
        }
      }
      return setting;
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
