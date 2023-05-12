<template>
  <TsDialog v-bind="setting" :isShow="true" @on-close="close">
    <div>
      <Loading
        v-if="isLoading"
        :text="$t('page.datasaving')"
        :loadingShow="isLoading"
        type="fix"
      ></Loading>
      <EditCiEntity
        ref="editContainer"
        mode="dialog"
        :propCiId="ciId"
        :propCiEntityId="ciEntityId"
        :isForm="isForm"
        saveMode="emit"
        :hideHeader="true"
        @save="save"
      ></EditCiEntity>
    </div>
  </TsDialog>
</template>
<script>
import EditCiEntity from '@/views/pages/cmdb/cientity/cientity-edit.vue';
export default {
  name: '',
  components: {
    EditCiEntity
  },
  filters: {},
  props: {
    ciId: {
      type: Number
    },
    ciEntityId: {
      type: Number
    }
  },
  data() {
    return {
      isLoading: false,
      isForm: true,
      setting: {
        title: this.ciEntityId ? this.$t('dialog.title.edittarget', {'target': this.$t('page.apply')}) : this.$t('dialog.title.addtarget', {'target': this.$t('page.apply')}),
        maskClose: false,
        width: 'large',
        hasFooter: false
      }
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    save(ciEntityList) {
      this.isLoading = true;
      this.$api.cmdb.cientity.batchSaveCiEntity({ciEntityList: ciEntityList, needCommit: true}).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', true, !this.$utils.isEmpty(ciEntityList) ? ciEntityList[(ciEntityList.length - 1)].uuid : ''); // uuid 用于刷新数据
        }
      }).finally(() => {
        this.isLoading = false;
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
