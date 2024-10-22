<template>
  <div>
    <Tabs
      v-if="tabList.length > 0"
      :value="currentTab"
      :name="formItem.uuid"
      :type="config.type"
      :animated="false"
      @on-click="(name)=>{changeTab(name);}"
    >
      <TabPane
        v-for="(tab, tindex) in tabList"
        :key="tindex"
        :label="!$utils.isEmpty(getValidErrorList(tab))?renderTabLabel(tab.text, getValidErrorList(tab)):renderTabLabelValueTip(tab)"
        :name="tab.value"
        :tab="formItem.uuid"
      >
        <div
          @drop="
            event => {
              dropFormItem(event, tab);
            }
          "
        >
          <div v-if="tabCompomentList(tab.value) && tabCompomentList(tab.value).length > 0" :class="{ 'bg-op': config.type === 'card' }">
            <div v-for="(component, index) in tabCompomentList(tab.value)" :key="component.uuid">
              <ChildFormItem
                :ref="'childFormItem_' + component.uuid + '##' + tab.value "
                class="padding-xs"
                :formItem="component"
                :formData="formData"
                :formItemList="formItemList"
                :mode="mode"
                :disabled="disabled || tab.isDisabled"
                :readonly="readonly || tab.isReadOnly"
                :isClearSpecifiedAttr="isClearSpecifiedAttr"
                :externalData="externalData"
                @resize="$emit('resize')"
                @emit="
                  val => {
                    $emit('emit', val);
                  }
                "
                @select="
                  val => {
                    $emit('select', val);
                  }
                "
                @remove="
                  item => {
                    removeFormItem(tab.value, item);
                  }
                "
              ></ChildFormItem>
              <Divider v-if="index < tabCompomentList(tab.value).length - 1" style="margin:10px 0px"></Divider>
            </div>
          </div>
          <div v-else class="text-grey padding-sm" :class="{ 'bg-op': config.type === 'card' }">{{ $t('term.framework.dragformcomp') }}</div>
        </div>
      </TabPane>
    </Tabs>
    <div v-else-if="mode === 'edit' && mode === 'editSubform'" class="text-grey">{{ $t('form.placeholder.pleaseadd',{'target':$t('page.tab')}) }}</div>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import conditionMixin from '@/resources/plugins/TsSheet/form/conditionexpression/condition-mixin.js';

