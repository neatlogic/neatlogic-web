<template>
  <TsDialog v-bind="dialogConfig" @close="close">
    <template v-slot>
      <TsForm ref="form" :item-list="formConfig">
        <template v-slot:color>
          <ColorPicker
            v-model="statusDataLocal.color"
            :transfer="true"
            recommend
            class="colorPicker"
            transfer-class-name="color-picker-transfer-class"
            @on-change="
              val => {
                $set(statusDataLocal, 'color', val);
              }
            "
          />
        </template>
      </TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    statusData: {
      type: Object
    }
  },
  data() {
    return {
      statusDataLocal: {},
      dialogConfig: {
        title: this.statusData.uuid ? this.$t('dialog.title.edittarget', { target: this.$t('page.attribute') }) : this.$t('dialog.title.addtarget', { target: this.$t('page.attribute') }),
        isShow: true,
        width: 'small',
        type: 'modal',
        maskClose: false
      },
      formConfig: {
        name: {
          type: 'text',
          value: this.statusData.name,
          label: this.$t('page.uniquekey'),
          validateList: ['required', 'char'],
          onChange: val => {
            this.$set(this.statusDataLocal, 'name', val);
          }
        },
        label: {
          type: 'text',
          value: this.statusData.label,
          label: this.$t('page.name'),
          validateList: ['required'],
          onChange: val => {
            this.$set(this.statusDataLocal, 'label', val);
          }
        },
        color: {
          type: 'slot',
          label: this.$t('page.color')
        },
        description: {
          type: 'textarea',
          value: this.statusData.description,
          label: this.$t('page.description'),
          onChange: val => {
            this.$set(this.statusDataLocal, 'description', val);
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.statusDataLocal = this.$utils.deepClone(this.statusData);
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
    close() {
      this.$emit('close');
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        if (!this.statusDataLocal.uuid) {
          this.statusDataLocal.uuid = this.$utils.setUuid();
        }
        this.$emit('close', this.statusDataLocal);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
