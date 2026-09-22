<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <AuthSettingForm v-model="authList" :scope="authScope"></AuthSettingForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'CiAuthEdit',
  components: {
    AuthSettingForm: () => import('./auth-setting-form.vue')
  },
  props: {
    ciId: {
      type: Number
    }
  },
  data() {
    return {
      authList: [],
      ciData: null,
      authScope: 'ci',
      dialogConfig: {
        type: 'modal',
        title: this.$t('dialog.title.authsetting'),
        maskClose: false,
        isShow: true,
        width: 'medium'
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getCiById();
    this.getAuthData();
  },
  beforeMount() {},
  mounted() {

  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getCiById() {
      if (this.ciId) {
        this.$api.cmdb.ci.getCiById(this.ciId).then(res => {
          this.ciData = res.Return;
          if (this.ciData.isVirtual) {
            this.authScope = 'vci';
          }
        });
      }
    },
    getAuthData: function() {
      if (this.ciId) {
        this.$api.cmdb.ci.getCiAuthByCiId(this.ciId).then(res => {
          this.authList = res.Return;
        });
      }
    },
    save: function() {
      this.$api.cmdb.ci.saveCiAuth({ ciId: this.ciId, authList: this.authList }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close();
        }
      });
    },
    close: function() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
