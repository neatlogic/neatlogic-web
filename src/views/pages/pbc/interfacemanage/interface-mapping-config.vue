<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>高级配置</div>
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
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    PropertyHandler: resolve => require(['../property/property-handler.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
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
          label: '默认值',
          desc: '当属性为空时使用此值代替'
        },
        transferRule: {
          type: 'textarea',
          name: 'transferRule',
          label: '值转换',
          desc: '格式：原值:新值，多个配置用逗号分割'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.prop.propDefaultValue = this.property.propDefaultValue;
    this.prop.transferRule = this.property.transferRule;
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
