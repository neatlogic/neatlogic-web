<template>
  <div class="resourceinput">
    <div>
      <i v-if="setting.config.isRequired" class="require-label"></i>
      <Button v-if="!isReadonly && !formView">添加目标</Button>
    </div>
    <template v-if="formView">
      <div v-if="setting.config.mode == 'normal'" class="node-main">
        <ResourceinputNomarl
          ref="resourceinputNomarl"
          :setting="setting"
          :isReadonly="isReadonly"
          :defaultValue="currentValue"
          :formView="formView"
        ></ResourceinputNomarl>
      </div>
      <div v-else class="node-main">
        <ResourceinputDialog
          ref="resourceinputNomarl"
          :setting="setting"
          :isReadonly="isReadonly"
          :defaultValue="currentValue"
          :formView="formView"
        ></ResourceinputDialog>
      </div>
      <transition name="fade">
        <span v-if="validMesage != ''" class="form-error-tip">{{ validMesage }}</span>
      </transition>
    </template>
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">
      {{ setting.config.desc }}
    </div>
  </div>
</template>
<script>
import viewmixin from '@/resources/components/FormMaker/formedit/view/viewmixin.js';
export default {
  name: 'Resourceinput',
  components: {
    ResourceinputNomarl: () => import('./resourceinput-nomarl'),
    ResourceinputDialog: () => import('./resourceinput-dialog')
  },
  mixins: [viewmixin],
  props: {
    setting: Object, //组件配置里面设置的属性值
    value: [Array, String], //组件值
    isReadonly: Boolean, //是否只读
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
      currentValue: [],
      validMesage: ''
    };
  },
  created() {},
  mounted() {
  },
  methods: {
    updatethis: function(val) { //简单的组件可以直接调用这个方法直接更改父组件的值，复杂的组件值比较复杂则需要通过geValue把值给抛出去
      this.$emit('update', val);
    },
    updateValue: function(val) { //这个方法可以没有，之所以存在主要是为了统一写法
      val && this.$set(this, 'currentValue', val);
    },
    getValue() { //父组件调用这个方法，拿取组件值，用来保存数据
      let list = this.$refs.resourceinputNomarl ? this.$refs.resourceinputNomarl.save() : [];
      return list;
    },
    validateValue: function() { //校验，比如必填，比如必须为number等等 ，现有的项目组件直接调用valid来显示提示字，有些复杂组件可能需要自己写红色提示文案
      let isVaild = true;
      this.validMesage = '';
      let list = this.getValue();
      if (this.setting.config.isRequired && list.length <= 0) {
        this.validMesage = '目标不能为空';
        isVaild = false;
      }
      return isVaild;
    }
  },
  computed: {
    getConfig: function() { //处理一些需要转换的配置，比如必填等等，然后绑定到组件上面
      let config = this.defaultSelfJson;
      config.validateList = this.setting.config.isRequired ? ['required'] : [];
      config.readonlyClass = '';
      return config;
    }
  },
  watch: {
    value: {
      handler: function(newValue, oldValue) {
        this.updateValue(newValue);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.resourceinput{
  position: relative;
  .require-label{
    position: absolute;
    left: -8px;
    top: 10px;
    margin-top: -9px;
    height: 18px;
  }

}
.node-main {
  width: 100%;
  overflow-x: auto;
}
</style>
