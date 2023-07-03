<template>
  <div>
    <TsContain>
      <!--<template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>-->
      <template v-slot:topLeft>
        <AppTab v-if="projectId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:content>
        <h2>{{ projectData.name }}</h2>
        <div class="mt-md mb-md text-grey">{{ projectData.description }}</div>
        <div>
          <div><h3 class="text-grey">{{ $t('term.rdm.projectmember') }}</h3></div>
        </div>
        <div class="mt-md mb-md bg-op radius-md padding">
          <div
            v-for="(user, index) in projectData.userList"
            :key="index"
            class="mr-md"
            style="display: inline-block; text-align: center"
          >
            <div><UserCard
              alignMode="vertical"
              :uuid="user.userId"
              :hideAvatar="false"
              :iconSize="32"
            ></UserCard></div>
            <div v-if="user.userTypeList && user.userTypeList.length > 0" class="text-grey">
              {{ user.userTypeList[0].userTypeName }}
            </div>
          </div>
        </div>
        <h3 class="text-grey">{{ $t('page.activity') }}</h3>
        <div class="mt-md mb-md bg-op radius-md padding">
          <div class="mb-md">
            <ButtonGroup v-model="groupBy" size="small">
              <Button :type="groupBy === 'day' ? 'info' : 'default'" @click="groupBy = 'day'">{{ $t('page.day') }}</Button>
              <Button :type="groupBy === 'month' ? 'info' : 'default'" @click="groupBy = 'month'">{{ $t('page.month') }}</Button>
            </ButtonGroup>
          </div>
          <div v-if="groupBy === 'day'">
            <div v-for="(day, index) in dayList" :key="index" class="dateblock">
              <div class="squareblock" style="height: 50px">
                <div
                  v-for="hour in day.hourList"
                  :key="hour"
                  class="square"
                  :class="getIssueCount(day.day, hour) > 0 ? 'bg-primary' : 'bg-grey'"
                  :style="getIssueStyle(day.day, hour)"
                ></div>
              </div>
              <div style="text-align: center" class="text-grey fz10">{{ day.day }}</div>
            </div>
          </div>
          <div v-else-if="groupBy === 'month'">
            <div v-for="(month, index) in monthList" :key="index" class="dateblock">
              <div class="squareblock" style="height: 75px">
                <div
                  v-for="day in month.dayList"
                  :key="day"
                  class="square"
                  :class="getIssueCount(month.month, day) > 0 ? 'bg-primary' : 'bg-grey'"
                  :style="getIssueStyle(month.month, day)"
                ></div>
              </div>
              <div style="text-align: center" class="text-grey fz10">{{ month.month }}</div>
            </div>
          </div>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    AppTab: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-tab.vue'], resolve)
  },
  props: {},
  data() {
    return {
      projectId: null,
      groupBy: 'day',
      projectData: {},
      issueCountList: [],
      isUserAddShow: false
    };
  },
  beforeCreate() {},
  created() {
    this.projectId = Math.floor(this.$route.params['projectId']);
    this.getProjectById();
    this.getIssueCountByProjectId();
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
    getProjectById() {
      this.$api.rdm.project.getProjectById(this.projectId).then(res => {
        this.projectData = res.Return;
        document.title = this.projectData.name;
        this.$route.meta.title = this.projectData.name;
      });
    },
    getIssueCountByProjectId() {
      if (this.projectId) {
        this.$api.rdm.issue.getIssueCountByProjectId(this.projectId, this.groupBy).then(res => {
          this.issueCountList = res.Return;
        });
      }
    },
    getIssueStyle(part1, part2) {
      const count = this.getIssueCount(part1, part2);
      if (count > 0) {
        const opacity = Math.min((count % 5) * 0.1 + 0.3, 1);
        return { opacity: opacity };
      }
      return null;
    },
    getIssueCount(part1, part2) {
      if (this.issueCountList && this.issueCountList.length > 0) {
        const d = this.issueCountList.find(d => d.date == part1 + ' ' + part2);
        if (d) {
          return d.count;
        }
      }
      return 0;
    }
  },
  filter: {},
  computed: {
    monthList() {
      const today = new Date();
      const result = [];
      const monthbefore = 12;
      for (let i = monthbefore - 1; i >= 0; i--) {
        let year, month;
        if (today.getMonth() - i <= 0) {
          // 如果跨年
          year = today.getFullYear() - 1;
          month = 12 + (today.getMonth() - i);
        } else {
          year = today.getFullYear();
          month = today.getMonth() - i;
        }
        const date = new Date(year, month + 1, 0);

        const monthString = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0');
        const dayList = [...Array(date.getDate()).keys()]
          .map(day => (day + 1).toString().padStart(2, '0'))
          .filter(day => {
            if (year === today.getFullYear() && month === today.getMonth()) {
              return day <= today.getDate();
            } else {
              return true;
            }
          });

        result.push({ month: monthString, dayList: dayList });
      }

      return result;
    },
    dayList() {
      let dateList = [];
      let now = new Date();
      // 循环计算过去15天的日期数据
      const daybefore = 15;
      for (let i = daybefore - 1; i >= 0; i--) {
        let timestamp = now.getTime() - i * 24 * 60 * 60 * 1000;

        let date = new Date(timestamp);

        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        let hourList = [];

        // 如果是当天，则只取当前时间之前的小时数
        if (i === 0) {
          let currentHour = now.getHours() + 1;
          hourList = Array.from({ length: currentHour }, (_, i) => i);
        } else {
          hourList = Array.from({ length: 24 }, (_, i) => i);
        }

        dateList.push({ day: `${month}-${day}`, hourList });
      }
      return dateList;
    }
  },
  watch: {
    groupBy: {
      handler: function() {
        this.getIssueCountByProjectId();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50% 50%;
}
.dateblock {
  display: inline-block;
  vertical-align: top;
  width: 75px;
  .squareblock {
    .square {
      float: left;
      width: 10px;
      height: 10px;
      margin: 1px;
    }
  }
}
</style>
