<template>
  <TsForm
    ref="layoutForm"
    v-model="widget"
    :item-list="layoutFormConfig"
    labelPosition="top"
  >
    <template v-slot:padding>
      <div class="pl-md pr-md">
        <Slider
          v-model="widget.padding"
          :min="0"
          :max="50"
          :step="1"
          show-tip="never"
        ></Slider>
      </div>
    </template>
    <template v-slot:isOpacity>
      <TsFormSwitch
        :value="widget.isOpacity?1:0"
        :trueValue="1"
        :falseValue="0"
        @on-change="val=>{ $set(widget, 'isOpacity', val)}"
      ></TsFormSwitch>
    </template>
  </TsForm>
</template>
<script>

export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    widget: { type: Object }
  },
  data() {
    return {
      layoutFormConfig: {
        name: {
          type: 'text',
          label: this.$t('page.title'),
          onChange: (val) => {
            if (this.widget) {
              this.$set(this.widget, 'name', val.trim());
            } 
          }
        },
        padding: {
          type: 'slot',
          label: this.$t('page.margin')
        },
        isOpacity: {
          type: 'slot',
          label: this.$t('page.backgroundopacity')
        }
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
  },
  filter: {},
  computed: {
  },
  watch: {
  }
};
</script>
<style lang="less" scoped></style>
