
<template>
  <div>
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        组件样式
      </label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.mode" class="col-3" @on-change="setting.needPage=false">
          <Radio label="dialog">弹窗显示</Radio>
          <Radio label="normal">直接显示</Radio>
        </RadioGroup>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Resourceinput',
  components: {},
  mixins: [],
  inheritAttrs: false,
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },
  data() {
    return {
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
    validComponent() {
      let validList = [];
      return validList;
    }
  },
  computed: {},
  watch: {}
};
</script>
