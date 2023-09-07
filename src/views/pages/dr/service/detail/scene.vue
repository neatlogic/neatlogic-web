<template>
  <div class="scene">
    <TsCard
      v-bind="cardData"
    >
      <template v-slot:firstBtn>
        <div class="add tsfont-plus text-action" @click.stop="addScene">
          {{ $t('page.scene') }}
        </div>
      </template>
      <template slot-scope="{ row }">
        <div class="padding-sm">
          <div class="overflow pb-xs">
            {{ row.name }}
          </div>
          <div class="text-tip overflow pb-xs">
            <span class="pr-sm">数据中心：</span>
            <template v-if="row.sourceName">
              <span>{{ row.sourceName }}</span>
              <span class="tsfont-arrow-right pl-sm pr-sm"></span>
              <span>{{ row.targetName }}</span>
            </template>
            <span v-else>-</span>
          </div>
          <div class="text-tip overflow">
            <span class="pr-sm">自动化编排：</span>
          </div>
        </div>
      </template>
      <template v-slot:control="{ row }">
        <div class="tsfont-edit" @click="editScene(row)">{{ $t('page.edit') }}</div>
        <div class="pl-sm tsfont-trash-o" @click="deleteScene(row)">{{ $t('page.delete') }}</div>
      </template>
    </TsCard>
    <SceneDialog v-if="isShowDialog" @close="closeScene"></SceneDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    SceneDialog: resolve => require(['./dialog/scene-dialog.vue'], resolve)
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
          {name: 's'}
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
    addScene() {
      this.isShowDialog = true;
    },
    editScene(row) {
      this.sceneConfig = row;
      this.isShowDialog = true;
    },
    deleteScene(row) {
      if (row.referenceCount) {
        return;
      }
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.scene')}),
        btnType: 'error',
        'on-ok': vnode => {
          // this.$api.dr.scene.deleteScene({id: row.id}).then(res => {
          //   if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          this.$emit('update');
          //     vnode.isShow = false;
          //   }
          // });
        }
      });
    },
    closeScene() {
      this.isShowDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.scene {
  /deep/.tscard-body {
    height: 100px !important;
  }
}
.add {
  text-align: center;
  line-height: 88px;
}
</style>
