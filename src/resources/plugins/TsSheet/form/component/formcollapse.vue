<template>
  <div>
    <Collapse
      v-if="panelList.length > 0"
      :simple="config.isSimple"
      :accordion="config.isAccordion"
      @on-change="changePanel"
    >
      <Panel v-for="(panel, tindex) in panelList" :key="tindex" :name="panel.value">
        {{ panel.text }}
        <div
          slot="content"
          @drop="
            event => {
              dropFormItem(event, panel);
            }
          "
        >
          <div v-if="tabCompomentList(panel.value) && tabCompomentList(panel.value).length > 0" class="bg-op">
            <div v-for="(component, index) in tabCompomentList(panel.value)" :key="component.uuid">
              <ChildFormItem
                :ref="'childFormItem_' + component.uuid"
                class="padding-xs"
                :formItem="component"
                :formData="formData"
                :formItemList="formItemList"
                :mode="mode"
                :disabled="disabled"
                :readonly="readonly"
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
                    removeFormItem(panel.value, item);
                  }
                "
              ></ChildFormItem>
              <Divider v-if="index < tabCompomentList(panel.value).length - 1" style="margin:10px 0px"></Divider>
            </div>
          </div>
          <div v-else class="text-grey padding-sm bg-op">{{ $t('term.framework.dragformcomp') }}</div>
        </div>
      </Panel>
    </Collapse>
    <div v-else class="text-grey">{{ $t('form.placeholder.pleaseadd',{'target':$t('page.tab')}) }}</div>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: {
    ChildFormItem: () => import('@/resources/plugins/TsSheet/child-form-item.vue')
  },
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
    changePanel() {
      //由于展开收起有动画，所以需要延时触发resize
      setTimeout(() => {
        this.$emit('resize');
      }, 300);
    },
    dropFormItem(event, panel) {
      const item = JSON.parse(event.dataTransfer.getData('item'));
      if (panel && item) {
        if (this.addComponent(item)) {
          if (!panel.component) {
            this.$set(panel, 'component', []);
          }
          panel.component.push(item.uuid);
        }
      }
    },
    removeFormItem(panelName, item) {
      if (panelName && this.panelList.length > 0) {
        const panel = this.config.panelList.find(d => d.value === panelName);
        if (panel && panel.component && panel.component.length > 0) {
          const index = panel.component.findIndex(d => d === item.uuid);
          if (index > -1) {
            panel.component.splice(index, 1);
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
    panelList() {
      let panelList = [];
      if (this.config.panelList && this.config.panelList.length > 0) {
        this.config.panelList.forEach(panel => {
          if (panel.value !== '' && panel.text !== '') {
            panelList.push(panel);
          }
        });
      }
      return panelList;
    },
    tabCompomentList() {
      return uuid => {
        const panel = this.panelList.find(panel => panel.value === uuid);
        if (panel && panel.component && panel.component.length > 0 && this.formItem.component && this.formItem.component.length > 0) {
          const componentList = [];
          this.formItem.component.forEach(d => {
            if (panel.component.includes(d.uuid)) {
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
