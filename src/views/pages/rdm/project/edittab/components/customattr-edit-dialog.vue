<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="attrData" :item-list="formConfig">
          <template v-slot:type>
            <TsFormRadio
              v-model="attrData.type"
              :disabled="!!attrId"
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
              :disabledHoverTitle="$t('page.disable')"
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
import * as handlers from '../../attr-config';

export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    ...handlers
  },
  props: {
    appId: { type: Number },
    attrId: { type: Number },
    usedStatKeyList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      handlers: handlers,
      dialogConfig: {
        title: this.attrId ? this.$t('dialog.title.edittarget', {'target': this.$t('term.rdm.customattribute')}) : this.$t('dialog.title.addtarget', {'target': this.$t('term.rdm.customattribute')}),
        width: 'medium',
        type: 'modal',
        maskClose: false,
        isShow: true
      },
      customAttrTypeList: [],
      statAttrTypeList: [],
      attrData: {
        appId: this.appId
      },
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          label: this.$t('page.uniquekey'),
          maxlength: 50,
          validateList: ['required', 'char']
        },
        label: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required']
        },
        type: {
          type: 'slot',
          label: this.$t('page.type')
        },
        config: {
          type: 'slot',
          label: this.$t('page.config'),
          hideLabel: true,
          isHidden: true
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
          falseValue: 0
        },
        isRequired: {
          type: 'switch',
          label: this.$t('page.require'),
          trueValue: 1,
          falseValue: 0
        },
        description: {
          type: 'textarea',
          label: this.$t('page.explain'),
          maxlength: 500
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.attrId) {
      this.getAttrById();
    }
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
        this.$api.rdm.project.saveAppAttr(this.attrData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(res.Return);
          }
        });
      }
    },
    setConfig: function(data) {
      this.attrData.config = data;
    },
    changeAttrType(type) {
      if (this.handlers[type + 'attr']) {
        this.formConfig.config.isHidden = false;
      } else {
        this.formConfig.config.isHidden = true;
      }
      if (this.attrData.statKey && !this.isStatAttrTypeMatched(this.attrData.statKey, type)) {
        this.$delete(this.attrData, 'statKey');
      }
    },
    getAttrById() {
      this.$api.rdm.project.getAttrById(this.attrId).then(res => {
        this.attrData = res.Return;
        this.changeAttrType(this.attrData.type);
      });
    },
    close(attrId) {
      this.$emit('close', attrId);
    },
    listCustomAttrType() {
      this.$api.rdm.project.listCustomAttrType().then(res => {
        this.customAttrTypeList = res.Return;
      });
    },
    listAppStatAttrType() {
      this.$api.rdm.project.listAppStatAttrType({ appId: this.appId }).then(res => {
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
  watch: {}
};
</script>
<style lang="less"></style>
