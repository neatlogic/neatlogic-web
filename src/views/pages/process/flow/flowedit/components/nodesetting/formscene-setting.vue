<template>
  <div class="formscene-setting-wrap pl-nm pr-nm">
    <div class="flex pb-xs">
      <span class="text-title">{{ $t('term.process.formscene') }}</span>
      <div v-if="$utils.isEmpty(formConfig.uuid) ? false : true" class="action-group text-title">
        <span class="action-item tsfont-circulation-s" @click="openPreview"></span>
        <span v-if="canEditScene" class="action-item tsfont-edit" @click="toEditFormScene"></span>
        <span class="action-item tsfont-refresh" @click="getSceneDataList"></span>
      </div>
    </div>
    <TsFormSelect
      ref="formSelect"
      v-model="formSceneUuid"
      :dataList="dataList"
      :disabled="$utils.isEmpty(formConfig.uuid)"
      transfer
      border="border"
      @change="changeFormSelect"
    >
      <template v-slot:first-ul>
        <li class="text-href tsfont-plus text-center" @click="toAddFormScene">{{ $t('term.process.formscene') }}</li>
      </template>
      <template v-slot:option="{item}">
        <div>{{ item.text }}</div>
      </template>
    </TsFormSelect>
    <div v-if="$utils.isEmpty(formConfig.uuid)" class="text-tip mt-xs">
      {{ $t('term.process.norelformtip') }}
      <a href="javascript:void(0);" @click="toSetting">{{ $t('term.process.flowsetting') }}</a>
      {{ $t('term.process.relform') }}
    </div>
    <div v-else-if="!$utils.isEmpty(formConfig.uuid)" class="text-tip mt-xs">
      {{ $t('term.process.noformscenetip') }}
    </div>
    <FormPreview
      v-if="isPreviewShow"
      :data="formPreviewContent"
      :formSceneUuid="formSceneUuid || 'defaultSceneUuid'"
      @close="closePreview"
    ></FormPreview>
  </div>
</template>
<script>
import nodemixin from '@/views/pages/process/flow/flowedit/components/nodemixin.js';
import itemmixin from '@/views/pages/process/flow/flowedit/components/itemmixin.js';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    FormPreview: resolve => require(['@/resources/plugins/TsSheet/form-preview.vue'], resolve)
  },
  mixins: [nodemixin, itemmixin],
  props: {
    value: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      versionUuid: '', // 表单版本id
      formSceneUuid: this.value.formSceneUuid || '',
      isPreviewShow: false,
      formPreviewContent: {},
      dataList: [],
      mainSceneUuid: '' //主场景
    };
  },
  beforeCreate() {},
  created() {
    this.getSceneDataList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    closePreview() {
      this.isPreviewShow = false;
    },
    async openPreview() {
      await this.getSceneDataList(false);
      this.isPreviewShow = true;
    },
    toAddFormScene() {
      // 新增表单场景
      window.open(HOME + '/framework.html#form-scene-edit' + '?uuid=' + this.formConfig.uuid + '&currentVersionUuid=' + this.versionUuid + '&type=add', '_blank');
    },
    toEditFormScene() {
      // 表单场景编辑
      if (this.formSceneUuid != this.mainSceneUuid) {
        window.open(HOME + '/framework.html#form-scene-edit' + '?uuid=' + this.formConfig.uuid + '&currentVersionUuid=' + this.versionUuid + '&sceneUuid=' + this.formSceneUuid + '&type=edit', '_blank');
      } else {
        window.open(HOME + '/framework.html#form-edit' + '?uuid=' + this.formConfig.uuid + '&currentVersionUuid=' + this.versionUuid + '&sceneUuid=' + this.formSceneUuid + '&type=edit', '_blank');
      }
    },
    async getSceneDataList(isClear = true) {
      // 获取表单场景列表
      if (this.formConfig.uuid) {
        if (isClear) {
          this.dataList = [];
        }
        this.formPreviewContent = {};
        await this.$api.framework.form.getFormByVersionUuid({uuid: this.formConfig.uuid}).then(res => {
          if (res.Status == 'OK') {
            try {
              let formConfig = res.Return.formConfig || {};
              this.mainSceneUuid = formConfig.uuid;
              this.formPreviewContent = formConfig;
              let defaultSceneUuid = formConfig.defaultSceneUuid || formConfig.uuid;
              this.versionUuid = res.Return.currentVersionUuid;
              if (formConfig.name && formConfig.uuid && isClear) {
                this.dataList.push({
                  text: formConfig.uuid === defaultSceneUuid ? this.$t('page.mainscene') + '(' + this.$t('page.defaultscenario') + ')' : this.$t('page.mainscene'),
                  value: formConfig.uuid
                });
              }
              formConfig.sceneList && formConfig.sceneList.forEach((item) => {
                if (item.name && item.uuid && isClear) {
                  this.dataList.push({
                    text: item.uuid === defaultSceneUuid ? item.name + '(' + this.$t('page.defaultscenario') + ')' : item.name,
                    value: item.uuid
                  });
                }
              });
            } catch (error) {
              this.dataList = [];
              this.formPreviewContent = {};
            }
          }
        });
      }
    },
    changeFormSelect(currentVal, valueObj) {
      this.$emit('updateScene', valueObj);
    }
  },
  filter: {},
  computed: {
    canEditScene() {
      // 选择表单场景，并且回显正确，才可以编辑场景
      let canEdit = false;
      if (this.formSceneUuid && !this.$utils.isEmpty(this.dataList) && this.dataList.find((item) => item.value == this.formSceneUuid)) {
        canEdit = true;
      }
      return canEdit;
    }
  },
  watch: {
    value: {
      handler(val) {
        this.formSceneUuid = (val && val.formSceneUuid) ? val.formSceneUuid : '';
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.formscene-setting-wrap {
  .flex {
    display: flex;
    justify-content: space-between;
  }
}
</style>
