<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <div>{{ $t('dialog.content.deleteconfirm', { target: $t('term.cmdb.selectedcientity') }) }}</div>
          <Divider />
          <div>
            <TsFormInput v-model="description" type="textarea" maxlength="500"></TsFormInput>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button
          v-if="allowDelete"
          class="ml-md"
          type="error"
          :loading="loading"
          ghost
          @click="deleteCiEntity(false, 'del')"
        >{{ $t('page.delete') }}</Button>
        <Button
          v-if="allowDelete"
          class="ml-md"
          :loading="allLoading"
          type="error"
          @click="deleteCiEntity(true, 'delCi')"
        >{{ $t('page.deleteandcommit') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: { TsFormInput },
  props: {
    allowDelete: { type: Boolean, default: false },
    allowCommit: { type: Boolean, default: false },
    ciEntityList: { type: Array, default: () => [] },
    ciEntityId: { type: Number, default: null }
  },
  data() {
    return {
      loading: false,
      allLoading: false,
      dialogConfig: {
        title: this.$t('dialog.title.deleteconfirm'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      description: ''
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
    deleteCiEntity(allowCommit, index) {
      if (index == 'del') {
        this.loading = true;
      } else {
        this.allLoading = true;
      }
      if (this.ciEntityList && this.ciEntityList.length > 0) {
        this.$api.cmdb.cientity.batchDeleteCiEntity(this.ciEntityList, allowCommit, this.description).then(res => {
          this.loading = false;
          this.allLoading = false;
          if (res.Status == 'OK') {
            if (allowCommit) {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.close(true);
            } else {
              this.$Message.success(this.$t('message.executesuccess'));
              this.close();
            }
          }
        });
      } else if (this.ciEntityId) {
        this.$api.cmdb.cientity.deleteCiEntityById(this.ciEntityId, allowCommit, this.description).then(res => {
          this.allLoading = false;
          this.loading = false;
          if (res.Status == 'OK') {
            if (allowCommit) {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.close(true);
            } else {
              this.$Message.success(this.$t('message.executesuccess'));
              this.close();
            }
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
