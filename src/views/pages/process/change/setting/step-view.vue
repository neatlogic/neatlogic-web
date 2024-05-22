<template>
  <div class="change-main card-wrapper">
    <div v-for="(cd,index) in changeStepList" :key="index" class="card-list radius-lg">
      <span class="sub-line"></span>
      <div class="card-item  radius-sm bg-grey-hover" :style="{ 'margin-bottom':cd.isShow?'0px':'8px' }">
        <div class="content-block" @click="lookContent(cd)">
          <div class="title-block overflow">
            <div class="text-grey" :title="cd.code">{{ cd.code }}</div>
            <span class="overflow" :title="cd.name">{{ cd.name }}</span>
          </div>
          <div v-if="cd && cd.workerVo" class="work-block">
            <UserCard :uuid="cd.workerVo.uuid" :initType="cd.workerVo.initType"></UserCard>
          </div>
          <div class="data-block">
            <div class="text-grey">{{ $t('term.process.planstartdate') }}{{ cd.parentUuid }}</div>
            <div>
              {{ cd.planStartDate || '-' }}
            </div>
          </div>
          <div class="time-block">
            <div>
              <div class="text-grey">{{ $t('term.process.startTimeWindow') }}</div>
              <div v-if="cd.startTimeWindow || cd.endTimeWindow">
                <span>{{ cd.startTimeWindow }}</span>
                <span>-</span>
                <span>{{ cd.endTimeWindow }}</span>
              </div>
              <div v-else>-</div>
            </div>
          </div>
          <div class="files-block" style="position: relative;">
            <div class="text-grey">{{ $t('page.accessory') }}</div>
            <div v-if="cd.fileIdList && cd.fileIdList.length" class="text-action" @click.stop>
              <Dropdown trigger="click">
                <span>{{ cd.fileIdList.length }}</span>
                <DropdownMenu slot="list" class="dropdown">
                  <DropdownItem v-for="f in cd.fileList" :key="f.id">
                    <span v-download="downurl('/api/binary/file/download',f.id)" class="tsfont-attachment text-action">{{ f.name }}</span>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <span v-else>-</span>
          </div>
        </div>
      </div>
      <div v-if="cd.isShow" class="content-box dividing-color radius-sm">
        <div class="text-grey content-top">
          <ul class="order-tabs-title">
            <li class="active">
              <div class="title-box">
                {{ $t('page.description') }}
              </div>
            </li>
          </ul>
        </div>
        <div v-if="(cd.fileList && cd.fileList.length) || cd.content" class="content-text">
          <div>
            {{ cd.content }}
          </div>
          <div v-if="cd.fileList && cd.fileList.length">
            <div v-for="f in cd.fileList" :key="f.id">
              <span v-download="downurl('/api/binary/file/download',f.id)" class="tsfont-attachment text-action">{{ f.name }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-grey content-text">{{ $t('page.notarget',{target:$t('page.description')}) }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    UserCard: () => import('components/UserCard/UserCard')
  },
  directives: { download },
  filters: {},
  props: {
    changeStepList: Array
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
    lookContent(obj) {
      if (obj.isShow) {
        this.$set(obj, 'isShow', false);
      } else {
        this.$set(obj, 'isShow', true);
      }
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
.card-wrapper {
  //树的样式
  .card-list {
    position: relative;
    .card-top {
      position: relative;
      padding: 0 8px 0;
      .action {
        text-align: center;
      }
    }
    .card-item {
      height: 48px;
      // line-height: 56px;
      padding: 0 18px;
      margin-bottom: 8px;
      &:hover {
        .action {
          display: block;
        }
      }
      .action {
        display: none;
        cursor: pointer;
      }
      .cuont {
        > span {
          margin-left: 5px;
        }
      }
    }
    .move-icon {
      padding-top: 18px;
      display: inline-block;
      .move {
        cursor: move;
      }
    }
    .content-block {
      position: absolute;
      top: 0;
      right: 0;
      width: 99%;
      height: 0px;
      // min-width: 700px;
    }
    .btn-list {
      min-width: 130px;
      padding-top: 18px;
      position: absolute;
      top: 0;
      right: 0;
      .action-group > .action-item:after {
        top: 0;
        bottom: 0;
      }
    }
  }
  .work-block {
    display: inline-block;
    min-width: 48px;
    padding-top: 6px;
    width: 15%;
  }
  .title-block {
    display: inline-block;
    // min-width: 50px;
    // padding-top: 6px;
    width: 20%;
  }
  .data-block {
    display: inline-block;
    // min-width: 70px;
    padding-top: 8px;
    width: 15%;
  }
  .time-block {
    display: inline-block;
    // min-width: 100px;
    padding-top: 8px;
    width: 15%;
  }
  .files-block {
    display: inline-block;
    // min-width: 80px;
    padding-top: 8px;
    width: 10%;
  }
  .content-box {
    width: 100%;
    min-height: 100px;
    // max-height: 260px;
    margin-bottom: 10px;
    border: 1px solid;
    .content-top {
      line-height: 40px;
      font-size: 14px;
      padding: 0 16px;
      .title-box {
        margin: 0;
        margin-right: 16px;
      }
      .active {
        .title-box {
          border-bottom: 2px solid;
          display: inline-block;
          cursor: pointer;
        }
      }
    }
    .content-text {
      padding: 8px 16px;
      max-height: 200px;
      overflow: auto;
      line-height: 24px;
    }
  }
}
</style>
