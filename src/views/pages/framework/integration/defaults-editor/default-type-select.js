import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
import { defaultTypeList } from './index.js';

export default {
  name: 'DefaultTypeSelect',
  extends: TsFormSelect,
  // 复用公共选择框的模板和交互，不将历史类型重新加入下拉候选项。
  staticRenderFns: TsFormSelect.staticRenderFns || [],
  render(h) { return TsFormSelect.render.call(this, h); },
  methods: {
    initValueByNodeList() {
      TsFormSelect.methods.initValueByNodeList.call(this);
      // 公共选择框仅回显候选项中的值；补充历史选中标签，不触发 change 或修改原配置。
      if (!this.selectedList.length && ['int', 'boolean'].includes(this.currentValue)) {
        const type = defaultTypeList.find(item => item.value === this.currentValue);
        this.selectedList = [{ [this.valueName]: type.value, [this.textName]: this.$t(type.textKey) }];
      }
    }
  }
};
