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
  <div class="bg-op radius-lg padding item-list">
    <div class="detail">
      <div class="detail-name overflow">
        <div>
          <span class="text-grey icon-type" :class="iconConfig[config.type].icon" :title="iconConfig[config.type].text"></span>
          <span :title="config.name">
            <span>{{ config.name }}</span>
          </span>
        </div>
        <div v-if="config.key" class="text-tip pt-sm pl-lg overflow" :title="config.key">{{ config.key }}</div>
      </div>
      <div class="text-tip overflow">
        <div>
          <Item
            :is="paramType"
            :value="config.defaultValue"
            :config="config.config"
            :multiple="multiple"
          ></Item>
        </div>
        <div class="overflow detail-des" :title="config.description && validText?config.description +'，'+ validText:config.description || validText">
          <span>{{ config.description || $t('page.notarget', {target: $t('page.description')}) }}</span>
          <span v-if="validText">，{{ validText }}</span>
        </div>
      </div>
      <div class="text-tip">
        <TsFormSwitch
          v-model="config.isRequired"
          :true-value="1"
          :false-value="0"
          :disabled="true"
          :trueText="$t('page.require')"
          :falseText="$t('page.optional')"
          :showStatus="true"
        ></TsFormSwitch>
        <TsFormSwitch
          v-if="config.editable"
          v-model="config.editable"
          :true-value="1"
          :false-value="0"
          :disabled="true"
          :trueText="$t('page.edit')"
          :falseText="$t('page.readonly')"
          :showStatus="true"
        ></TsFormSwitch>
      </div>
    </div>
  </div>
</template>
<script>
import Item from './readonly/index.js';
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    ...Item
  },
  filters: {
  },
  props: {
    config: Object,
    typeList: Array
  },
  data() {
    return {
      iconConfig: {
        text: {
          icon: 'tsfont-forminput',
          text: '文本'
        }, //文本输入
        password: {
          icon: 'tsfont-lock',
          text: '密码'
        }, //密码
        file: {
          icon: 'tsfont-wenjian',
          text: '文件'
        }, //文件
        date: {
          icon: 'tsfont-calendar',
          text: '日期'
        }, //日期
        datetime: {
          icon: 'tsfont-riqishijian',
          text: '日期时间'
        }, //日期时间
        json: {
          icon: 'tsfont-json',
          text: 'json'
        }, //json
        select: {
          icon: 'tsfont-formselect',
          text: '下拉单选'
        }, //下拉单选
        multiselect: {
          icon: 'tsfont-formselectcascader',
          text: '下拉多选'
        }, //下拉多选
        time: {
          icon: 'tsfont-formtime',
          text: '时间'
        }, //时间
        radio: {
          icon: 'tsfont-circle-o',
          text: '单选'
        }, //单选
        checkbox: {
          icon: 'tsfont-check-square',
          text: '复选'
        }, //复选
        node: {
          icon: 'tsfont-blocks',
          text: '节点'
        }, //节点
        account: {
          icon: 'tsfont-userinfo',
          text: '帐号'
        }, //帐号
        filepath: {
          icon: 'tsfont-wenjian',
          text: '文件路径'
        },
        textarea: {
          icon: 'tsfont-formtextarea',
          text: '文本域'
        },
        phase: {
          icon: 'tsfont-stage',
          text: '阶段'
        },
        switch: {
          icon: 'tsfont-canvas',
          text: '开关'
        },
        userselect: {
          icon: 'tsfont-group',
          text: '用户选择器'
        }
      },
      multipleList: ['multiselect', 'checkbox'],
      validConfig: {
        'unique_ident': '字母',
        'lowercase': '小写字母',
        'uppercase': '大写字母',
        'number': '数字',
        'enchar': '字母和数字',
        'mail': '邮箱地址',
        'phone': '电话号码',
        'ip': 'IP地址',
        'port': this.$t('page.port'),
        'url': 'URL',
        'integer_p': '正整数'
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
    paramType() {
      let handler = this.config.type && this.iconConfig[this.config.type] ? this.config.type + 'Handler' : 'textHandler';
      return handler;
    },
    multiple() {
      let isMultiple = this.multipleList.includes(this.config.type);
      return isMultiple; 
    },
    validText() {
      let text = '';
      if (this.config.config && !this.$utils.isEmpty(this.config.config.validateList)) {
        this.config.config.validateList.forEach(item => {
          if (this.validConfig.hasOwnProperty(item.name)) {
            text = '校验规则为：' + this.validConfig[item.name];
          }
        });
      }
      return text;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.item-list{
  &:not(:last-child){
    margin-bottom: 10px;
  }
  .detail{
    display: grid;
    grid-template-columns: 160px auto 62px;
    column-gap: 10px;
    .icon-type{
      padding-right: 6px;
    }
    .detail-des{
      padding-top: 10px;
    }
  }
}
</style>
