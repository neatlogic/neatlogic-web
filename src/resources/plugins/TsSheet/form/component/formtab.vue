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
        :label="tab.text"
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
                :ref="'childFormItem_' + component.uuid"
                class="padding-xs"
                :formItem="component"
                :formData="formData"
                :formItemList="formItemList"
                :mode="mode"
                :disabled="disabled || tab.isDisabled"
                :readonly="readonly || tab.isReadOnly"
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
  components: { ChildFormItem: resolve => require(['@/resources/plugins/TsSheet/child-form-item.vue'], resolve) },
  extends: base,
  mixins: [validmixin, conditionMixin],
  props: {},
  data() {
    return {
      initFormData: this.$utils.deepClone(this.formData),
      tabReaction: {},
      currentTab: null,
      isFirst: true
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
    dropFormItem(event, tab) {
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
      //tab内联动规则改变
      this.config.tabList.forEach(item => {
        for (let action in item.reaction) {
          const reaction = item.reaction[action];
          if (reaction && !this.$utils.isEmpty(reaction)) {
            this.tabReaction = reaction;
            if (action === 'hide') {
              const result = this.executeReaction(reaction, newVal, oldVal);
              if (result) {
                this.hideFormItem(item);
              } else {
                this.showFormItem(item);
              }
            } else if (action === 'display') {
              const result = this.executeReaction(reaction, newVal, oldVal);
              if (result) {
                this.showFormItem(item);
              } else {
                this.hideFormItem(item);
              }
            } else if (action === 'readonly') {
              const result = this.executeReaction(reaction, newVal, oldVal);
              if (result) {
                this.$set(item, 'isReadOnly', true);
              } else {
                this.$set(item, 'isReadOnly', false);
              }
            } else if (action === 'disable') {
              const result = this.executeReaction(reaction, newVal, oldVal);
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
