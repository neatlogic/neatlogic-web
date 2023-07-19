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
    <div v-for="(t, index) in titleType" :key="index">
      <Divider orientation="left">{{ t }}</Divider>
      <TsRow>
        <Col
          v-for="item in list"
          :key="item.key"
          span="24"
        >
          <div v-if="index === item.titleType" class="padding-b">
            <div class="item">
              <div class="center">
                <span class="title">{{ item.label }}</span>
                <InputType
                  :item="item"
                  style="width: calc(100% - 230px)"
                  class="m-inline"
                ></InputType>
              </div>
              <div v-if="item.example" class="demo">
                <Poptip @on-popper-show="isExample = true" @on-popper-hide="isExample = false">
                  <span class="text-href">{{ $t('page.eg') }}</span>
                  <div slot="content">
                    <ExampleType
                      :item="item"
                      :list="list"
                      :type="type"
                    ></ExampleType>
                  </div>
                </Poptip>
              </div>
            </div>
          </div>
        </Col>
      </TsRow>
    
    </div>
  </div>
</template>
<script>
import ExampleType from './example.vue';
import InputType from './input.vue';
import themeConfig from './theme-config.js';
export default {
  name: 'ThemeTypeList',
  components: {
    ExampleType, InputType
  },
  props: {
    list: {
      type: Array,
      default: function() {
        return [];
      }
    },
    type: {
      type: String
    }
  },
  data() {
    return {
      isExample: false,
      titleType: themeConfig.titleType
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
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
.title {
  display: inline-block;
  width: 220px;
  height: 32px;
  line-height: 32px;
  padding-right: 10px;
  vertical-align: middle;
}
.m-inline {
  display: inline-table;
}
.item {
  display: flex;
  align-items: center;
  .center,
  .demo {
    flex: 1;
  }
}
</style>
