<template>
  <TsDialog
    :title="$t('dialog.title.choosetarget', { target: $t('page.icon') })"
    width="medium"
    type="modal"
    :isShow="true"
    @on-close="close"
  >
    <template v-slot>
      <TsRow>
        <Col
          v-for="(item, index) in iconList"
          :key="index"
          :span="3"
          class="icon-item text-action border-color"
          :class="item == selectedIcon ? 'text-primary' : ''"
        >
          <i
            :class="item"
            style="font-size:25px"
            aria-hidden="true"
            @click="selectIcon(item)"
          ></i>
        </Col>
      </TsRow>
    </template>
    <template v-slot:footer>
      <Button @click="close">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="confirm">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {},
  props: { currentIcon: { type: String } },
  data() {
    return {
      iconList: [],
      selectedIcon: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getIconList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getIconList: function() {
      this.$api.common.getIconList({ type: ['cmdb'] }).then(res => {
        if (res.Status == 'OK') {
          this.iconList = res.Return;
        }
      });
    },
    selectIcon(icon) {
      this.selectedIcon = icon;
    },
    close() {
      this.$emit('cancel');
    },
    confirm() {
      this.$emit('confirm', this.selectedIcon);
    }
  },
  filter: {},
  computed: {},
  watch: {
    currentIcon: {
      handler: function(val) {
        this.selectedIcon = val;
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scope>
.icon-item {
  cursor: pointer;
}
</style>
