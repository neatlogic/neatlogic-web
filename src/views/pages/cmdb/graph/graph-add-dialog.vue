<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="graphData" :item-list="formConfig">
            <template v-slot:icon>
              <div class="logo bg-block border-color text-primary" @click="isIconDialogShow = true">
                <i class="logo-icon" :class="graphData.icon || 'tsfont-question-o'"></i>
              </div>
            </template>
          </TsForm>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
    <IconDialog
      v-if="isIconDialogShow"
      :currentIcon="graphData.icon"
      @cancel="isIconDialogShow = false"
      @confirm="
        icon => {
          $set(graphData, 'icon', icon);
          isIconDialogShow = false;
        }
      "
    ></IconDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    IconDialog: () => import('@/views/pages/common/icon-dialog.vue')
  },
  props: {
    type: { type: String }
  },
  data() {
    return {
      graphData: {
        type: this.type,
        isActive: 1,
        icon: 'tsfont-question-o',
        config: {}
      },
      isIconDialogShow: false,
      dialogConfig: {
        title: this.$t('dialog.title.newgraph'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: [
        {
          name: 'name',
          label: this.$t('page.name'),
          type: 'text',
          validateList: [{ name: 'required' }]
        },
        {
          name: 'icon',
          label: this.$t('page.icon'),
          type: 'slot'
        }
      ]
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
    close(graphData) {
      this.$emit('close', graphData);
    },
    save() {
      if (this.$refs['form'].valid()) {
        this.$api.cmdb.graph.saveGraph(this.graphData).then(res => {
          if (res.Return) {
            this.$Message.success(this.$t('message.addsuccess'));
            // 刷新左侧菜单
            this.$store.commit('leftMenu/setCmdbCustomViewCount', 'add');
            this.close(res.Return);
            //this.$router.push({ path: '/graph-edit/' + type + '/' + res.Return.id });
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.logo {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: inline-block;
  position: relative;
  border: 1px solid;
  top: -5px;
  text-align: center;
  line-height: 40px;
  .logo-icon {
    font-size: 20px;
    // position: absolute;
    // top: 4px;
    // left: 10px;
  }
  &::after {
    content: '更换';
    left: 44px;
    width: 40px;
    position: absolute;
    top: 2px;
  }
}
</style>
