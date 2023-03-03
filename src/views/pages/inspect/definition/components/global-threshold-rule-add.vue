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
  <div class="rule-add-wrap" :style="$utils.isEmpty(ruleList) ? 'margin-top: 2px;' : ''">
    <ul v-if="!$utils.isEmpty(ruleList)" class="mb-md">
      <li
        v-for="(item, index) in ruleList"
        :id="`to_${index+1}`"
        :key="item.ruleUuid"
        class="bg-op radius-lg padding mb-md"
      >
        <div class="header-wrapper" :class="item.isShow ? 'pb-sm header-border-bottom border-color' : ''">
          <span>#{{ index + 1 }}</span>
          <div class="action-group">
            <span
              v-if="$AuthUtils.hasRole('INSPECT_MODIFY')"
              class="tsfont-copy text-action action-item"
              title="复制"
              @click="copyRow(item,index)"
            ></span>
            <span
              class="text-action action-item"
              :class="[item.isShow == true ? 'tsfont-down' : 'tsfont-up']"
              :title="[item.isShow == true ? '收起' : '展开']"
              @click="expandCollapse(item, index)"
            ></span>
            <span
              v-if="$AuthUtils.hasRole('INSPECT_MODIFY')"
              class="tsfont-close text-action action-item"
              title="删除"
              @click="delRow(item, index)"
            ></span>
          </div>
        </div>
        <div :class="[item.isShow == true ? 'show-li' : 'hide-li']" class="pt-nm">
          <TsForm
            ref="formSetting"
            v-model="item.formValue"
            :itemList="item.formSetting"
            labelPosition="left"
            :labelWidth="70"
          ></TsForm>
        </div>
      </li>
    </ul>
    <Button
      v-if="$AuthUtils.hasRole('INSPECT_MODIFY')"
      type="primary"
      ghost
      @click.native="addRule"
    >
      <span class="text-href tsfont-plus add-text">
        添加规则
      </span>
    </Button>
  </div>
