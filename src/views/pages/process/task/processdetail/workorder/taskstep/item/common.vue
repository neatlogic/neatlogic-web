<template>
  <div>
    <div class="step-userimg">
      <UserCard
        v-if="item.majorUser"
        v-bind="item.majorUser.userVo"
        hideName
        :iconSize="24"
      ></UserCard>
    </div>
    <div class="auditList-content">
      <div v-if="item.majorUser">
        <UserCard v-bind="item.majorUser.userVo" class="text-primary text-padding-rg" hideAvatar></UserCard>
      </div>
      <div class="time-block">
        <TsRow>
          <Col span="6">
            <div class="time-start dividing-color">
              <span class="text-grey">{{ $t('page.activationtime') }}</span>
              <div class="time-date overflow">
                <span v-if="item.activeTime" :title="item.activeTime | formatDate">
                  {{ item.activeTime | formatDate }}
                </span>
                <span v-else>-</span>
              </div>
            </div>
          </Col>
          <Col span="6">
            <div class="time-start dividing-color">
              <span class="text-grey">{{ $t('page.starttime') }}</span>
              <div class="time-date overflow">
                <span v-if="item.startTime" :title="item.startTime | formatDate">
                  {{ item.startTime | formatDate }}
                </span>
                <span v-else>-</span>
              </div>
            </div>
          </Col>
          <Col span="6">
            <div>
              <span class="text-grey">{{ $t('page.endtime') }}</span>
              <div class="time-date overflow">
                <span v-if="item.endTime" :title="item.endTime | formatDate">
                  {{ item.endTime | formatDate }}
                </span>
                <span v-else>-</span>
              </div>
            </div>
          </Col>
          <Col v-if="item.handler =='event' && item.handlerStepInfo" span="6">
            <div>
              <span class="text-grey">{{ $t('term.process.archivedtype') }}</span>
              <div class="time-date">
                {{ item.handlerStepInfo.eventTypeNamePath || '-' }}
              </div>
            </div>
          </Col>
        </TsRow>
      </div>
    </div>
    <div v-if="item.commentList && item.commentList.length > 0">
      <div v-for="(stepItem, stepIndex) in item.commentList" :key="stepIndex" class="step-auditList">
        <div class="step-userimg">
          <UserCard v-bind="stepItem.fcuVo" :iconSize="24" hideName></UserCard>
        </div>
        <div class="auditList-content">
          <div class="tag-bubble bg-grey padding-tag">
            <div class="tag-arrow">
              <em></em>
            </div>
            <div>
              <UserCard v-bind="stepItem.fcuVo" class="user-name" hideAvatar></UserCard>
              <span class="text-grey">{{ stepItem.fcd | formatDate }}</span>
            </div>
            <div v-html="stepItem.content"></div>
            <div v-if="stepItem.fileList && stepItem.fileList.length > 0">
              <TsRow>
                <Col v-for="(file, flindex) in stepItem.fileList" :key="flindex" span="12">
                  <div v-download="downurl('/api/binary/file/download',file.id)" class="file-list-down text-action">
                    <span class="tsfont-attachment text-grey">{{ file.name }}</span>
                    <i class="tsfont-download  text-padding"></i>
                  </div>
                </Col>
              </TsRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
import UserCard from '@/resources/components/UserCard/UserCard.vue';

export default {
  name: '',
  components: {
    UserCard
  },
  directives: { download },
  filters: {},
  props: {
    item: Object
  },
  data() {
    return {
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
  methods: {},
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    }
  },
  watch: {}

};

</script>
<style lang='less'>

</style>
