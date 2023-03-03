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
  <div style="position: relative;">
    <div v-if="!isReadonly" class="div-btn-contain">
      <i v-if="setting.config.isRequired" class="require-tip">*</i>
      <Button icon="tsfont tsfont-plus" @click="addData">执行目标</Button>
    </div>
    <div v-if="setting.config.desc" class="component-tips ts-info">{{ setting.config.desc }}</div>
    <div v-if="formView && currentValue && currentValue.type" class="view-main">
      <template v-if="currentValue.type=='filter'">
        <FilterSearch :defaultValue="currentValue.filter" :readonly="true" class="detail-text"></FilterSearch>
        <span v-if="!knowledgeView" class="text-tip-active detail-btn" @click="lookDetail()">查看详情</span>
      </template>
      <template v-if="currentValue.type=='input'">
        <span
          v-for="(item,index) in getShowList(currentValue.inputNodeList)"
          :key="index"
          class="item border-color bg-op overflow tag-item-text"
          :title="targetText(item)"
        >{{ targetText(item) }}</span>
        <span v-if="!knowledgeView && currentValue.inputNodeList.length>showNumber" class="text-tip-active detail-btn" @click="lookDetail()">
          ...查看详情
        </span>
      </template>
      <template v-if="currentValue.type=='node'">
        <span
          v-for="(item,index) in getShowList(currentValue.selectNodeList)"
          :key="index"
          class="item border-color bg-op overflow tag-item-text"
          :title="targetText(item)"
        >{{ targetText(item) }}</span>
        <span v-if="!knowledgeView" class="text-tip-active detail-btn" @click="lookDetail()">
          <span v-if="currentValue.selectNodeList.length>showNumber">...</span>
          查看详情
        </span>
      </template>
    </div>
    <transition name="fade">
      <span v-if="validMesage != ''" class="form-error-tip">{{ validMesage }}</span>
    </transition>
    <ResourecesDialog
      v-if="isShow"
      :isShow="isShow"
      :currentValue="currentValue"
      :formView="formView"
      :setting="setting"
      @okSave="okSave"
      @close="isShow=false"
    ></ResourecesDialog>
    <ResourecesView
      v-if="isShowView"
      :isShow="isShowView"
      :currentValue="currentValue"
      @close="isShowView=false"
    ></ResourecesView>
  </div>
</template>
<script>
import viewmixin from '../viewmixin.js';
export default {
  name: '',
  components: {
    ResourecesView: resolve => require(['./resoureces-view'], resolve),
    ResourecesDialog: resolve => require(['./resoureces-dialog'], resolve),
    FilterSearch: resolve => require(['./addtarget/filter-search.vue'], resolve)
  },
  filters: {
  },
  mixins: [viewmixin],
  props: {
    value: Object
  },
  data() {
    return {
      isShow: false,
      currentValue: {},
      validMesage: '',
      isShowView: false,
      showNumber: 5
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
    updatethis(val) { //简单的组件可以直接调用这个方法直接更改父组件的值，复杂的组件值比较复杂则需要通过geValue把值给抛出去
      this.$emit('update', val);
    },
    updateValue(val) { //这个方法可以没有，之所以存在主要是为了统一写法
      val && this.$set(this, 'currentValue', val);
    },
    getValue() { //父组件调用这个方法，拿取组件值，用来保存数据
      return this.currentValue;
    },
    validateValue() { //校验，比如必填，比如必须为number等等 ，现有的项目组件直接调用valid来显示提示字，有些复杂组件可能需要自己写红色提示文案
      let isVaild = true;
      this.validMesage = '';
      if (this.setting.config.isRequired && this.$utils.isEmptyObj(this.currentValue)) {
        this.validMesage = '目标不能为空';
        isVaild = false;
      }
      return isVaild;
    },
    addData() {
      this.isShow = true;
    },
    okSave(data) {
      this.currentValue = data || {};
      this.validateValue();
      this.isShow = false;
    },
    lookDetail() {
      this.isShowView = true;
    }
  },
  computed: {
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    },
    getShowList() {
      return (list) => {
        let showList = !this.knowledgeView ? list.slice(0, this.showNumber) : list;
        return showList;
      };
    }
  },
  watch: {
    value: {
      handler(val) {
        this.updateValue(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.div-btn-contain{
  position: relative;
}
.view-main{
  padding-top: 10px;
  .item{
    display: inline-block;
    padding: 0 4px;
    line-height: 30px;
    max-width: 150px;
    border:1px solid;
    margin-bottom: 10px;
    margin-right: 10px;
    border-radius: 4px;
  }
  /deep/ .tag-item-text{
    margin-bottom: 10px;
  }
  .detail-text{
    display: inline-block;
  }
  .detail-btn{
    display: inline-block;
    width: 70px;
    margin-bottom: 10px;
  }
}
</style>
