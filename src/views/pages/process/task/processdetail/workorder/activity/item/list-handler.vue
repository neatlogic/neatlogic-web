<template>
  <div>
    <div v-for="(sub, subIndex) in setData(config.newContent)" :key="subIndex" class="active-form-list">
      <div v-if="sub.type == 'content'" class="active-form-text">
        <span class="left-label-text text-grey">{{ sub.typeName }}</span>
        <TsRow>
          <Col v-if="sub.oldContent" :span="sub.newContent && sub.oldContent ? '10' : '24'" style="overflow: auto;">
            <div style="overflow: auto;" v-html="sub.oldContent"></div>
          </Col>
          <Col v-if="sub.newContent && sub.oldContent" span="2">
            <span class="change-text text-grey">{{ $t('term.process.changeto') }}</span>
          </Col>
          <Col v-if="sub.newContent" :span="sub.newContent && sub.oldContent ? '10' : '24'">
            <div style="overflow: auto;" v-html="sub.newContent"></div>
          </Col>
        </TsRow>
      </div>
      <div v-else-if="sub.type == 'targetTime'" class="active-form-text">
        <span class="left-label-text text-grey">{{ sub.typeName }}</span>
        <span v-if="sub.oldContent">{{ sub.oldContent | formatDate }}</span>
        <span v-if="sub.newContent && sub.oldContent" class="change-text text-grey">{{ $t('term.process.changeto') }}</span>
        <span v-if="sub.newContent">{{ sub.newContent | formatDate }}</span>
      </div>
      <div v-else-if="sub.type == 'planStartEndTime'" class="active-form-text">
        <span class="left-label-text text-grey">{{ sub.typeName }}</span>
        <span v-if="sub.oldContent">
          <TsFormDatePicker
            :value="sub.oldContent"
            width="100%"
            type="datetimerange"
            :readonly="true"
          ></TsFormDatePicker>
        </span>
        <span v-if="sub.newContent && sub.oldContent" class="change-text text-grey">{{ $t('term.process.changeto') }}</span>
        <span v-if="sub.newContent">
          <TsFormDatePicker
            :value="sub.newContent"
            width="100%"
            type="datetimerange"
            :readonly="true"
          ></TsFormDatePicker>
        </span>
      </div>
      <div v-else-if="sub.type == 'fileList'" class="active-form-text">
        <span class="left-label-text text-grey">{{ sub.typeName }}</span>
        <div v-if="sub.oldContent">
          <div v-for="(file, flindex) in sub.oldContent" :key="flindex" class="file-list-down">
            <span v-download="downurl('/api/binary/file/download',file.id)" class="tsfont-attachment text-action">
              {{ file.name }}
              <i class="tsfont-download"></i>
            </span>
          </div>
        </div>
        <div v-if="sub.newContent && sub.oldContent" class="change-text text-grey">{{ $t('term.process.changeto') }}</div>
        <div v-if="sub.newContent">
          <div v-for="(file, flindex) in sub.newContent" :key="flindex" class="file-list-down">
            <span v-download="downurl('/api/binary/file/download',file.id)" class="tsfont-attachment text-action">
              {{ file.name }}
              <i class="tsfont-download "></i>
            </span>
          </div>
        </div>
      </div>
      <div v-else-if="sub.type == 'worker'" class="active-form-text">
        <span class="left-label-text text-grey">{{ sub.typeName }}</span>
        <span v-if="sub.oldContent">
          <UserCard
            v-bind="sub.oldContent"
            hideAvatar
            style="display: inline-block;"
          ></UserCard>
        </span>
        <span v-if="sub.newContent && sub.oldContent" class="text-grey change-text">{{ $t('term.process.changeto') }}</span>
        <span v-if="sub.newContent">
          <UserCard
            v-bind="sub.newContent"
            hideAvatar
          ></UserCard>
        </span>
      </div>
      <div v-else class="active-form-text">
        <span class="left-label-text text-grey">{{ sub.typeName }}</span>
        <span v-if="sub.oldContent">{{ sub.oldContent }}</span>
        <span v-if="sub.newContent && sub.oldContent" class="change-text text-grey">{{ $t('term.process.changeto') }}</span>
        <span v-if="sub.newContent">{{ sub.newContent }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
export default {
  name: '',
  components: {
    TsFormDatePicker,
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  directives: { download },
  filters: {},
  props: {
    config: Object
  },
  data() {
    return {};
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
    setData(str) {
      let data = JSON.parse(str);
      return data;
    }
  },
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
<style lang='less' scoped>
.active-form-list {
  line-height: 24px;
  .open-formlist {
    padding-left: 24px;
  }

  .show-form {
    display: block;
    word-break: break-word;
  }

  .hide-form {
    display: none;
  }
  .active-form-text {
    display: flex;
  }
}
</style>
