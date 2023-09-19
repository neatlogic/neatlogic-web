<template>
  <div class="datacenter">
    <TsCard v-bind="cardData">
      <template v-slot:firstBtn>
        <div class="add tsfont-plus text-action" @click.stop="addData">
          数据中心
        </div>
      </template>
      <template slot-scope="{ row }">
        <div class="padding-sm">
          <div class="overflow pb-xs">
            {{ row.name }}
          </div>
          <div class="pb-sm ">
            <Divider orientation="start"><div class="text-title">实例</div></Divider>
            <div>
              <Tag type="border">测试</Tag>
            </div>
          </div>
          <div class="pb-sm">
            <Divider orientation="start"><div class="text-title">公共服务</div></Divider>
            <div>
              <Tag type="border">测试</Tag>
            </div>
          </div>
          <div class="pb-sm">
            <Divider orientation="start"><div class="text-title">自定义参数</div></Divider>
            <div>
              <Tag type="border">测试</Tag>
            </div>
          </div>
          <div>
            <Divider orientation="start"><div class="text-title">HA场景</div></Divider>
            <div>
              <Tag type="border">测试</Tag>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:control="{ row }">
        <div class="tsfont-edit" @click="editData(row)">{{ $t('page.edit') }}</div>
        <div class="pl-sm tsfont-trash-o" @click="deleteData(row)">{{ $t('page.delete') }}</div>
      </template>
    </TsCard>
    <TsDialog
      title="编辑"
      type="slider"
      :isShow.sync="isShowDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <DatacenterEdit></DatacenterEdit>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    DatacenterEdit: resolve => require(['./datacenter-edit.vue'], resolve)
  },
  props: {
    
  },
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
    closeDialog() {
      this.isShowDialog = false;
    },
    okDialog() {
      this.closeDialog();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.datacenter {
  /deep/.tscard-body {
    height: 360px !important;
  }
  .add {
    text-align: center;
    line-height: 360px;
  }
}
</style>
