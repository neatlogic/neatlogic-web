<template>
  <div>
    <div class="tstable-container tstable-normal padding-md radius-md" :class="isValid?'bg-op':'bg-error-grey'">
      <table class="tstable-body" width="100%">
        <thead>
          <tr>
            <th></th>
            <th>{{ $t('page.attribute') }}</th>
            <th>{{ $t('page.require') }}</th>
            <th></th>
          </tr>
        </thead>
        <draggable
          v-if="dataConfig && dataConfig.length > 0"
          tag="tbody"
          :list="dataConfig"
          handle=".tsfont-bar"
          class="tbody-main"
          ghost-class="li-active"
        >
          <tr v-for="(data, index) in dataConfig" :key="index" class="tstable-tr">
            <td>
              <span class="tsfont-bar mr-xs" :title="$t('page.dragsort')" style="cursor:move"></span>
            </td>
            <td class="text-grey overflow" :title="data.label">
              <div class="overflow" :title="data.label">
                {{ data.label }}
              </div>
            </td>
            <td>
              <Checkbox v-model="data.config.isRequired"></Checkbox>
            </td>
            <td>
              <span v-if="data.isExtra" class="tsfont-setting text-action" @click="openAttrConfigDialog(data)"></span>
              <span v-if="source !== 'scene' && data.isExtra" class="ml-xs tsfont-plus-o text-action" @click="addExtraProperty()"></span>
              <span v-if="dataConfig.length > 1 && data.isExtra" class="ml-xs tsfont-close-o text-action" @click="removeExtraProperty(data)"></span>
            </td>
          </tr>
        </draggable>
      </table>
      <div v-if="$utils.isEmpty(dataConfig)" class="margin-sm">
        <span class="text-href tsfont-plus" @click="addExtraProperty()">{{ $t('dialog.title.addtarget',{'target':$t('page.data')}) }}</span>
      </div>
    </div>
    <AttrConfigDialog
      v-if="isAttrConfigDialogShow && currentProperty"
      :formItemList="formItemList"
      :formItemConfig="config"
      :property="currentProperty"
      :isNeedTable="false"
      :isNeedReaction="true"
      @close="closeAttrConfigDialog"
    ></AttrConfigDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    AttrConfigDialog: () => import('./formtableinputer-attr-config-dialog.vue')
  },
  props: {
    config: Object,
    source: {type: String, default: ''},
    formItemList: {type: Array, default: () => []}
  },
  data() {
    return {
      isAttrConfigDialogShow: false,
      currentProperty: null,
      dataConfig: [],
      isValid: true
    };
  },
  beforeCreate() {},
  created() {
    if (this.config.dataConfig) {
      this.dataConfig = this.config.dataConfig;
    }
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
    openAttrConfigDialog(data) {
      this.currentProperty = this.$utils.deepClone(data);
      this.isAttrConfigDialogShow = true;
    },
    //添加扩展属性
    addExtraProperty() {
      this.isValid = true;
      const index = this.dataConfig.filter(d => d.isExtra).length;
      this.dataConfig.push({
        uuid: this.$utils.setUuid(),
        label: this.$t('term.framework.extraattr') + '_' + (index + 1),
        isSearch: false,
        isSearchable: 0,
        handler: 'formtext',
        isExtra: true,
        hasValue: true,
        config: {
          isRequired: true
        }
      });
      this.$emit('setDataConfig', this.dataConfig);
    },
    removeExtraProperty(data) {
      const index = this.dataConfig.findIndex(d => d === data);
      if (index > -1) {
        this.dataConfig.splice(index, 1);
      }
    },
    closeAttrConfigDialog(property) {
      if (property) {
        const index = this.dataConfig.findIndex(d => d.uuid === property.uuid);
        if (index > -1) {
          this.$set(this.dataConfig, index, property);
        }
        this.$emit('setDataConfig', this.dataConfig);
      }
      this.currentProperty = null;
      this.isAttrConfigDialogShow = false;
    },
    valid() {
      let isValid = true;
      if (this.$utils.isEmpty(this.dataConfig)) {
        isValid = false;
      }
      this.isValid = isValid;
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
