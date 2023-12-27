<template>
  <div>
    <div class="formsetting-block">
      <div>
        <label class="formsetting-label text-grey">
          自定义脚本
          <span
            v-if="!globalSetting.scriptsConfig"
            class="text-href tsfont-edit"
            style="margin-left:16px;"
            @click="editScript"
          ></span>
        </label>
      </div>
      <div v-if="globalSetting.scriptsConfig">
        <div class="script-container">
          <TsCodemirror ref="cms" v-model="scriptsConfig" disabled></TsCodemirror>
          <div class="tsfont-edit btn-editscript bg-block" @click="editScript"></div>
        </div>
      </div>
    </div>
    <ScriptEdit
      v-if="isEdit"
      :isEdit="isEdit"
      :scriptsConfig="scriptsConfig"
      :controllerList="controllerList"
      @close="close"
      @updateScript="updateScript"
    ></ScriptEdit>
  </div>
</template>
<script>
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
export default {
  name: '',
  components: {
    ScriptEdit: resolve => require(['./script/script-edit.vue'], resolve),
    TsCodemirror
  },
  props: {
    globalSetting: { type: Object },
    controllerList: { type: Array },
    sheetsConfig: Object,
    componentRuleuuid: String
  },
  data() {
    return {
      scriptsConfig: '',
      isEdit: false
    };
  },
  created() {},
  mounted() {
  },
  destroyed() {},
  methods: {
    valid() {
      let isVaild = true;
      return isVaild;
    },
    editScript() {
      this.isEdit = true;
    },
    close() {
      this.isEdit = false;
    },
    updateScript(val) {
      this.$emit('updateGlobal', 'scriptsConfig', val);
    }
  },
  computed: {},
  watch: {
    'globalSetting.scriptsConfig': {
      handler: function(val) {
        let defaultvalue = `{
  loadFn:function(list,ajax,it){

  },
  changeFn:function(uuid,val,list,ajax,it){
    
  }
}`;
        this.scriptsConfig = val || defaultvalue;
        let _this = this;
        setTimeout(function() {
          _this.$refs.cms && _this.$refs.cms.refresh();
        }, 0);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.script-container {
  position: relative;
  .btn-editscript {
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
    z-index: 5;
    opacity: 0;
    &:before {
      position: absolute;
      font-size: 24px;
      line-height: 40px;
      height: 40px;
      cursor: pointer;
      width: 40px;
      left: 50%;
      top: 50%;
      margin-top: -20px;
      margin-left: -20px;
    }
  }
  &:hover {
    .btn-editscript {
      opacity: 0.6;
    }
  }
}
</style>
