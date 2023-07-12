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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    ...handlers
  },
  props: {
    attrData: { type: Object }
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
    changeAttrType(type) {
      if (this.handlers[type + 'attr']) {
        this.formConfig.config.isHidden = false;
      } else {
        this.formConfig.config.isHidden = true;
      }
    },
    close() {
      this.$emit('close');
    },
    listCustomAttrType() {
      this.$api.rdm.project.listCustomAttrType().then(res => {
        this.customAttrTypeList = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less"></style>
