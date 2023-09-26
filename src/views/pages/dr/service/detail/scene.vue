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
            {{ row.sceneName }}
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
            <span class="pr-sm">自动化编排：{{ row.combopName }}</span>
          </div>
        </div>
      </template>
      <template v-slot:control="{ row,index }">
        <div class="tsfont-edit" @click="editScene(row, index)">{{ $t('page.edit') }}</div>
        <div class="pl-sm tsfont-trash-o" @click="deleteScene(row,index)">{{ $t('page.delete') }}</div>
      </template>
    </TsCard>
    <SceneDialog v-if="isShowDialog" :defaultSceneData="sceneConfig" @close="closeScene"></SceneDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    SceneDialog: resolve => require(['./scene-dialog.vue'], resolve)
  },
  props: {
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
        firstBtn: true,
        tbodyList: []
      },
      sceneConfig: {},
      isShowDialog: false,
      editIndex: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (!this.$utils.isEmpty(this.sceneList)) {
        this.cardData.tbodyList = this.sceneList;
      }
    },
    addScene() {
      this.type = 'add';
      this.isShowDialog = true;
    },
    editScene(row, index) {
      this.type = 'edit';
      this.editIndex = index;
      this.sceneConfig = row;
      this.isShowDialog = true;
    },
    deleteScene(row, index) {
      if (row.referenceCount) {
        return;
      }
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.scene')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$emit('deleteScene', row);
          this.cardData.tbodyList.splice(index, 1);
          vnode.isShow = false;
          this.$emit('updateSceneList', this.cardData.tbodyList);
        }
      });
    },
    closeScene(isUpdate, data) {
      this.sceneConfig = {};
      if (isUpdate) {
        if (this.type === 'add') {
          this.cardData.tbodyList.push(data);
        } else { 
          this.cardData.tbodyList.splice(this.editIndex, 1, data);
        }
        this.$emit('updateSceneList', this.cardData.tbodyList);
        this.$emit('editScene', data);
      }
      this.isShowDialog = false;
    },
    getData() {
      return this.cardData.tbodyList;
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
