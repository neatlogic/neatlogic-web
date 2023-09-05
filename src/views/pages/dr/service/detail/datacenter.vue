<template>
  <div class="datacenter">
    <TsCard v-bind="cardData">
      <template v-slot:firstBtn>
        <div class="add tsfont-plus text-action card-height" @click.stop="addData">
          数据中心
        </div>
      </template>
      <template slot-scope="{ row }">
        <div class="padding-sm card-height">
          <div class="overflow pb-xs text-title">
            {{ row.name }}
          </div>
        </div>
      </template>
      <template v-slot:control="{ row }">
        <div class="tsfont-edit" @click="editData(row)">{{ $t('page.edit') }}</div>
        <div class="pl-sm tsfont-trash-o" @click="deleteData(row)">{{ $t('page.delete') }}</div>
      </template>
    </TsCard>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve)
  },
  props: {},
  data() {
    return {
      cardData: {
        sm: 12,
        lg: 8,
        xl: 6,
        xxl: 4,
        headerPosition: 'right',
        padding: false,
        boxShadow: false,
        firstBtn: true,
        tbodyList: [
          {
            name: '主中心'
          }
        ]
      },
      sceneConfig: {},
      isShowDialog: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addData() {
      this.isShowDialog = true;
    },
    editData(row) {
      this.sceneConfig = row;
      this.isShowDialog = true;
    },
    deleteData(row) {
      if (row.referenceCount) {
        return;
      }
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.scene')}),
        btnType: 'error',
        'on-ok': vnode => {
          // this.$api.dr.scene.deleteData({id: row.id}).then(res => {
          //   if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          this.$emit('update');
          //     vnode.isShow = false;
          //   }
          // });
        }
      });
    },
    closeData() {
      this.isShowDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.card-height {
  height: 46px;
}
.add {
  text-align: center;
  line-height: 46px;
}
</style>
