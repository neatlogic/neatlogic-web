
<template>
  <div class="rule-add-wrap" :style="$utils.isEmpty(ruleList) ? 'margin-top: 2px;' : ''">
    <ul v-if="!$utils.isEmpty(ruleList)" class="mb-md">
      <li
        v-for="(item, index) in ruleList"
        :id="`to_${item.ruleId}`"
        :key="item.ruleUuid"
        class="bg-op radius-lg padding mb-md"
      >
        <div class="header-wrapper" :class="item.isShow ? 'pb-sm header-border-bottom border-color' : ''">
          <span>#{{ item.ruleId }}</span>
          <div class="action-group">
            <span
              v-if="$AuthUtils.hasRole('INSPECT_MODIFY')"
              class="tsfont-copy text-action action-item"
              :title="$t('page.copy')"
              @click="copyRow(item,index)"
            ></span>
            <span
              class="text-action action-item"
              :class="[item.isShow == true ? 'tsfont-down' : 'tsfont-up']"
              :title="[item.isShow == true ? $t('page.packup') : $t('page.expand')]"
              @click="expandCollapse(item, index)"
            ></span>
            <span
              v-if="item.flag == 'app' && $AuthUtils.hasRole('INSPECT_MODIFY')"
              class="tsfont-close text-action action-item"
              :title="$t('page.delete')"
              @click="delRow(item,index)"
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
        {{ $t('term.inspect.addrule') }}
      </span>
    </Button>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {},
  props: {
    // 规则
    thresholdsData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      initDataList: [], // 初始值
      ruleList: [],
      levelList: [], // 级别下拉数组
      ruleTooltips: this.$t('term.inspect.ruletooltips')
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
      this.initDataList = [];
      this.ruleList = [];
      if (!this.$utils.isEmptyObj(this.thresholdsData) && (!this.$utils.isEmpty(this.thresholdsData.globalThresholds) || !this.$utils.isEmpty(this.thresholdsData.appThresholds))) {
      // 规则回显问题
        let thresholdsList = [];
        let appIndex = 0;
        let hasAuth = this.$AuthUtils.hasRole('INSPECT_MODIFY');
        this.thresholdsData && this.thresholdsData.globalThresholds && this.thresholdsData.globalThresholds.length > 0 && this.thresholdsData.globalThresholds.forEach((v, index) => {
          if (v) {
            thresholdsList.push({...v, inheritGlobal: 1, flag: 'global', ruleId: (index + 1)});
          }
        });
        this.thresholdsData && this.thresholdsData.appThresholds && this.thresholdsData.appThresholds.length > 0 && this.thresholdsData.appThresholds.forEach((v, index) => {
          let hasRepeatRuleUuid = thresholdsList.find((u) => u.ruleUuid == v.ruleUuid);
          if (hasRepeatRuleUuid) {
          // 应用层，取消继承全局，那么应用层的id和全局阈值规则相同，那么应用层的阈值规则，覆盖全局阈值规则
            hasRepeatRuleUuid = Object.assign(hasRepeatRuleUuid, {name: v.name, level: v.level, rule: v.rule, inheritGlobal: 0});
          } else if (v) {
            appIndex++;
            thresholdsList.push({...v, inheritGlobal: 0, flag: 'app', ruleId: v && v.ruleUuid ? (appIndex + 5000) : 5001});
          }
        });
        thresholdsList.forEach((v) => {
          let ruleUuid = v && v.ruleUuid ? v.ruleUuid : this.$utils.setUuid();
          this.ruleList.push({
            ruleUuid: ruleUuid,
            ruleId: v.ruleId,
            flag: v.flag, // 标识
            formSetting: [
              {
                name: 'inheritGlobal',
                label: this.$t('term.inspect.inheritglobal'),
                type: 'switch',
                value: 1,
                falseValue: 0,
                trueValue: 1,
                readonly: !hasAuth,
                isHidden: v.flag != 'global', // 继承全局才会显示按钮
                onChange: (val) => {
                  if (val == 0) {
                    this.ruleList.forEach((item) => {
                      if (item.ruleUuid == ruleUuid) {
                        this.$set(v, 'inheritGlobal', val);
                        item.formSetting.forEach((itemV) => {
                          if (itemV.name != 'inheritGlobal') {
                            itemV.disabled = false;
                          }
                        });
                      }
                    });
                  } else if (val == 1) {
                  // 继承全局
                    this.ruleList.forEach((item) => {
                      if (item.ruleUuid == ruleUuid) {
                        this.$set(v, 'inheritGlobal', val);
                        this.$set(item, 'formValue', item.defaultFormValue);
                        this.$set(item.formValue, 'inheritGlobal', val);
                        item.formSetting.forEach((itemV) => {
                          if (itemV.name != 'inheritGlobal') {
                            itemV.disabled = true;
                          }
                        });
                      }
                    });
                  }
                }
              },
              {
                name: 'name',
                label: this.$t('page.name'),
                type: 'text',
                maxlength: 50,
                value: '',
                readonly: !hasAuth,
                disabled: !!(v.flag == 'global' && v.inheritGlobal), // 继承全局，不可编辑
                validateList: [
                  'required',
                  {
                    name: 'custom', trigger: 'change', message: this.$t('message.cannotrepeat', {target: this.$t('page.name')}), validator: (rule, value) => { 
                      return this.validNameUnique(value);
                    }} 
                ]
              },
              {
                name: 'level',
                label: this.$t('page.level'),
                type: 'select',
                readonly: !hasAuth,
                dataList: this.levelList,
                disabled: !!(v.flag == 'global' && v.inheritGlobal), // 继承全局，不可编辑
                validateList: ['required']
              },
              {
                name: 'rule',
                label: this.$t('page.rule'),
                type: 'textarea',
                readonly: !hasAuth,
                tooltip: this.ruleTooltips,
                maxlength: 1000,
                disabled: !!((v.flag == 'global' && v.inheritGlobal)), // 继承全局，不可编辑
                validateList: ['required']
              }
            ],
            formValue: {
              name: v.name,
              level: v.level,
              rule: v.rule,
              inheritGlobal: v.inheritGlobal
            },
            isShow: true
          });
          if (v && ((v.flag == 'global' && v.inheritGlobal == 0) || v.flag == 'app')) {
            this.initDataList.push({
              ruleUuid: ruleUuid,
              name: v.name,
              level: v.level,
              rule: v.rule,
              isOverWrite: v.flag == 'global' && v.inheritGlobal == 0 ? 1 : 0
            });
          }
        });
        this.ruleList && this.ruleList.forEach((v) => {
          let hasRuleUuid = this.thresholdsData.globalThresholds.find((item) => item.ruleUuid == v.ruleUuid);
          if (v && v.flag == 'global' && hasRuleUuid) {
          // 存储一份全局阈值规则，用于取消继承全局后，拿到全局阈值规则的值
            v.defaultFormValue = {
              ...hasRuleUuid
            };
          }
        });
      } else {
        this.addRule();
        this.initDataList.push({
          name: '',
          level: '',
          rule: ''
        });
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
          return v.formValue.name == name && (v.formValue.inheritGlobal != 1);
        });
        if (!this.$utils.isEmpty(repeatNameList) && repeatNameList.length >= 2) {
          isValidPass = false;
        } else {
          isValidPass = true;
        }
      }
      return isValidPass;
    },
    getGlobalMaxRuleId() {
      // 获取最大值的规则id
      let ruleIdList = [];
      let maxRuleId = null;
      this.ruleList && this.ruleList.forEach((v) => {
        if (v && v.flag == 'app' && v.ruleId) {
          ruleIdList.push(v.ruleId);
        }
      });
      maxRuleId = Math.max.apply(null, ruleIdList);
      return (maxRuleId != -Infinity || isNaN(maxRuleId)) ? (maxRuleId + 1) : 1;
    },
    getFormValue() {
      // 提供给外部使用
      let saveFormValue = {isOverWrite: 0, thresholds: []};
      if (!this.$utils.isEmpty(this.ruleList)) {
        this.ruleList.forEach((v) => {
          if (v && v.flag == 'global' && v.formValue.inheritGlobal == 0) {
            saveFormValue.thresholds.push({
              ruleUuid: v.ruleUuid,
              name: v.formValue.name,
              rule: v.formValue.rule,
              level: v.formValue.level,
              isOverWrite: v.formValue.inheritGlobal == 0 ? 1 : 0
            });
          } else if (v && v.flag == 'app') {
            saveFormValue.thresholds.push({
              ruleUuid: v.ruleUuid,
              name: v.formValue.name,
              rule: v.formValue.rule,
              level: v.formValue.level,
              isOverWrite: 0
            });
          }
        });
        let hasOverwrite = saveFormValue.thresholds.find(v => v.isOverWrite == 1);
        if (hasOverwrite) {
          saveFormValue.isOverWrite = 1;
        } else {
          saveFormValue.isOverWrite = 0;
        }
      }
      return saveFormValue;
    },
    getInitData() {
      return this.initDataList;
    },
    addRule() {
      // 添加规则
      let hasAuth = this.$AuthUtils.hasRole('INSPECT_MODIFY');
      this.ruleList.push(
        {
          ruleUuid: this.$utils.setUuid(),
          ruleId: this.getGlobalMaxRuleId(),
          flag: 'app', // 标识
          formSetting: [
            {
              name: 'name',
              label: this.$t('page.name'),
              type: 'text',
              maxlength: 50,
              readonly: !hasAuth,
              validateList: [
                'required',
                {
                  name: 'custom', trigger: 'change', message: this.$t('message.cannotrepeat', {target: this.$t('page.name')}), validator: (rule, value) => { 
                    return this.validNameUnique(value);
                  }} 
              ]
            },
            {
              name: 'level',
              label: this.$t('page.level'),
              type: 'select',
              readonly: !hasAuth,
              dataList: this.levelList,
              validateList: ['required']
            },
            {
              name: 'rule',
              label: this.$t('page.rule'),
              type: 'textarea',
              readonly: !hasAuth,
              tooltip: this.ruleTooltips,
              maxlength: 1000,
              validateList: ['required']
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
    delRow(row, index) {
      if (row && row.formValue) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: row.formValue && row.formValue.name ? row.formValue.name : ''}),
          btnType: 'error',
          'on-ok': vnode => {
            this.ruleList.splice(index, 1);
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
          }
        });
      }
    },
    copyRow(item) {
      let currentRow = this.$utils.deepClone(item);
      Object.assign(currentRow, {
        ruleUuid: this.$utils.setUuid(),
        ruleId: this.getGlobalMaxRuleId(),
        flag: 'app',
        formSetting: [
          {
            name: 'name',
            label: this.$t('page.name'),
            type: 'text',
            maxlength: 50,
            validateList: [
              'required',
              {
                name: 'custom', trigger: 'change', message: this.$t('message.cannotrepeat', {target: this.$t('page.name')}), validator: (rule, value) => { 
                  return this.validNameUnique(value);
                }} 
            ]
          },
          {
            name: 'level',
            label: this.$t('page.level'),
            type: 'select',
            dataList: this.levelList,
            validateList: ['required']
          },
          {
            name: 'rule',
            label: this.$t('page.rule'),
            type: 'textarea',
            tooltip: this.ruleTooltips,
            maxlength: 1000,
            validateList: ['required']
          }
        ]
      });
      if (currentRow && currentRow.formValue && currentRow.formValue.inheritGlobal) {
        delete currentRow.formValue.inheritGlobal;
      }
      this.ruleList.push(currentRow);
    },
    filterNormalFields() {
      // 过滤级别正常的字段
      this.$api.common.getSelectList({enumClass: 'neatlogic.framework.common.constvalue.InspectStatus'}).then((res) => {
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
                    this.$set(itemV, 'dataList', this.levelList);
                    v.formValue.level = v.formValue.level ? v.formValue.level.toUpperCase() : '';
                  }
                });
              }
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
    thresholdsData: {
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
