<template>
  <div>
    <Tabs
      v-if="tabList.length > 0"
      :name="formItem.uuid"
      :type="config.type"
      :animated="false"
      @on-click="changeTab()"
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
                :disabled="disabled || !!formItem.hasOwnProperty('inherit')"
                :readonly="readonly"
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
    <div v-else class="text-grey">{{ $t('form.placeholder.pleaseadd',{'target':$t('page.tab')}) }}</div>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: { ChildFormItem: resolve => require(['@/resources/plugins/TsSheet/child-form-item.vue'], resolve) },
  extends: base,
  mixins: [validmixin],
  props: {},
  data() {
    return {};
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
    changeTab() {
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
    }
  },
  filter: {},
  computed: {
    tabList() {
      let tabList = [];
      if (this.config.tabList && this.config.tabList.length > 0) {
        this.config.tabList.forEach(tab => {
          if (tab.value !== '' && tab.text !== '') {
            tabList.push(tab);
          }
        });
      }
      return tabList;
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
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