</template>
<script>
export default {
  name: '', // 添加规则
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {},
  props: {
    // 规则
    thresholds: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      defaultRuleUuIdList: [], // 
      ruleList: [],
      levelList: [], // 级别下拉数组
      ruleTooltips: '例如：<br/>/dev开头的挂载点的使用率大于90%的规则是：$.MOUNT_POINTS[NAME startswith "/dev"]."USED%" > 90，属性匹配规则支持操作符号：>, <, >=, <=, ==, !=, startswith, endswith<br/><br/>进程CPU使用率超过50%的规则是：$.TOP_CPU_RPOCESSES.CPU_USAGE{$this/$.CPU_LOGIC_CORES} > 50，最后的大括号对取到的属性值进行计算后再跟50进行比较，"$this"代表属性CPU_USAGE的数值'
    };
  },
  beforeCreate() {},
  created() {
    this.filterNormalFields(); // 过滤级别正常的字段
    this.initData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      if (!this.$utils.isEmpty(this.thresholds)) {
      // 回显
        this.ruleList = [];
        this.defaultRuleUuIdList = [];
        let hasAuth = this.$AuthUtils.hasRole('INSPECT_MODIFY');
        this.thresholds.forEach((v) => {
          let ruleUuid = v && v.ruleUuid ? v.ruleUuid : this.$utils.setUuid();
          this.defaultRuleUuIdList.push(ruleUuid);
          this.ruleList.push({
            ruleUuid: ruleUuid,
            flag: 'edit',
            formSetting: [
              {
                name: 'name',
                label: '名称',
                type: 'text',
                maxlength: 50,
                value: '',
                readonly: !hasAuth,
                validateList: [
                  'required',
                  {
                    name: 'custom', trigger: 'change', message: '名称不能重复', validator: (rule, value) => { 
                      return this.validNameUnique(value);
                    }} 
                ]
              },
              {
                name: 'level',
                label: '级别',
                type: 'select',
                dataList: this.levelList,
                validateList: ['required'],
                readonly: !hasAuth
              },
              {
                name: 'rule',
                label: '规则',
                type: 'textarea',
                tooltip: this.ruleTooltips,
                maxlength: 1000,
                validateList: ['required'],
                readonly: !hasAuth
              }
            ],
            formValue: {
              name: v.name,
              level: v.level,
              rule: v.rule
            },
            isShow: true
          });
        });
      } else {
        this.addRule();
      }
    },
    valid() {
      let formList = this.$refs.formSetting;
      let isValidPass = true;
      if (formList) {
        for (let j = 0; j < formList.length; j++) {
          if (!formList[j].valid()) {
            isValidPass = false;
          }
        }
      } else {
        isValidPass = false;
      }
      return isValidPass;
    },
    validNameUnique(name) {
      // 根据名称验证唯一性
      let repeatNameList = [];
      let isValidPass = true;
      if (!this.$utils.isEmpty(this.ruleList)) {
        repeatNameList = this.ruleList.filter((v) => {
          // 过滤当前输入的值
          return v.formValue.name == name;
        });
        if (!this.$utils.isEmpty(repeatNameList) && repeatNameList.length >= 2) {
          isValidPass = false;
        } else {
          isValidPass = true;
        }
      }
      return isValidPass;
    },
    getFormRuleValue() {
      let uuidList = [];
      let saveRuleValue = {
        thresholds: [],
        deletedRuleUuidList: []
      };
      if (!this.$utils.isEmpty(this.ruleList)) {
        this.ruleList.forEach((v) => {
          if (v && v.ruleUuid && v.flag && v.flag == 'edit') {
            uuidList.push(v.ruleUuid);
          }
          if (v && v.formValue && v.formValue.name) {
            saveRuleValue.thresholds.push({...v.formValue, ruleUuid: v.ruleUuid});
          }
        });
        let delUuidList = this.defaultRuleUuIdList.filter(element => !uuidList.includes(element));
        if (delUuidList) {
          saveRuleValue.deletedRuleUuidList.push(...delUuidList); // 被删除的元素个数
        }
      }
      return saveRuleValue;
    },
    addRule() {
      // 添加规则
      let hasAuth = this.$AuthUtils.hasRole('INSPECT_MODIFY');
      this.ruleList.push(
        {
          ruleUuid: this.$utils.setUuid(),
          formSetting: [
            {
              name: 'name',
              label: '名称',
              type: 'text',
              maxlength: 50,
              readonly: !hasAuth,
              validateList: [
                'required',
                {
                  name: 'custom', trigger: 'change', message: '名称不能重复', validator: (rule, value) => { 
                    return this.validNameUnique(value);
                  }} 
              ]
            },
            {
              name: 'level',
              label: '级别',
              type: 'select',
              dataList: this.levelList,
              validateList: ['required'],
              readonly: !hasAuth
            },
            {
              name: 'rule',
              label: '规则',
              type: 'textarea',
              tooltip: this.ruleTooltips,
              maxlength: 1000,
              validateList: ['required'],
              readonly: !hasAuth
            }
          ],
          formValue: {
            name: '',
            level: '',
            rule: ''
          },
          isShow: true
        }
      );
    },
    delRow(index) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: `删除全局规则，将自动删除应用规则中相同ID的规则，是否继续？`,
        btnType: 'error',
        'on-ok': vnode => {
          this.ruleList.splice(index, 1);
          this.$Message.success(this.$t('message.content.deletesuccess'));
          vnode.isShow = false;
        }
      });
    },
    copyRow(item) {
      let currentRow = this.$utils.deepClone(item);
      Object.assign(currentRow, {
        ruleUuid: this.$utils.setUuid(),
        formSetting: [
          {
            name: 'name',
            label: '名称',
            type: 'text',
            maxlength: 50,
            validateList: [
              'required',
              {
                name: 'custom', trigger: 'change', message: '名称不能重复', validator: (rule, value) => { 
                  return this.validNameUnique(value);
                }} 
            ]
          },
          {
            name: 'level',
            label: '级别',
            type: 'select',
            dataList: this.levelList,
            validateList: ['required']
          },
          {
            name: 'rule',
            label: '规则',
            type: 'textarea',
            tooltip: this.ruleTooltips,
            maxlength: 1000,
            validateList: ['required']
          }
        ]
      });
      this.ruleList.push(currentRow);
    },
    async filterNormalFields() {
      // 过滤级别正常的字段
      await this.$api.common.getSelectLit({enumClass: 'neatlogic.framework.common.constvalue.InspectStatus'}).then((res) => {
        if (res.Status == 'OK' && res.Return) {
          let levelList = res.Return;
          for (let i = 0; i < levelList.length; i++) {
            // 过滤级别"normal"字段，value值转成大写
            levelList[i].value = levelList[i].value.toUpperCase();
            if (levelList[i].value != 'NORMAL') {
              this.levelList.push({
                ...levelList[i]
              });
            }
          }
          if (!this.$utils.isEmpty(this.levelList)) {
            this.ruleList.forEach((v) => {
              if (v && v.formSetting) {
                v.formSetting.forEach((itemV) => {
                  if (itemV.name == 'level') {
                    itemV.dataList = this.levelList;
                  }
                });
              }
              v.formValue.level = v.formValue.level ? v.formValue.level.toUpperCase() : '';
            });
          }
        }
      });
    },
    expandCollapse(item) {
      if (item.isShow == false) {
        this.$set(item, 'isShow', true);
      } else {
        this.$set(item, 'isShow', false);
      }
    },
    jumpTo(id) {
      this.$utils.jumpTo(id);
    }
  },
  computed: {},
  watch: {
    thresholds: {
      handler() {
        this.initData();
      },
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
.rule-add-wrap {
  .show-li {
    display: block;
  }
  .hide-li {
    display: none;
  }
  .header-wrapper {
    display: flex;
    justify-content: space-between;
  }
  .header-border-bottom {
    border-bottom: 1px solid;
  }
}
</style>
