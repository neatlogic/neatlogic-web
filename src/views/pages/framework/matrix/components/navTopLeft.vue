<template>
  <div>
    <span v-if="readonly">{{ matrixName }}</span>
    <TsFormInput
      v-else
      ref="matrixNameInput"
      v-model="matrixName"
      :placeholder="$t('form.placeholder.pleaseinput',{'target':$t('page.matrixname')})"
      :class="{ 'tsForm-formItem-error': !matrixName }"
      style="width: 280px;display:inline-block"
      maxlength="50"
      :validateList="nameValidateList"
      @on-blur="saveMatrixName(matrixName)"
    ></TsFormInput>
    <span class="text-grey ml-nm">{{ matrixLabel }}</span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue')
  },
  filters: {},
  props: {
    matrixUuid: String,
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      initMatrixName: '', //初始化矩阵名
      matrixName: '',
      matrixLabel: '', //唯一值
      nameValidateList: ['required', {
        name: 'searchUrl',
        url: 'api/rest/matrix/save',
        message: this.$t('message.targetisexists', {'target': this.$t('page.matrixname')}),
        key: 'name',
        params: () => ({uuid: this.matrixUuid})
      }]
    };
  },
  beforeCreate() {},
  created() {
    this.getMatrix();
  },
  beforeMount() {},
  mounted() { },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getMatrix() {
      this.$api.framework.matrix
        .getExternalConfig({ uuid: this.matrixUuid })
        .then(res => {
          if (res.Status == 'OK') {
            this.matrixName = res.Return.name;
            this.matrixLabel = res.Return.label;
          }
        })
        .catch(error => {
          this.$Message.error(error.data.Message);
        });
    },
    saveMatrixName(val) {
      if (val == this.initMatrixName || !val) {
        return;
      }
      this.$api.framework.matrix
        .editMatrixName({ name: this.matrixName, uuid: this.matrixUuid })
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.initMatrixName = this.matrixName;
          }
        })
        .catch(error => {
          this.$Message.error(error.data.Message);
        });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style scoped lang="less">

</style>
