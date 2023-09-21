
### 组件配置使用模版
```javascript
<template>
  <div class="selectContent">
    <div class="formsetting-block">
      <label class="formsetting-label text-grey require-label">工单服务</label>
      <div class="formsetting-text bg-block">
        <TsFormSelect ref="catalog" v-model="setting.catalogList" ></TsFormSelect>
      </div>
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: 'Custommergeprocess',
  components: { TsFormSelect},
  mixins: [],
  inheritAttrs: false, //去掉多余的属性
  props: {
    uuid: String,//组件对应的uuid，唯一标示
    setting: Object，//组件的配置数据  现在的编辑页面是直接改变setting值，之所以这样，是因为原先提了需求布局显示的内容和配置需要实时联动
    controllerList: Array//整个表单所有的组件数组，主要用于在默认值饮用，一般是引用同类型组件
  },
  data() {
    return {
    };
  },
  mounted() {},
  created() {},
  destroyed() {},
  methods: {
    validComponent() {//校验,返回校验不通过信息数组 有些组件配置属性有特殊要求，需要校验
      let validList = [];
      if (this.$refs.catalog && !this.$refs.catalog.valid()) {
        validList.push('工单服务：不能为空');
      }
      return validList;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
```


### 组件预览使用模版
```javascript
<template>
  <div style="position: relative;">
    <!-- 如果组件必填的显示标示 -->
    <i v-if="setting.config.isRequired" class="require-tip">*</i> 
    <!-- 属性回显，如果是直接可用的属性中间不需要转一层的直接列出来如：:multiple="setting.config.isMultiple"   如果需要转一层的组件则通过 v-bind="getConfig" 的getConfig计算属性来返回 -->
    <TsFormSelect 
      v-if="setting || formView" 
      v-model="currentValue" 
      v-bind="getConfig" 
      :width="setting.config.width || null" 
      :name="setting.uuid || null" 
      :multiple="setting.config.isMultiple" 
      :dataList="[]" 
      :readonly="isReadonly || false" 
      :value="currentValue"
      :showName="setting.config.dataSource == 'matrix' ? 'html' : 'text'" 
      :placeholder="setting.config.placeholder"
      search 
      clearable 
      transfer 
      @on-change="updatethis(currentValue)"
      @change-label="changeLabel"
    ></TsFormSelect>
    <!-- 配置数据没有或则组件显示在编辑布局里面，展示简单组件即可，主要是为了性能考虑 -->
    <Select v-else placeholder="请选择"></Select>
    <!-- 组件描述显示区域 -->
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">{{ setting.config.desc }}</div> 
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
export default {
  name: 'Formselect',
  components: { TsFormSelect },
  mixins: [sheetCompontMixins],
  props: {
    setting: Object,//组件配置里面设置的属性值
    value: [Array, String],//组件值
    isReadonly: Boolean,//是否只读
    formView: {//false 代表着组件显示在布局编辑那一块（作用：简化显示，节约性能），  true 代表着通过form-view页面显示
      type: Boolean,
      default: true
    },
    componentList: {//同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    let _this = this;
    return {
      currentValue: _this.value
    };
  },
  created() {},
  mounted() {
  },
  methods: {
    updatethis: function(val) {//简单的组件可以直接调用这个方法直接更改父组件的值，复杂的组件值比较复杂则需要通过geValue把值给抛出去
      this.$emit('update', val);
    },
    updateValue: function(val) {//这个方法可以没有，之所以存在主要是为了统一写法
      this.$set(this, 'currentValue', val);
    },
    getValue(val) {//父组件调用这个方法，拿取组件值，用来保存数据
      return this.currentValue;
    },
    validateValue: function() {//校验，比如必填，比如必须为number等等 ，现有的项目组件直接调用valid来显示提示字，有些复杂组件可能需要自己写红色提示文案
      let isVaild = true;
      if (this.setting.config.isRequired) {
        isVaild = this.$children[0].valid();
      }
      return isVaild;
    }
  },
  computed: {
    getConfig: function() {//处理一些需要转换的配置，比如必填等等，然后绑定到组件上面
      let config = this.defaultSelfJson;
      config.validateList = this.setting.config.isRequired ? ['required'] : [];
      config.readonlyClass = '';
      return config;
    }
  },
  watch: {
    value: function(newValue, oldValue) {
      //处理值的回显  如调用updateValue 方法
    },
    'setting.config.filterList': {//如果组件存在过滤值的表单联动，则需要监听这个属性做特殊处理
      handler: function(val) {
        //处理过滤规则 
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped></style>
```


