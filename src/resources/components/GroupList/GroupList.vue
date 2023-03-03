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
/* 组件主要是用于，当数组的数据过多时，需要显示前几个，然后出现... 查看更多的场景 */
<template>
  <div v-if="dataList && dataList.length">
    <template v-if="type=='usercard'">
      <template v-for="(data,index) in dataList.slice(0, showNum)">
        <UserCard
          :key="index"
          v-bind="convertData(data)"
          :hideAvatar="hideAvatar"
          :class="userClass(index)"
        ></UserCard>
      </template>
    </template>
    <template v-if="type=='tag'">
      <template v-for="(data,index) in dataList.slice(0, showNum)">
        <Tag :key="index">{{ textName?isTextName(data, textName):data }}</Tag>
      </template>
    </template>
    <template v-if="type=='slot'">
      <template v-for="(data,index) in dataList.slice(0, showNum)">
        <slot name="top" :index="index" :item="data">{{ textName?isTextName(data, textName):data }}</slot>
      </template>
    </template>
    <span v-if="dataList && dataList.length > showNum">
      <Poptip transfer placement="bottom-start">
        <span class="tsfont-option-horizontal text-tip-active" style="padding: 0 8px;"></span>
        <div slot="content">
          <ul>
            <template v-if="type=='usercard'">
              <li
                v-for="(data,index) in dataList"
                :key="index"
                class="text-action"
                style="padding-bottom: 8px"
              >
                <UserCard
                  :key="index"
                  v-bind="convertData(data)"
                ></UserCard>
              </li>
            </template>
            <template v-if="type=='tag'">
              <li
                v-for="(data,index) in dataList"
                :key="index"
                class="text-action"
                style="padding-bottom: 8px"
              >
                {{ textName?isTextName(data, textName):data }}
              </li>
            </template>
            <template v-if="type=='slot'">
              <li
                v-for="(data,index) in dataList"
                :key="index"
                class="text-action"
                style="padding-bottom: 8px"
              >
                <slot :index="index" name="drop" :item="data">{{ textName ? isTextName(data, textName) : data }}</slot>
              </li>
            </template>
          </ul>
        </div>
      </Poptip>
    </span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  filters: {
  },
  props: {
    dataList: Array,
    showNum: {
      type: Number,
      default: 3
    },
    type: {
      type: String,
      default: 'usercard',
      validator(val) { //1、usercard:UserCard 组件   2、tag：标签 3、slot需要自定义显示数据
        return ['usercard', 'tag', 'slot'].indexOf(val) > -1;
      }
    },
    textName: {
      type: String
    },
    hideAvatar: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
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
    isTextName(data, textName) {
      // 判断是否有textName 这个属性，解决控制台报错问题
      if (data && data.hasOwnProperty(textName)) {
        return data[textName];
      } else {
        return '';
      }
    }
  },
  computed: {
    userClass() {
      return function(index) {
        let className = '';
        if (index < this.showNum - 1 && index < this.dataList.length - 1) {
          className = 'user-pr';
        }
        return className;
      };
    },
    convertData() {
      return data => {
        if (typeof data == 'string' && data.includes('#')) {
          let list = data.split('#');
          return {initType: list[0], uuid: list[1]};
        } else {
          return data;
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.user-pr{
  padding-right: 10px;
}
</style>
 