export default {
  name: '',
  components: { ChildFormItem: () => import('@/resources/plugins/TsSheet/child-form-item.vue') },
  extends: base,
  mixins: [validmixin, conditionMixin],
  props: {},
  data() {
    return {
      initFormData: this.$utils.deepClone(this.formData),
      tabReaction: {},
      currentTab: null,
      isFirst: true,
      validateErrorList: [], // 验证错误列表
      tabValue: {} //tab下对应值
    };
  },
  beforeCreate() {},
  created() {
    if (this.isClearSpecifiedAttr) {
      this.clearCurrSpecificAttr();
    }
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
    dropFormItem(event, tab) {
      if (this.mode === 'edit' || this.mode === 'editSubform') {
        if (this.formItem.hasOwnProperty('inherit')) {
          return false;
        }
        const item = JSON.parse(event.dataTransfer.getData('item'));
        if (tab && item) {
          if (this.addComponent(item)) {
            if (!tab.component) {
              this.$set(tab, 'component', []);
            }
            tab.component.push(item.uuid);
          }
        }
      }
    },
    removeFormItem(tabName, item) {
      if (tabName && this.tabList.length > 0) {
        const tab = this.config.tabList.find(d => d.value === tabName);
        if (tab && tab.component && tab.component.length > 0) {
          const index = tab.component.findIndex(d => d === item.uuid);
          if (index > -1) {
            tab.component.splice(index, 1);
            this.removeComponent(item.uuid);
          }
        }
      }
    },
    async validData() {
      const errorList = [];
      this.validateErrorList = [];
      if (this.$refs) {
        for (let name in this.$refs) {
          if (this.$refs[name]) {
            let formitem = this.$refs[name];
            if (this.$refs[name] instanceof Array) {
              formitem = this.$refs[name][0];
            } else {
              formitem = this.$refs[name];
            }
            if (formitem) {
              const err = await formitem.validData();
              if (err && err.length > 0) {
                errorList.push(...err);
              
                // 获取tab的name
                const refParts = name.split('##');
                if (refParts.length !== 2) continue;
                const tabValue = refParts[1];
                // 验证错误列表
                this.validateErrorList.push(
                  {
                    tab: tabValue,
                    errorList: this.$utils.mapArray(err, 'error')
                  }
                );
              }
            }
          }
        }
      }
      return errorList;
    },
    changeTab(name) {
      this.currentTab = name;
      this.$emit('resize');
    },
    validConfig() {
      const errorList = [];
      if (this.$refs) {
        for (let name in this.$refs) {
          if (this.$refs[name]) {
            let formitem = this.$refs[name];
            if (this.$refs[name] instanceof Array) {
              formitem = this.$refs[name][0];
            } else {
              formitem = this.$refs[name];
            }
            if (formitem) {
              const err = formitem.validConfig();
              if (err && err.length > 0) {
                errorList.push(...err);
              }
            }
          }
        }
      }
      return errorList;
    },
    updatetabList(newVal, oldVal) {
      if (this.isClearSpecifiedAttr) { // 如果是特定表单，则不处理
        return;
      }
      //tab内联动规则改变
      this.config.tabList.forEach(item => {
        for (let action in item.reaction) {
          const reaction = item.reaction[action];
          if (reaction && !this.$utils.isEmpty(reaction)) {
            this.tabReaction = reaction;
            const result = this.executeReaction(reaction, newVal, oldVal);
            if (action === 'hide') {
              if (result) {
                this.hideFormItem(item);
              } else {
                this.showFormItem(item);
              }
            } else if (action === 'display') {
              if (result) {
                this.showFormItem(item);
              } else {
                this.hideFormItem(item);
              }
            } else if (action === 'readonly') {
              if (result) {
                this.$set(item, 'isReadOnly', true);
              } else {
                this.$set(item, 'isReadOnly', false);
              }
            } else if (action === 'disable') {
              if (result) {
                this.$set(item, 'isDisabled', true);
              } else {
                this.$set(item, 'isDisabled', false);
              }
            }
            this.tabReaction = null;
          }
        }
      });
    },
    hideFormItem(item) {
      this.$set(item, 'isHide', true);
    },
    showFormItem(item) {
      this.$set(item, 'isHide', false);
    },
    clearCurrSpecificAttr() {
      //清除tab隐藏显示规则，用于工单修改表单
      if (this.config.tabList) {
        this.config.tabList.forEach(item => {
          item.reaction = {};
          item.isHide = false;
        });
      }
    },
    updatedTabValue() {
      //tab内数据存在值提示，则更新tabValue
      let tabValue = {};
      if (!this.$utils.isEmpty(this.initFormData) && this.config.tabList && this.config.tabList.length > 0) {
        this.config.tabList.forEach(tab => {
          if (tab.value !== '' && tab.text !== '') {
            tabValue[tab.value] = {};
            const component = tab.component;
            if (!this.$utils.isEmpty(component)) {
              component.forEach(uuid => {
                if (!this.$utils.isEmpty(this.initFormData[uuid])) {
                  tabValue[tab.value][uuid] = this.initFormData[uuid];
                }
              });
            }
          }
        });
      }
      if (!this.$utils.isSame(tabValue, this.tabValue)) {
        this.tabValue = this.$utils.deepClone(tabValue);
      }
    }
  },
  filter: {},
  computed: {
    tabList() {
      let list = [];
      if (this.config.tabList && this.config.tabList.length > 0) {
        this.config.tabList.forEach(tab => {
          if (tab.value !== '' && tab.text !== '') {
            if (this.mode != 'edit' && this.mode != 'editSubform') {
              if (!tab.isHide) {
                list.push(tab);
              }
            } else {
              list.push(tab);
            }
          }
        });
      }
      let findTab = list.find(t => t.value === this.currentTab);
      if (!findTab && !this.$utils.isEmpty(list)) {
        this.currentTab = list[0].value;
      }
      return list;
    },
    tabCompomentList() {
      return uuid => {
        const tab = this.tabList.find(tab => tab.value === uuid);
        if (tab && tab.component && tab.component.length > 0 && this.formItem.component && this.formItem.component.length > 0) {
          const componentList = [];
          this.formItem.component.forEach(d => {
            if (tab.component.includes(d.uuid)) {
              componentList.push(d);
            }
          });
          return componentList;
        }
        return [];
      };
    },
    formDataForWatch() {
      return JSON.parse(JSON.stringify(this.formData));
    },
    conditionData() { //tab内规则用到的条件
      return uuid => {
        const conditionData = {};
        if (this.tabReaction) {
          const reaction = this.tabReaction;
          if (reaction && !this.$utils.isEmpty(reaction) && reaction.conditionGroupList) {
            reaction.conditionGroupList.forEach(cg => {
              if (cg.conditionList) {
                cg.conditionList.forEach(c => {
                  conditionData[c.uuid] = c;
                });
              }
            });
          }
        }
        return conditionData[uuid];
      };
    },
    getValidErrorList() {
      return (tab) => {
        let errorList = [];
        // 获取tab内规则的错误
        if (!this.$utils.isEmpty(this.validateErrorList) && tab.value) {
          this.validateErrorList.forEach(i => {
            if (i.tab === tab.value) {
              errorList.push(...i.errorList);
            }
          });
        }
        return errorList;
      };
    },
    renderTabLabel() { 
      //渲染tab的label
      return function(label, errorList) {
        return (h) => {
          return h('div', [
            h('span', label),
            h('Poptip', {
              props: {
                trigger: 'hover',
                title: '异常',
                width: '350',
                transfer: true,
                'word-wrap': true,
                disabled: !errorList.length
              }
            },
            [
              h('span', {
                class: 'tsfont-warning-s pr-xs text-error'
              }),
              h(
                'div',
                {
                  slot: 'content'
                },
                [h('ul', errorList.map(i => h('li', i)))]
              )
            ]
            )
          ]);
        };
      };
    },
    renderTabLabelValueTip() {
      //tab下面存在value的提示
      return function(tab) {
        return (h) => {
          return h('div', [
            h('span', tab.text),
            h('span', {
              class: !this.$utils.isEmpty(this.tabValue[tab.value]) ? 'tsfont-dot text-href' : '',
              attrs: {
                title: this.$t('page.includesdata')
              }
            })
          ]);
        };
      };
    }
  },
  watch: {
    formDataForWatch: {
      handler(val) {
        if (this.mode != 'edit' && this.mode != 'editSubform') {
          if (this.isFirst || !this.$utils.isSame(val, this.initFormData)) {
            this.updatetabList(val, this.initFormData);
            this.initFormData = this.$utils.deepClone(val);
            this.isFirst = false;
            this.updatedTabValue();
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped></style>
