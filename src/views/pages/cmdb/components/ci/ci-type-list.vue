/* * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved. * * Licensed under the Apache License, Version 2.0 (the "License"); * you may not use this file except in compliance with the License. * You may obtain a copy of the License at * * http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law or agreed to in writing, software * distributed under the License is distributed on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. * See the License for the specific language governing permissions and * limitations under the License. */
<template>
  <div>
    <div class="padding">
      <TsFormInput
        border="bottom"
        :search="true"
        :placeholder="$t('form.placeholder.pleaseinput', { target: $t('page.keyword') })"
        @on-change="searchCi"
      ></TsFormInput>
    </div>
    <div style="height:calc(100vh - 205px);overflow-y:auto">
      <div v-for="item in filterCiTypeList" :key="item.id" class="titlelistBox">
        <div v-if="item.ciList.length > 0" class="treeTitle ci-label text-title">{{ item.name }}</div>
        <div v-if="item.ciList.length > 0">
          <ul>
            <li
              v-for="ci in item.ciList"
              :id="'ci-' + ci.id"
              :key="ci.id"
              class="text-default overflow treeList radius-sm pl-sm pr-sm"
              :class="ci.icon + (ciId == ci.id ? ' bg-selected' : '')"
              :title="ci.label + '(' + ci.name + ')'"
              @click="click(item, ci)"
            >
              <span>{{ ci.label }}</span>
              <span style="padding-left:2px" class="text-grey">({{ ci.name }})</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  filters: {},
  props: {
    ciId: { type: Number },
    ciFilter: { type: Array }, //过滤模型列表
    tree: {
      //如果有值就用传过来的,没有就用默认的
      type: Array,
      default: () => []
    },
    needDefaultCiId: { type: Boolean, default: true } //是否需要选中默认模型
  },
  data() {
    return {
      ciTypeList: [],
      keyword: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    if (this.tree.length === 0) {
      await this.searchCiTypeCi();
    } else {
      this.ciTypeList = JSON.parse(JSON.stringify(this.tree));
    }
    if (this.ciId) {
      this.$nextTick(() => {
        this.$utils.jumpTo('#ci-' + this.ciId);
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchCi(val) {
      if (val) {
        this.keyword = val.trim();
      } else {
        this.keyword = val;
      }
    },
    click(data, nodeData) {
      this.$emit('click', data, nodeData);
    },
    async searchCiTypeCi() {
      await this.$api.cmdb.ci.searchCiTypeCi().then(res => {
        if (this.ciFilter && this.ciFilter.length > 0) {
          const ciTypeList = res.Return;
          ciTypeList.forEach(citype => {
            const ciList = citype.ciList.filter(d => this.ciFilter.includes(d.id));
            if (ciList.length > 0) {
              citype.ciList = ciList;
              this.ciTypeList.push(citype);
            }
          });
        } else {
          this.ciTypeList = res.Return;
        }
        if (!this.ciId && this.needDefaultCiId) {
          if (this.ciTypeList.length > 0) {
            if (this.ciTypeList[0].ciList.length > 0) {
              //如果没有传入ciId,默认选中第一个模型
              this.$emit('click', this.ciTypeList[0], this.ciTypeList[0].ciList[0]);
            }
          }
        }
      });
    }
  },
  computed: {
    filterCiTypeList() {
      if (!this.keyword) {
        return this.ciTypeList;
      } else {
        const filterCiTypeList = JSON.parse(JSON.stringify(this.ciTypeList));
        filterCiTypeList.forEach(type => {
          if (type.ciList && type.ciList.length > 0) {
            type.ciList = type.ciList.filter(ci => ci.label.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1 || ci.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1);
          }
        });
        return filterCiTypeList;
      }
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
@import (reference) '~@/resources/assets/css/theme.less';
.titlelistBox {
  margin-bottom: 14px;
}
.treeTitle {
  padding-left: 16px;
  font-size: 12px;
  margin-bottom: 4px;
}
.treeList {
  font-size: 13px;
  font-weight: 400;
  min-width: 130px;
  height: 32px;
  line-height: 32px;
  cursor: pointer;
  span {
    padding-left: 10px;
  }
}
// .bg-block {
//   border-radius: 6px;
// }
.tsbg-block {
  border-radius: 6px;
}
</style>
