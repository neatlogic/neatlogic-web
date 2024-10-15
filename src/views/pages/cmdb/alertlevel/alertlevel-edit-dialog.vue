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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        title:
          this.id == null
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
          validateList: ['required'],
          desc: '全局唯一'
        },
        {
          name: 'name',
          type: 'text',
          //readonly: !!this.id,
          label: this.$t('page.uniquekey'),
          maxlength: 50,
          validateList: ['required', 'enchar']
        },
        {
          name: 'type',
          type: 'radio',
          label: '类型',
          //readonly: !!this.id,
          dataList: [
            { value: 'inspect', text: '巡检状态' },
            { value: 'monitor', text: '监控状态' }
          ],
          validateList: ['required'],
          desc: '同一类型下唯一标识不能重复'
        },
        {
          name: 'label',
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 100,
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
      if (this.id) {
        this.$api.cmdb.cientity.getAlertLevelById(this.id).then(res => {
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
