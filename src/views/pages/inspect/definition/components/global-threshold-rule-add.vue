
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
              v-if="$AuthUtils.hasRole('INSPECT_MODIFY')"
              class="tsfont-close text-action action-item"
              :title="$t('page.delete')"
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
        {{ $t('dialog.title.addtarget', {target: $t('page.rule')}) }}
      </span>
    </Button>
  </div>
</template>
<script>
export default {
  name: '', // 添加规则
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
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
                label: this.$t('page.name'),
                type: 'text',
                maxlength: 50,
                value: '',
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
                dataList: this.levelList,
                validateList: ['required'],
                readonly: !hasAuth
              },
              {
                name: 'rule',
                label: this.$t('page.rule'),
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
              dataList: this.levelList,
              validateList: ['required'],
              readonly: !hasAuth
            },
            {
              name: 'rule',
              label: this.$t('page.rule'),
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
    delRow(item, index) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('term.inspect.deleteglobalruleconfirm'),
        btnType: 'error',
        'on-ok': vnode => {
          this.ruleList.splice(index, 1);
          this.$Message.success(this.$t('message.deletesuccess'));
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
      this.ruleList.push(currentRow);
    },
    async filterNormalFields() {
      // 过滤级别正常的字段
      await this.$api.common.getSelectList({enumClass: 'neatlogic.framework.common.constvalue.InspectStatus'}).then((res) => {
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
