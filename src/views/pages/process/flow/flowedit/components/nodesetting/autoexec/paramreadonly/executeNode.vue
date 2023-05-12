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
  <div v-if="value" class="execute-class">
    <!-- 过滤器 -->
    <template v-if="executeNodeConfig.filter">
      <FilterSearch :defaultValue="executeNodeConfig.filter" :readonly="true" class="search"></FilterSearch>
      <span class="look-btn text-tip-active" @click="lookDetail('filter')">{{ $t('page.viewdetails') }}</span>
    </template>
    <!-- 选择节点 -->
    <template v-else-if="executeNodeConfig.selectNodeList && executeNodeConfig.selectNodeList.length > 0">
      <template v-for="(data,index) in executeNodeConfig.selectNodeList"> 
        <span
          v-if="index<showNumber"
          :key="index"
          class="item border-color overflow"
          :title="targetText(data)"
        >{{ targetText(data) }}</span>
      </template>
      <span class="look-btn text-tip-active" @click="lookDetail('selectNodeList')">{{ $t('page.viewdetails') }}</span>
    </template>
    <!-- 输入节点 -->
    <template v-else-if="executeNodeConfig.inputNodeList && executeNodeConfig.inputNodeList.length > 0">
      <template v-for="(data,index) in executeNodeConfig.inputNodeList"> 
        <span
          v-if="index<showNumber"
          :key="index"
          class="item border-color overflow"
          :title="targetText(data)"
        >{{ targetText(data) }}</span>
      </template>
      <span v-if="executeNodeConfig.inputNodeList.length > showNumber" class="look-btn text-tip-active" @click="lookDetail('inputNodeList')">{{ $t('page.viewdetails') }}</span>
    </template>
    <!-- 参数 -->
    <template v-else-if="executeNodeConfig.paramList && executeNodeConfig.paramList.length > 0">
      <template v-for="(data,index) in executeNodeConfig.paramList"> 
        <span
          v-if="index<showNumber"
          :key="index"
          class="item border-color overflow"
          :title="getParamText(data)"
        >{{ getParamText(data) }}</span>
      </template>
      <span v-if="executeNodeConfig.paramList.length > showNumber" class="look-btn text-tip-active" @click="lookDetail('paramList')">{{ $t('page.viewdetails') }}</span>
    </template>
    <TsDialog
      v-if="moreVisible"
      :isShow="moreVisible"
      width="medium"
      :title="$t('page.viewdetails')"
      height="500px"
      :hasFooter="false"
      :maskClose="true"
      className="executeDialog"
      @on-close="moreVisible = false"
    >
      <FilterDetail v-if="lookType=='filter'" :config="value"></FilterDetail>
      <SelectnodeDetail v-else-if="lookType=='selectNodeList'" :config="value"></SelectnodeDetail>
      <InputnodeDetail v-else-if="lookType=='inputNodeList'" :config="value"></InputnodeDetail>
      <template v-else-if="lookType=='paramList'">
        <span class="text-tip nopadding">{{ $t('page.referenceinputparameter') }}</span>
        <span v-for="(p,pindex) in executeNodeConfig.paramList" :key="pindex" class="item border-color bg-op ml-xs">{{ getParamText(p) }}</span>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import comMixin from '../paramedit/editmixin.js';
import FilterSearch from './execute/filter-search';

export default {
  name: '',
  components: {
    FilterSearch,
    FilterDetail: resolve => require(['./execute/filter-detail'], resolve),
    SelectnodeDetail: resolve => require(['./execute/selectnode-detail'], resolve),
    InputnodeDetail: resolve => require(['./execute/inputnode-detail'], resolve)
  },
  filters: {
  },
  mixins: [comMixin],
  props: {
    value: [String, Object],
    runtimeParamList: {
      type: Array,
      default: () => []
    },
    showNumber: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      lookType: 'selectNodeList', // 查看详情类型
      executeNodeConfig: {
        selectNodeList: null, //节点类型
        inputNodeList: null, //length > 0：表示作业参数作为执行目标
        filter: null, //过滤器
        paramList: null //参数
      },
      moreVisible: false
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
    lookDetail(type) {
      this.lookType = type;
      this.moreVisible = true;
    },
    targetText(data) { 
      return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
    }
  },
  computed: {
    getParamText() {
      return val => {
        let find = this.runtimeParamList.find(item => item.key == val) || {};
        return find.name || ''; 
      };
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          Object.keys(this.executeNodeConfig).forEach(key => {
            if (val[key]) {
              this.executeNodeConfig[key] = val[key];
            } else {
              this.executeNodeConfig[key] = null;
            }
          });
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.execute-class{
  // padding-right: 60px;
  position: relative;
  display: inline-block;
  .search {
    display: inline-block;
  }
  .item{
    display: inline-block;
    max-width: 130px;
    height: 32px;
    line-height: 30px;
    padding: 0 10px;
    border: 1px solid;
    text-align: center;
    border-radius: 4px;
  }
 .nopadding{
    padding: 0 !important;
  }
  .look-btn{
    // position: absolute;
    // top: 0;
    // right: 0;
    // line-height: 32px;
    line-height: 32px;
    display: inline-block;
    padding-left: 10px;
  }
}
.executeDialog {
   .item{
    display: inline-block;
    max-width: 130px;
    height: 32px;
    line-height: 30px;
    padding: 0 10px;
    border: 1px solid;
    text-align: center;
    border-radius: 4px;
  }
}
</style>
