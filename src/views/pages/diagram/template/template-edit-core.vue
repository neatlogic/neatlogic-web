<template>
  <div>
    <div v-if="templateQueue && templateQueue.length > 1" class="pt-xs pb-lg">
      <Breadcrumb separator="<span class='tsfont-arrow-right'></span>">
        <BreadcrumbItem v-for="(template, index) in templateQueue" :key="index">
          <span v-if="index == templateQueue.length - 2" style="font-size: 15px">
            <a href="javascript:void(0)" class="text-info" @click="back()">
              <span>{{ template.name }}</span>
            </a>
          </span>
          <span v-else-if="index == templateQueue.length - 1" style="font-size: 15px">
            <span>{{ template.name }}</span>
          </span>
          <span v-else class="text-grey" style="font-size: 15px">
            <span>{{ template.name }}</span>
          </span>
        </BreadcrumbItem>
      </Breadcrumb>
    </div>
    <div class="padding bg-op radius-md">
      <TsForm v-model="currentTemplate" :item-list="formConfig">
        <template v-slot:widgetTypeList>
          <div>
            <div v-for="(widgetType, windex) in widgetTypeList" :key="windex">
              <div>
                <span>
                  <Checkbox
                    :value="isWidgetTypeSelected(widgetType)"
                    @on-change="
                      val => {
                        toggleWidgetType(widgetType, val);
                      }
                    "
                  ></Checkbox>
                </span>
                <span>{{ widgetType.label }}</span>
              </div>
              <div>
                <div
                  v-for="(widget, index) in widgetType.widgets"
                  :key="index"
                  class="radius-sm overflow widget-item pl-xs pr-xs mr-xs border-base cursor"
                  :class="getWidgetClass(widgetType, widget)"
                  @click="toggleWidgetItem(widgetType, widget)"
                >
                  <span>{{ widget.label }}</span>
                  <span class="text-grey">·{{ widget.name }}</span>
                </div>
              </div>
            </div>
            <!--<div v-if="currentTemplate.widgetList.length > 0" class="mt-md">
              <div v-for="(widget, index) in currentTemplate.widgetList" :key="index" class="grid">
                <div>{{ widget.label }}</div>
                <div></div>
              </div>
            </div>-->
          </div>
        </template>
      </TsForm>
    </div>
  </div>
</template>
<script>
import { WIDGET_TYPES, WidgetFactory } from '@/views/pages/diagram/graph/core/WidgetFactory.js';

export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    templateQueue: { type: Array }
  },
  data() {
    return {
      widgetTypeList: WIDGET_TYPES(),
      formConfig: [
        {
          name: 'name',
          label: '名称',
          type: 'text',
          validateList: ['required']
        },
        {
          name: 'widgetTypeList',
          label: '可选组件',
          type: 'slot'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    //this.searchWidget();
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
    back() {},
    isWidgetTypeSelected(widgetType) {
      return !!this.currentTemplate.widgetTypeList.find(d => d.name === widgetType.name);
    },
    toggleWidgetType(widgetType, isSelected) {
      if (isSelected) {
        if (!this.currentTemplate.widgetTypeList.find(d => d.name === widgetType.name)) {
          let { name, label } = widgetType;
          this.currentTemplate.widgetTypeList.push({ name, label, widgetList: [] });
        }
      } else {
        const index = this.currentTemplate.widgetTypeList.findIndex(d => d.name === widgetType.name);
        if (index > -1) {
          this.currentTemplate.widgetTypeList.splice(index, 1);
        }
      }
    },
    toggleWidgetItem(widgetType, widget) {
      const typeIndex = this.currentTemplate.widgetTypeList.findIndex(d => d.name === widgetType.name);
      if (typeIndex > -1) {
        const type = this.currentTemplate.widgetTypeList[typeIndex];
        if (type.widgetList.length === 0) {
          //默认选中模式下，需要填入其他widget并排除此widget
          const pWidgetType = this.widgetTypeList.find(d => d.name === widgetType.name);
          if (pWidgetType) {
            //如果此分类的widget只有一个时，直接删除此分类
            if (pWidgetType.widgets.length > 1) {
              pWidgetType.widgets.forEach(w => {
                if (w.name !== widget.name) {
                  type.widgetList.push(w);
                }
              });
            } else {
              this.currentTemplate.widgetTypeList.splice(typeIndex, 1);
            }
          }
        } else {
          const index = type.widgetList.findIndex(d => d.name === widget.name);
          if (index > -1) {
            type.widgetList.splice(index, 1);
            if (type.widgetList.length === 0) {
              this.currentTemplate.widgetTypeList.splice(typeIndex, 1);
            }
          } else {
            type.widgetList.push(widget);
          }
        }
      } else {
        let { name, label } = widgetType;
        this.currentTemplate.widgetTypeList.push({ name, label, widgetList: [widget] });
      }
    },
    /* searchWidget() {
      this.$api.diagram.widget.searchWidget({ isActive: 1 }).then(res => {
        this.widgetList = res.Return.filter(d => !!WidgetFactory.getWidget(d.name));
      });
    },*/
    getWidgetClass(widgetType, widget) {
      const type = this.currentTemplate.widgetTypeList.find(d => d.name === widgetType.name);
      if (type) {
        if (type.widgetList.length === 0 || type.widgetList.find(d => d.name === widget.name)) {
          return 'border-primary bg-selected';
        }
      }
      return 'border-base';
    }
  },
  filter: {},
  computed: {
    currentTemplate() {
      return this.templateQueue[this.templateQueue.length - 1];
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.widget-item {
  display: inline-block;
  width: 200px;
}
.grid {
  display: grid;
  grid-template-columns: 200px auto;
}
</style>
