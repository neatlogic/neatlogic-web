<template>
  <div>
    <TsFormItem :label="$t('page.border')" labelPosition="top">
      <div class="pl-md"><Slider v-model="data.borderWidth" :min="0" :max="10"></Slider></div>
    </TsFormItem>
    <TsFormItem :label="$t('term.cmdb.bordercolor')" labelPosition="top">
      <ColorPicker
        :transfer="true"
        :value="data.borderColor"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'borderColor', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem :label="$t('term.cmdb.iconcolor')" labelPosition="top">
      <ColorPicker
        :transfer="true"
        :value="data.iconColor"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'iconColor', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem :label="$t('term.cmdb.backgroundcolor')" labelPosition="top">
      <ColorPicker
        :transfer="true"
        :value="data.bgColor"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'bgColor', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem :label="$t('term.cmdb.textcolor')" labelPosition="top">
      <ColorPicker
        :transfer="true"
        :value="data.fontColor"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'fontColor', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem :label="$t('page.edit')" labelPosition="top">
      <Button type="primary" ghost @click="editGraph()">{{ $t('dialog.title.edittarget', { target: $t('term.cmdb.view') }) }}</Button>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  extends: base,
  props: {},
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
    editGraph() {
      this.$router.push({ path: '/graph-edit/' + this.data.id });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
