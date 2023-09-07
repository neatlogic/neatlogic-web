<template>
  <div class="service">
    <TsCard
      v-bind="cardData"
    >
      <template v-slot:firstBtn>
        <div class="add tsfont-plus text-action" @click.stop="addService">
          依赖应用
        </div>
      </template>
      <template slot-scope="{ row }">
        <div class="padding-sm">
          <div class="overflow pb-xs">
            {{ row.name }}
          </div>
          <div v-for="(item,index) in row.list" :key="index" class="from-name text-tip overflow">
            <span class="pr-sm">{{ item.sourceName }}</span>
            <span class="pl-sm pr-sm from-icon border-dashed"></span>
            <span class="tsfont-right text-dividing"></span>
            <span>{{ item.targetName }}</span>
          </div>
        </div>
      </template>
      <template v-slot:control="{ row }">
        <div class="tsfont-edit" @click="editService(row)">{{ $t('page.edit') }}</div>
        <div class="pl-sm tsfont-trash-o" @click="deleteService(row)">{{ $t('page.delete') }}</div>
      </template>
    </TsCard>
    <ServiceDialog v-if="isShowDialog" @close="closeService"></ServiceDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    ServiceDialog: resolve => require(['./dialog/service-dialog.vue'], resolve)
  },
  props: {
    firstBtn: {
      type: Boolean,
      default: false
    }
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
        firstBtn: this.firstBtn,
        tbodyList: [
          {
            name: 's',
            list: [
              {
                sourceName: '主中心',
                targetName: '同城中心'
              },
              {
                sourceName: '主中心',
                targetName: '同城中心'
              },
              {
                sourceName: '主中心',
                targetName: '同城中心'
              },
              {
                sourceName: '主中心',
                targetName: '同城中心'
              }
            ]
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
    addService() {
      this.isShowDialog = true;
    },
    editService(row) {
      this.sceneConfig = row;
      this.isShowDialog = true;
    },
    deleteService(row) {
      if (row.referenceCount) {
        return;
      }
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.scene')}),
        btnType: 'error',
        'on-ok': vnode => {
          // this.$api.dr.scene.deleteService({id: row.id}).then(res => {
          //   if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          this.$emit('update');
          //     vnode.isShow = false;
          //   }
          // });
        }
      });
    },
    closeService() {
      this.isShowDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.service {
  /deep/.tscard-body {
    height: 158px !important;
  }
  .from-name {
    display: flex;
    align-items: center;
    &:not(:last-child){
      padding-bottom: 10px;
    }
  }
  .from-icon {
    flex: 1;
  }
  .add {
    text-align: center;
    line-height: 146px;
  }
}

</style>
