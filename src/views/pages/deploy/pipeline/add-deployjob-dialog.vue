<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <AddDeployJobForm
          :id="id"
          ref="form"
          class="mt-nm"
        >
        </AddDeployJobForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :loading="saveLoading" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AddDeployJobForm: () => import('../pipeline/add-deployjob-form.vue')
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium',
        title: this.$t('term.deploy.addbatchjob')
      },
      saveLoading: false
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
    save() {
      const form = this.$refs['form'];
      if (form.validateForm()) {
        this.saveLoading = true;
        form.submitForm().then(() => {
          this.close();
        }).finally(() => {
          this.saveLoading = false;
        });
      }
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 10px;
}
</style>
