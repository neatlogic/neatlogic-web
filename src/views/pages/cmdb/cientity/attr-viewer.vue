<template>
  <div>
    <div v-if="handlerComponent">
      <component
        :is="handlerComponent"
        ref="attrHandler"
        :handler="handler"
        :mode="mode"
        :wordList="wordList"
        :ciEntity="ciEntity"
        :attrEntity="attrEntity"
        :authData="authData"
      ></component>
    </div>
    <div v-else>
      <div v-if="attrEntity.actualValueList && attrEntity.actualValueList.length > 0">
        <span v-for="(value, index) in attrEntity.actualValueList" :key="index">
          <span>{{ typeof value == 'object' && value.text ? value.text || '-' : value || '-' }}</span>
          <span v-if="index < attrEntity.actualValueList.length - 1">、</span>
        </span>
      </div>
      <div v-else-if="attrEntity.valueList && attrEntity.valueList.length > 0">
        <span v-for="(value, index) in attrEntity.valueList" :key="index">
          <span>{{ typeof value == 'object' && value.text ? value.text || '-' : value || '-' }}</span>
          <span v-if="index < attrEntity.valueList.length - 1">、</span>
        </span>
      </div>
      <div v-else>-</div>
    </div>
  </div>
</template>
<script>
import * as coreHandlers from '../ci/attrhandler/view/index.js';
import { getAttrHandlerComponentMap } from '../ci/attrhandler/attrhandler-extension.js';

export default {
  name: 'AttrViewer',
  props: {
    mode: { type: String, default: 'list' }, //显示模式，只有list和detail两种，某些组件在不同显示模式下会有不同的展示方式
    handler: { type: String },
    ciEntity: { type: Object },
    attrEntity: { type: Object },
    wordList: { type: Array }, //分词结果
    authData: { type: Object } //权限数据
  },
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
  methods: {},
  filter: {},
  computed: {
    handlerComponent() {
      if (!this.handler) {
        return null;
      }
      return getAttrHandlerComponentMap('view', coreHandlers)[this.handler + 'attr'];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
