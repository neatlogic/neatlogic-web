<template>
  <div class="sheet-editor" style="position: relative;">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <div v-if="setting">
      <div v-if="!formView" class="sheetStyle border-color" :style="'border: 1px solid; width:' + setting.config.width">
        <div class="border-color bg-grey" style="height: 38px; border-bottom: 1px solid;">
          <div class="border-color right-btn">
            <svg class="ck ck-icon ck-button__icon" viewBox="0 0 20 20">
              <circle cx="9.5" cy="4.5" r="1.5" />
              <circle cx="9.5" cy="10.5" r="1.5" />
              <circle cx="9.5" cy="16.5" r="1.5" />
            </svg>
          </div>
        </div>
        <Input
          v-model="currentValue"
          class="noborder"
          :placeholder="setting.config.placeholder"
          type="text"
          style="height:130px"
        />
      </div>
      <TsCkeditor 
        v-else-if="!(isReadonly && !currentValue)"
        ref="editor"
        v-model="currentValue" 
        v-bind="getConfig" 
        :width="setting.config.width" 
        :editorMaxlength="setting.config.editorMaxlength" 
        :readonly="isReadonly || false" 
        :maxlength="setting.config.editorMaxlength" 
        :placeholder="setting.config.placeholder"
        @changeVal="getEditVal(currentValue)"
      ></TsCkeditor>
      <template v-else>
        <TsCkeditor 
          ref="editor"
          v-model="currentValue" 
          v-bind="getConfig" 
          :width="setting.config.width" 
          :editorMaxlength="setting.config.editorMaxlength" 
          :readonly="true" 
          :disabled="isReadonly" 
          :maxlength="setting.config.editorMaxlength" 
          :placeholder="setting.config.placeholder"
          @changeVal="getEditVal(currentValue)"
        ></TsCkeditor>
      </template>
    </div>
    <div v-if="setting.config.desc" class="component-tips ts-info">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
import viewmixin from './viewmixin.js';
export default {
  name: 'Formeditor',
  components: { TsCkeditor },
  mixins: [viewmixin],
  props: {
    setting: Object,
    formView: Boolean,
    value: String,
    isReadonly: Boolean,
    componentList: {
      //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    let _this = this;
    return {
      currentValue: _this.value,
      config: {
        value: _this.value || '',
        width: this.setting.config.width || '75%',
        editorMaxlength: this.setting.config.editorMaxlength,
        validateList: this.setting.config.isRequired ? ['required'] : [],
        isRequire: this.setting.config.isRequired,
        readonly: this.isReadonly || false
      }
    };
  },
  mounted() {
    let _this = this;
    setTimeout(function() {
      setButtonContain(_this.$el); //当宽度过小时，设置按钮的宽度
    }, 100);
  },
  methods: {
    getEditVal: function(val) {
      let data = val;
      this.$emit('update', val);
      return data;
    },
    updateValue: function(val) {
      this.$set(this, 'currentValue', val);
    },
    getValue: function(val) {
      return this.currentValue;
    },
    validateValue: function() {
      let isVaild = true;
      if (this.setting.config.isRequired) {
        isVaild = this.$refs.editor.valid();
      }
      return isVaild;
    }
  },
  computed: {
    getConfig() {
      let config = {
        validateList: this.setting.config.isRequired ? ['required'] : []
      };
      return config;
    }
  },
  watch: {
    value: function(newValue, oldValue) {
      if (newValue != this.currentValue) {
        this.currentValue = newValue;
      }
    }
  }
};

function setButtonContain(el) {
  let oContain = el.querySelector('.ck-reset.ck-editor');
  if (oContain) {
    let oButtonContain = el.querySelectorAll('.ck-toolbar__items');
    let width = window.getComputedStyle(oContain).width;
    width = Math.floor(width.replace('px', ''));
    if (width < 300 && oButtonContain.length > 0) {
      oButtonContain[oButtonContain.length - 1].style.width = width + 'px';
      oButtonContain[oButtonContain.length - 1].style.flexWrap = 'wrap';
    }
  }
}
</script>
<style lang="less" scoped>
.sheet-editor {
  .sheetStyle {
    input {
      border: none !important;
      height: 40px !important;
    }
    .right-btn {
      text-align: center;
      float: right;
      border-left: 1px solid;
      width: 36px;
      line-height: 38px;
      padding: 0 5px;
    }
  }
  .component-tips {
    text-align: left;
    font-size: 90%;
    opacity: 0.6;
    word-break: break-all;
    display: block;
    &:before {
      margin-right: 3px;
    }
  }
  /deep/ .noborder input{
    border: none !important;
  }
}
</style>
