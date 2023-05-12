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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    ...handlers
  },
  props: {
    appId: { type: Number },
    attrId: { type: Number }
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
