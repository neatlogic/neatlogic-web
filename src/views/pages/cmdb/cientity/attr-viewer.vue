<template>
  <div>
    <div v-if="handlers[handler + 'attr']">
      <component
        :is="handler + 'attr'"
        ref="attrHandler"
        :handler="handler"
        :mode="mode"
        :ciEntity="ciEntity"
        :attrEntity="attrEntity"
        :authData="authData"
      ></component>
    </div>
    <div v-else>
      <div v-if="attrEntity.actualValueList && attrEntity.actualValueList.length > 0">
        <span v-for="(value, index) in attrEntity.actualValueList" :key="index">
          <span>{{ typeof value=='object' && value.text ?(value.text||'-'):(value||'-') }}</span>
          <span v-if="index < attrEntity.actualValueList.length - 1">、</span>
        </span>
      </div>
      <div v-else>-</div>
    </div>
  </div>
</template>
<script>
import * as handlers from '../ci/attrhandler/view/index.js';

export default {
  name: 'AttrViewer',
  components: {
    ...handlers
  },
  props: {
    mode: { type: String, default: 'list' }, //显示模式，只有list和detail两种，某些组件在不同显示模式下会有不同的展示方式
    handler: { type: String },
    ciEntity: {type: Object},
    attrEntity: { type: Object },
    authData: { type: Object } //权限数据
  },
  data() {
    return {
      handlers: handlers
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
