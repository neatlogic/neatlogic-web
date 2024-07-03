<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>{{ $t('page.advanceconfig') }}</div>
      </template>
      <template v-slot>
        <TsForm
          ref="form"
          v-model="prop"
          :labelWidth="80"
          :item-list="formConfig"
        >
          <template v-slot:propDefaultValue>
            <PropertyHandler
              ref="propertyHandler"
              :value="prop.propDefaultValue"
              :property="property"
              @setData="setData"
            ></PropertyHandler>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    PropertyHandler: () => import('../property/property-handler.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    property: { type: Object }
  },
  data() {
    return {
      prop: {},
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: {
        propDefaultValue: {
          type: 'slot',
          name: 'propDefaultValue',
          label: this.$t('page.defaultvalue'),
          desc: this.$t('term.pbc.defaultvaluedesc')
        },
        transferRule: {
          type: 'textarea',
          name: 'transferRule',
          label: this.$t('page.valueconvert'),
          desc: this.$t('term.pbc.convertvaluedesc')
        },
        transferToMd5: {
          type: 'switch',
          name: 'transferToMd5',
          label: '散列处理',
          desc: '勾选此开关把任意值转换成32位字符串的散列值'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.prop.propDefaultValue = this.property.propDefaultValue;
    this.prop.transferRule = this.property.transferRule;
    this.prop.transferToMd5 = this.property.transferToMd5;
  },
  beforeMount() {},
  mounted() {

  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setData(property, index, value) {
      this.prop.propDefaultValue = value;
    },
    close() {
      this.$emit('close');
    },
    save() {
      this.prop.uid = this.property.uid;
      this.$emit('close', this.prop);
    }
  },
  filter: {},
  computed: { },
  watch: {}
};
</script>
<style lang="less"></style>
