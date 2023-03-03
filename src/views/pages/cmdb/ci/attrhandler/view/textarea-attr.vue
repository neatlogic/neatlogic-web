<template>
  <div v-if="mode == 'list'">
    <span v-if="!isJson">
      <span v-if="value.length <= 100">{{ value }}</span>
      <span v-else>
        {{ value.substr(0, 100) }}
        <i class="tsfont-option-horizontal text-href" @click="isShow = true"></i>
      </span>
    </span>
    <a
      v-else
      href="javascript:void(0)"
      class="tsfont-json"
      @click="isShow = true"
    ></a>
    <TsDialog v-if="isShow" v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <span v-if="!isJson">{{ value }}</span>
        <JsonViewer
          v-else
          boxed
          copyable
          :value="JSON.parse(value)"
        ></JsonViewer>
      </template>
    </TsDialog>
  </div>
  <div v-else-if="mode == 'detail'">
    <span v-if="!isJson">{{ value }}</span>
    <JsonViewer
      v-else
      boxed
      copyable
      :value="JSON.parse(value)"
    ></JsonViewer>
  </div>
</template>
<script>
import JsonViewer from 'vue-json-viewer';

export default {
  name: '',
  components: {
    JsonViewer
  },
  props: {
    mode: { type: String, default: 'list' },
    attrEntity: { type: Object }
  },
  data() {
    return {
      isShow: false,
      dialogConfig: {
        type: 'modal',
        title: '详细信息',
        maskClose: true,
        isShow: true,
        hasFooter: false,
        width: 'medium'
      }
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
    close() {
      this.isShow = false;
    }
  },
  filter: {},
  computed: {
    isJson() {
      let isJson = false;
      try {
        JSON.parse(this.value);
        isJson = true;
      } catch (e) {
        isJson = false;
      }
      return isJson;
    },
    value: function() {
      if (this.attrEntity.valueList && this.attrEntity.valueList.length > 0) {
        return this.attrEntity.valueList[0];
      }
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
