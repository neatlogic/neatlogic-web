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
  <div class="settingList">
    <div class="control-box">
      <div class="control-setting">
        <span class="label">{{ $t('page.tag') }}</span>
        <span class="control-btn">
          <TsFormSwitch
            v-model="isActive"
            :true-value="1"
            :false-value="0"
            @on-change="changeSwitch"
          ></TsFormSwitch>
        </span>
      </div>
    </div>
    <div v-if="isActive == 1" class="permission-list">
      <TsFormSelect
        v-model="tagList"
        v-bind="selectConfig"
        :dynamicDefaultValue="defaultValue"
      ></TsFormSelect>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  filters: {
  },
  props: {
    nodeConfig: Object,
    defaultIsActive: {
      type: [String, Number],
      default: 0
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    let _this = this;
    return {
      isActive: 0,
      selectConfig: {
        placeholder: this.$t('dialog.title.addtarget', {target: this.$t('page.tag')}),
        border: 'border',
        search: true,
        allowCreate: true,
        transfer: true,
        multiple: true,
        dynamicUrl: '/api/rest/process/tag/get',
        rootName: 'list',
        textName: 'text',
        valueName: 'text'
      },
      defaultValue: _this.list,
      tagList: []
     
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
    getData() {
      let tagList = [];
      if (this.isActive) {
        tagList = this.tagList;
      }
      return tagList;
    },
    changeSwitch(val) { 
      if (!val) {
        this.tagList = [];
      }
    }
  },
  computed: {},
  watch: {
    defaultIsActive: {
      handler: function(val) {
        this.isActive = val;
      },
      immediate: true
    },
    list: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.tagList = this.$utils.deepClone(val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
