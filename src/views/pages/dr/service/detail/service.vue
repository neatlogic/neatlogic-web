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
          <div class="overflow pb-xs from-name flex-between">
            <span>{{ row.dependencyServiceName }}</span>
            <span>{{ row.serviceName }}</span>
          </div>
          <div v-for="(item,index) in row.config.sceneList" :key="index" class="from-name text-tip overflow">
            <span class="pr-sm">{{ item.sourceSceneId==-1?'默认':item.sourceSceneName }}</span>
            <span class="pl-sm pr-sm from-icon border-dashed"></span>
            <span class="tsfont-right text-dividing"></span>
            <span>{{ item.targetSceneName }}</span>
          </div>
        </div>
      </template>
      <template v-if="!readonly" v-slot:control="{ row,index }">
        <div class="tsfont-edit" @click="editService(row,index)">{{ $t('page.edit') }}</div>
        <div class="pl-sm tsfont-trash-o" @click="deleteServiceRelationship(row,index)">{{ $t('page.delete') }}</div>
      </template>
    </TsCard>
    <ServiceDialog
      v-if="isShowDialog"
      :serviceId="serviceId"
      :currService="currService"
      :currSceneList="sceneList"
      @close="closeService"
    ></ServiceDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    ServiceDialog: resolve => require(['./service-dialog.vue'], resolve)
  },
  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    serviceId: {
      type: Number
    },
    list: {
      type: Array,
      default: () => []
    },
    sceneList: {
      type: Array,
      default: () => []
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
        firstBtn: !this.readonly,
        tbodyList: []
      },
      currService: {},
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
      this.type = 'add';
      this.isShowDialog = true;
    },
    editService(row, index) {
      this.type = 'edit';
      this.editIndex = index;
      this.currService = row;
      this.isShowDialog = true;
    },
    deleteServiceRelationship(row, index) {
      if (row.referenceCount) {
        return;
      }
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {'target': row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.dr.service.deleteServiceRelationship({
            serviceId: row.serviceId,
            dependencyServiceId: row.id
          }).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.cardData.tbodyList.splice(index, 1);
              this.$emit('update');
              vnode.isShow = false;
            }
          });
        }
      });
    },
    closeService(isUpdate, data) {
      this.currService = {};
      if (isUpdate) {
        if (this.type === 'add') {
          this.cardData.tbodyList.push(data);
        } else { 
          this.cardData.tbodyList.splice(this.editIndex, 1, data);
        }
        this.$emit('updateServiceList', this.cardData.tbodyList);
        this.$emit('editService', data);
      }
      this.isShowDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {
    list: {
      handler(val) {
        this.cardData.tbodyList = this.$utils.deepClone(val) || [];
      },
      deep: true,
      immediate: true
    }
  }
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
