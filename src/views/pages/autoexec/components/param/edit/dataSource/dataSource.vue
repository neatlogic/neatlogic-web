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
    :isShow="isShow"
    :title="$t('page.datasourcesetting')"
    @on-close="close()"
    @on-ok="saveSourc()"
  >
    <div class="main">
      <TsFormItem
        :label="$t('page.datasource')"
        :validateList="validateList"
        labelPosition="top"
      >
        <TsFormRadio
          v-model="dataSource"
          :dataList="dataSourceList"
          :validateList="validateList"
          @on-change="changeSource"
        ></TsFormRadio>
      </TsFormItem>
      <!-- 静态数据源/矩阵 -->
      <div
        :is="dataSource + 'Source'"
        ref="dataSource"
        :sourcConfig="config"
        :multiple="multiple"
        @update="update"
      ></div>
    </div>
  </TsDialog>
</template>
<script>
import item from './item/index.js';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    ...item
  },
  filters: {
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    sourcConfig: Object,
    multiple: Boolean
  },
  data() {
    return {
      validateList: ['required'],
      dataSourceList: [
        {
          text: this.$t('page.staticdatasource'),
          value: 'static'
        },
        {
          text: this.$t('page.matrix'),
          value: 'matrix'
        }
      ],
      dataSource: 'matrix',
      config: {}
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
    close() {
      this.$emit('close');
    },
    saveSourc() {
      if (!this.$refs.dataSource.valid()) {
        return;
      }
      this.config = this.$refs.dataSource.getData() || {};
      let data = {
        dataSource: this.dataSource
      };
      Object.assign(data, this.config);
      this.$emit('saveSourc', data);
      this.close();
    },
    update(obj) { //更新
      this.config = obj;
    },
    changeSource() {
      this.config = {};
    }
  },
  computed: {},
  watch: {
    sourcConfig: {
      handler(val) {
        if (val) {
          this.config = this.$utils.deepClone(val);
          this.config.dataSource && (this.dataSource = this.config.dataSource);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.main{
  max-height: 360px;
}

</style>
