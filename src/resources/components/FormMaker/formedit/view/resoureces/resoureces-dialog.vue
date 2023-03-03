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
  <TsDialog
    type="slider"
    :isShow="isShow"
    width="large"
    title="添加目标"
    className="resoureces-dialog"
    @on-close="close"
    @on-ok="okSave"
  >
    <div class="radio-main">
      <TsFormRadio
        v-model="type"
        :dataList="typeList"
        :isClearSameValue="true"
      ></TsFormRadio>
    </div>
    <div v-if="type">
      <Item
        :is="'resource'+type"
        ref="targetDetail"
        :setting="setting"
        :formView="formView"
        :currentValue="currentValue"
      ></Item>
    </div>
  </TsDialog>
</template>
<script>
import Item from './addtarget/index.js';
export default {
  name: '',
  components: {
    ...Item,
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
  },
  filters: {
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    currentValue: Object,
    setting: Object, //组件配置里面设置的属性值
    formView: {//false 代表着组件显示在布局编辑那一块（作用：简化显示，节约性能），  true 代表着通过form-view页面显示
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      config: {},
      type: '',
      typeList: [
        {
          value: 'filter',
          text: '过滤器',
          description: '创建过滤器，选择指定范围的节点作为执行目标'
        },
        {
          value: 'input',
          text: '输入文本',
          description: '按指定格式，手动输入单个或多个节点信息'
        },
        {
          value: 'node',
          text: '节点',
          description: '自定义查询条件，过滤并勾选节点作为执行目标'
        }
      ]
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
    okSave() {
      let data = this.getData();
      this.$emit('okSave', data);
    },
    close() {
      this.$emit('close', false);
    },
    getData() {
      let data = {};
      let config = this.$refs.targetDetail ? this.$refs.targetDetail.save() : {};
      if (this.type && !this.$utils.isEmptyObj(config)) {
        this.$set(data, 'type', this.type);
        this.type == 'filter' && this.$set(data, 'filter', config);
        this.type == 'input' && this.$set(data, 'inputNodeList', config);
        this.type == 'node' && this.$set(data, 'selectNodeList', config);
      } else if (!this.type) {
        data = {};
      }
      return data;
    }
  },
  computed: {
  },
  watch: {
    currentValue: {
      handler(val) {
        if (!this.$utils.isEmptyObj(val)) {
          let data = this.$utils.deepClone(val);
          this.type = data.type;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.radio-main{
  padding-bottom: 16px;
  /deep/ .ivu-radio-wrapper{
    margin-right: 16px;
  }
}
</style>
