<template>
  <div>
    <div v-for="(webhook, index) in webhookDataList" :key="index">
      <div v-if="webhook.event === 'Push Hook' && webhook.data.commits && webhook.data.commits.length > 0">
        <div v-for="(commit, cindex) in webhook.data.commits" :key="cindex" class="padding-sm mb-sm radius-sm bg-grey">
          <div class="mb-sm">
            <a :href="commit.url" target="_blank">{{ commit.message }}</a>
          </div>
          <div class="mb-sm fz10">
            <span class="mr-xs text-grey">{{ $t('page.committime') }}</span>
            <span class="mr-sm">{{ commit.timestamp | formatDate }}</span>
            <span class="mr-xs text-grey">{{ $t('page.presenter') }}</span>
            <span class="mr-sm">{{ commit.author.name }}</span>
            <span class="mr-xs text-grey">{{ $t('term.framework.pkgversion') }}</span>
            <span class="mr-sm">{{ commit.id }}</span>
          </div>
          <div v-if="commit.added && commit.added.length > 0" class="mb-sm fz10">
            <div v-for="(added, aindex) in commit.added" :key="aindex">
              <span class="tsfont-plus text-grey mr-lg">A</span>
              <span>{{ added }}</span>
            </div>
          </div>
          <div v-if="commit.modified && commit.modified.length > 0" class="mb-sm fz10">
            <div v-for="(modified, mindex) in commit.modified" :key="mindex">
              <span class="tsfont-edit text-grey mr-lg">M</span>
              <span>{{ modified }}</span>
            </div>
          </div>
          <div v-if="commit.removed && commit.removed.length > 0" class="fz10">
            <div v-for="(removed, rindex) in commit.removed" :key="rindex">
              <span class="tsfont-minus text-grey mr-lg">D</span>
              <span>{{ removed }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    issueId: { type: Number },
    appId: { type: Number }
  },
  data() {
    return {
      webhookDataList: []
    };
  },
  beforeCreate() {},
  created() {
    this.searchWebhookData();
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
    searchWebhookData() {
      this.$api.rdm.webhook.searchWebhookData(this.issueId, this.appId).then(res => {
        this.webhookDataList = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
