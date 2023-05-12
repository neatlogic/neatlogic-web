
<template>
  <div>
    <div class="version-top border-color">
      <div>{{ $t('page.newtarget', {target: $t('page.versions')}) }}</div>
      <div class="action-group no-line version-btn">
        <span
          v-for="operate in operateList"
          :key="operate.value"
          class="action-item btn-icon"
          :class="operate.icon"
          @click.stop="doAction(operate.value)"
        >{{ operate.text }}</span>
      </div>
    </div>
    <div>
      <VersionEdit
        ref="versionEdit"
        :typeList="typeList"
        :config="versionVo"
        :isEdit="true"
      ></VersionEdit>
    </div>
    <!--校验 -->
    <VersionValid v-model="validVisible" :validList="validList"></VersionValid>
    <!-- 提交审核 -->
    <ReviewDialog
      :id="config.id"
      :isShow.sync="isReviewShow"
      :versionId="versionId"
      :type="userType"
      @updateData="updateData"
    ></ReviewDialog>
  </div>
</template>
<script>
import VersionEdit from './version-edit.vue';
export default {
  name: '',
  components: {
    VersionEdit,
    VersionValid: resolve => require(['./version-valid'], resolve),
    ReviewDialog: resolve => require(['../edit/review-dialog.vue'], resolve)
  },
  filters: {
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    typeList: Array,
    config: Object,
    defaultVersionVo: Object
  },
  data() {
    return {
      operateList: [
        {
          text: this.$t('page.validate'),
          value: 'validate',
          icon: 'tsfont-check'
        },
        {
          text: this.$t('page.save'),
          value: 'save',
          icon: 'tsfont-save'
        },
        {
          text: this.$t('page.submit'),
          value: 'submit',
          icon: 'tsfont-check-o'
        }
      ],
      versionVo: null,
      validVisible: false, //校验列表是否显示
      validList: [{text: '', type: '', config: {}}], //校验产生的数据列表
      versionId: null,
      isReviewShow: false,
      userType: 'submit' //审核人权限
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
    doAction(methods) {
      this[methods]();
    },
    async validate() {
      this.validVisible = true;
      let valid = true;
      let validList = await this.$refs.versionEdit.valid();
      if (validList.length > 0) {
        valid = false;
        this.validList = validList;
      } else {
        this.validList = [];
        this.validList.push({text: this.$t('term.autoexec.scriptvalidsuccess'), type: 'success'});
      }
      return valid;
    },
    async save() { //新增保存
      let isValid = await this.validate();
      if (!isValid) {
        return;
      }
      let data = {
        id: this.config.id,
        name: this.config.name,
        execMode: this.config.execMode,
        typeId: this.config.typeId,
        riskId: this.config.riskId,
        ...this.$refs.versionEdit.save()
      };
      this.$api.autoexec.script.saveScript(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('updateData', res.Return.versionId);
        }
      });
    },
    async submit() {
      let isValid = await this.validate();
      if (!isValid) {
        return;
      }
      let data = {
        id: this.config.id,
        name: this.config.name,
        execMode: this.config.execMode,
        typeId: this.config.typeId,
        riskId: this.config.riskId,
        ...this.$refs.versionEdit.save()
      };
      let res = await this.$api.autoexec.script.saveScript(data);
      this.$Message.success(this.$t('message.commitsuccess'));
      let config = res.Return;
      this.versionId = config.versionId;
      let isReviewable = config.isReviewable;
      if (isReviewable == 1) {
        this.userType = 'review';
      } else {
        this.userType = 'submit';
      }
      await this.$api.autoexec.script.submitScript({ versionId: this.versionId});
      this.isReviewShow = true;
    },
    updateData(id) {
      this.$emit('updateData', id);
    }
  },
  computed: {
  
  },
  watch: {
    defaultVersionVo: {
      handler(val) {
        this.versionVo = this.$utils.deepClone(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
