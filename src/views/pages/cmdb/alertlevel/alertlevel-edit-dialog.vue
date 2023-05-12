<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsForm ref="form" v-model="alertLevelData" :item-list="formConfig">
        <template v-slot:color>
          <ColorPicker
            :transfer="true"
            recommend
            :value="alertLevelData.color"
            class="colorPicker"
            transfer-class-name="color-picker-transfer-class"
            @on-change="
              val => {
                $set(alertLevelData, 'color', val);
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
    level: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        title:
          this.level == null
            ? this.$t('dialog.title.addtarget', {
              target: this.$t('term.cmdb.alertlevel')
            })
            : this.$t('dialog.title.edittarget', {
              target: this.$t('term.cmdb.alertlevel')
            }),
        width: 'small'
      },
      alertLevelData: {},
      formConfig: [
        {
          name: 'level',
          type: 'number',
          min: 1,
          label: this.$t('page.level'),
          validateList: ['required']
        },
        {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          validateList: ['required']
        },
        {
          name: 'color',
          type: 'slot',
          label: this.$t('page.color')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getAlertLevel();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getAlertLevel() {
      if (this.level) {
        this.$api.cmdb.cientity.getAlertLevel(this.level).then(res => {
          this.alertLevelData = res.Return;
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      if (this.$refs['form'].valid()) {
        this.$api.cmdb.cientity.saveAlertLevel(this.alertLevelData).then(res => {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
