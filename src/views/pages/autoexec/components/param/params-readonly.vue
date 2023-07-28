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
          text: this.$t('page.text')
        }, //文本输入
        password: {
          icon: 'tsfont-lock',
          text: this.$t('page.password')
        }, //密码
        file: {
          icon: 'tsfont-wenjian',
          text: this.$t('page.file')
        }, //文件
        date: {
          icon: 'tsfont-calendar',
          text: this.$t('page.date')
        }, //日期
        datetime: {
          icon: 'tsfont-riqishijian',
          text: this.$t('page.dateandtime')
        }, //日期时间
        json: {
          icon: 'tsfont-json',
          text: 'json'
        }, //json
        select: {
          icon: 'tsfont-formselect',
          text: this.$t('page.dropdownanoption')
        }, //下拉单选
        multiselect: {
          icon: 'tsfont-formselectcascader',
          text: this.$t('page.dropdownmultipleselection')
        }, //下拉多选
        time: {
          icon: 'tsfont-formtime',
          text: this.$t('page.time')
        }, //时间
        radio: {
          icon: 'tsfont-circle-o',
          text: this.$t('page.singleoption')
        }, //单选
        checkbox: {
          icon: 'tsfont-check-square',
          text: this.$t('page.check')
        }, //复选
        node: {
          icon: 'tsfont-blocks',
          text: this.$t('page.node')
        }, //节点
        account: {
          icon: 'tsfont-userinfo',
          text: this.$t('page.account')
        }, //账号
        filepath: {
          icon: 'tsfont-wenjian',
          text: this.$t('page.filepath')
        },
        textarea: {
          icon: 'tsfont-formtextarea',
          text: this.$t('page.textfield')
        },
        phase: {
          icon: 'tsfont-stage',
          text: this.$t('page.phase')
        },
        switch: {
          icon: 'tsfont-canvas',
          text: this.$t('page.switch')
        },
        userselect: {
          icon: 'tsfont-group',
          text: this.$t('page.userselector')
        }
      },
      multipleList: ['multiselect', 'checkbox'],
      validConfig: {
        'unique_ident': this.$t('page.letter'),
        'lowercase': this.$t('page.lowercaseletter'),
        'uppercase': this.$t('page.capitalletter'),
        'number': this.$t('page.number'),
        'enchar': this.$t('page.lettersandnumbers'),
        'mail': this.$t('page.emailaddress'),
        'phone': this.$t('page.phonenumber'),
        'ip': this.$t('page.ipaddress'),
        'port': this.$t('page.port'),
        'url': 'URL',
        'integer_p': this.$t('page.positiveinteger')
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
