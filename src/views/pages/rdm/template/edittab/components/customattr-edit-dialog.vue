<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="form" :item-list="formConfig">
          <template v-slot:type>
            <TsFormRadio
              v-model="attrData.type"
              :dataList="customAttrTypeList"
              :validateList="['required']"
              @on-change="changeAttrType"
            ></TsFormRadio>
          </template>
          <template v-slot:config>
            <div v-if="handlers[attrData.type + 'attr']" class="ivu-form-item">
              <component
                :is="attrData.type + 'attr'"
                ref="handlerConfig"
                :config="attrData.config"
                @setConfig="setConfig"
              ></component>
            </div>
          </template>
          <template v-slot:statKey>
            <TsFormSelect
              v-model="attrData.statKey"
              :dataList="finalStatAttrTypeList"
              valueName="value"
              textName="text"
            ></TsFormSelect>
          </template>
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import * as handlers from '@/views/pages/rdm/project/attr-config/index.js';

export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    ...handlers
  },
  props: {
    attrData: { type: Object },
    appType: { type: String },
    usedStatKeyList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      handlers: handlers,
      dialogConfig: {
        title: !this.$utils.isEmpty(this.attrData) ? this.$t('dialog.title.edittarget', { target: this.$t('term.rdm.customattribute') }) : this.$t('dialog.title.addtarget', { target: this.$t('term.rdm.customattribute') }),
        width: 'medium',
        type: 'modal',
        maskClose: false,
        isShow: true
      },
      customAttrTypeList: [],
      statAttrTypeList: [],
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('page.uniquekey'),
          maxlength: 50,
          value: this.attrData.name,
          validateList: ['required', 'char'],
          onChange: val => {
            this.$set(this.attrData, 'name', val);
          }
        },
        label: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          value: this.attrData.label,
          validateList: ['required'],
          onChange: val => {
            this.$set(this.attrData, 'label', val);
          }
        },
        type: {
          type: 'slot',
          label: this.$t('page.type')
        },
        config: {
          type: 'slot',
          label: this.$t('page.config'),
          hideLabel: true,
          isHidden: !handlers[this.attrData.type + 'attr']
        },
        statKey: {
          type: 'slot',
          label: this.$t('term.rdm.statpurpose'),
          isHidden: true
        },
        isActive: {
          type: 'switch',
          label: this.$t('page.enable'),
          trueValue: 1,
          falseValue: 0,
          value: this.attrData.isActive,
          onChange: val => {
            this.$set(this.attrData, 'isActive', val);
          }
        },
        isRequired: {
          type: 'switch',
          label: this.$t('page.require'),
          trueValue: 1,
          falseValue: 0,
          value: this.attrData.isRequired,
          onChange: val => {
            this.$set(this.attrData, 'isRequired', val);
          }
        },
        description: {
          type: 'textarea',
          label: this.$t('page.explain'),
          maxlength: 500,
          value: this.attrData.description,
          onChange: val => {
            this.$set(this.attrData, 'description', val);
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.listCustomAttrType();
    this.listAppStatAttrType();
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
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        if (!this.attrData.uuid) {
          this.attrData.uuid = this.$utils.setUuid();
        }
        this.$emit('close', this.attrData);
      }
    },
    setConfig: function(data) {
      this.$set(this.attrData, 'config', data);
    },
    changeAttrType(type, item) {
      if (this.handlers[type + 'attr']) {
        this.formConfig.config.isHidden = false;
      } else {
        this.formConfig.config.isHidden = true;
      }
      if (this.attrData.statKey && !this.isStatAttrTypeMatched(this.attrData.statKey, type)) {
        this.$delete(this.attrData, 'statKey');
      }
      if (item) {
        this.attrData.typeText = item.text;
      }
    },
    close() {
      this.$emit('close');
    },
    listCustomAttrType() {
      this.$api.rdm.project.listCustomAttrType().then(res => {
        this.customAttrTypeList = res.Return;
      });
    },
    listAppStatAttrType() {
      this.$api.rdm.project.listAppStatAttrType({ appType: this.appType }).then(res => {
        this.statAttrTypeList = res.Return || [];
        this.formConfig.statKey.isHidden = this.statAttrTypeList.length === 0;
      });
    },
    isStatAttrTypeMatched(statKey, attrType) {
      const statAttrType = this.statAttrTypeList.find(item => item.value === statKey);
      if (!statAttrType || !statAttrType.attrTypeList || !attrType) {
        return true;
      }
      return statAttrType.attrTypeList.includes(attrType);
    }
  },
  filter: {},
  computed: {
    finalStatAttrTypeList() {
      return this.statAttrTypeList.map(item => {
        const data = this.$utils.deepClone(item);
        if (this.usedStatKeyList.includes(item.value) && this.attrData.statKey !== item.value) {
          this.$set(data, '_disabled', this.$t('term.rdm.boundbyotherattr'));
        } else if (!this.isStatAttrTypeMatched(item.value, this.attrData.type)) {
          this.$set(data, '_disabled', this.$t('term.rdm.statpurposenotsupported'));
        }
        return data;
      });
    }
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
