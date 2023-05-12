<template>
  <div>
    <TsFormItem label="名称" labelPosition="top">
      <div class="padding-sm radius-sm">
        <TsFormInput v-model="config.name" border="border" :maxlength="50"></TsFormInput>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.icon')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <div class="logo bg-block border-color text-primary" @click="isIconDialogShow = true">
          <i class="logo-icon" :class="(config.icon && config.icon.replace('#', '')) || 'tsfont-question-o'"></i>
        </div>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.color')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <ColorPicker
          :value="config.iconcolor || ''"
          :transfer="true"
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfig('iconcolor', val);
              setConfig('stroke', val);
            }
          "
        />
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.edit')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <Button type="primary" ghost @click="editGraph()">{{ $t('dialog.title.edittarget', { target: $t('term.cmdb.view') }) }}</Button>
      </div>
    </TsFormItem>
    <IconDialog
      v-if="isIconDialogShow"
      :currentIcon="config.icon"
      @cancel="(isIconDialogShow = false), (icon = 'tsfont-ci-o')"
      @confirm="selectIcon"
    ></IconDialog>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    IconDialog: resolve => require(['@/views/pages/common/icon-dialog.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      isIconDialogShow: false,
      configLocal: this.config
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
      this.$router.push({ path: '/graph-edit/' + this.config.config.id });
    },
    selectIcon(icon) {
      this.setConfig('icon', '#' + icon);
      this.isIconDialogShow = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.logo {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: inline-block;
  position: relative;
  border: 1px solid;
  top: -5px;
  text-align: center;
  line-height: 40px;
  .logo-icon {
    font-size: 20px;
    // position: absolute;
    // top: 4px;
    // left: 10px;
  }
  &::after {
    content: '更换';
    left: 44px;
    width: 40px;
    position: absolute;
    top: 2px;
  }
}
</style>
