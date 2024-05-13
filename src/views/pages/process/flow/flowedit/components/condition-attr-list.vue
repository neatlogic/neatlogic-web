<template>
  <div :class="level > 0 ? 'border-base radius-sm padding-xs mt-xs mb-xs' : ''">
    <span v-for="(attr, index) in formAttrList" :key="index">
      <Tag>
        <span v-clipboard="getScriptParam(attr)" v-clipboard:success="clipboardSuc" class="cursor">{{ attr.label }}</span>
        <span v-if="attr.handlerName" class="text-grey fz10">({{ attr.handlerName }})</span>
        <span
          v-if="attr.subParamList && attr.subParamList.length > 0"
          class="cursor"
          :class="{
            'tsfont-drop-down': !showMap[attr.name],
            'tsfont-drop-up': !!showMap[attr.name]
          }"
          @click="toggleSubParam(attr.name)"
        ></span>
      </Tag>
      <span v-if="showMap[attr.name] && attr.subParamList && attr.subParamList.length > 0">
        <ConditionAttrList
          :level="level + 1"
          :parentAttrLabel="parentAttrLabel ? parentAttrLabel + '.' + attr.label : attr.label"
          :parentAttr="parentAttr ? parentAttr + '.' + attr.name : attr.name"
          :formAttrList="attr.subParamList"
        ></ConditionAttrList>
      </span>
    </span>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';

export default {
  name: '',
  directives: { clipboard },
  components: {
    ConditionAttrList: resolve => require(['./condition-attr-list.vue'], resolve)
  },
  props: {
    parentAttr: { type: String },
    parentAttrLabel: { type: String },
    level: { type: Number, default: 0 },
    formAttrList: { type: Array }
  },
  data() {
    return {
      showMap: {}
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
  methods: {
    clipboardSuc() {
      this.$Message.success(this.$t('message.copysuccess'));
    },
    toggleSubParam(name) {
      if (!this.showMap[name]) {
        this.$set(this.showMap, name, true);
      } else {
        this.$set(this.showMap, name, false);
      }
    },
    getScriptParam(attr) {
      let str = '';
      if (this.parentAttrLabel) {
        const ps = this.parentAttrLabel.split('\.');

        ps.forEach(p => {
          str += "['" + p + "'][?]";
        });
      }
      return '/*' + (this.parentAttrLabel ? this.parentAttrLabel + '.' : '') + attr.label + '*/ data' + str + "['" + attr.label + "']";
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
