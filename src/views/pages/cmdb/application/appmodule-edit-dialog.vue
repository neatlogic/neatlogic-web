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
        :propCiEntityData="ciEntityData"
        :isRequired="1"
        saveMode="emit"
        :hideHeader="true"
        @save="save"
        @cancel="close"
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
    },
    ciEntityData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isLoading: false,
      setting: {
        title: this.ciEntityId ? '编辑应用模块' : '添加应用模块',
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
          this.$emit('close', true, !this.$utils.isEmpty(ciEntityList) ? ciEntityList[0].uuid : '');
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
