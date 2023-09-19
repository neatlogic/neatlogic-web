<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <div class="flex-between mb-nm">
      <div>
        <span
          v-for="(item, index) in sortList"
          :key="index"
          class="mr-nm cursor-pointer"
          :class="[item.value == sortValue ? 'text-href' : '', getSortIcon(item.value)]"
          @click.stop="changeSort(item)"
        >{{ item.text }}</span>
      </div>
      <div class="flex-start">
        <TsFormDatePicker
          v-model="dateValue"
          type="datetimerange"
          :transfer="true"
          format="yyyy-MM-dd"
          @on-change="() => searchSqlUpdateData"
        ></TsFormDatePicker>
        <div class="action-group">
          <span class="action-item ml-nm">
            <Button icon="ios-search" type="primary" @click="searchSqlUpdateData">{{ $t('page.search') }}</Button>
          </span>
          <span class="action-item">
            <Button
              v-download="exportSql"
              :loading="donwloadLoading"
              icon="md-cloud-download"
              type="default"
            >{{ $t('page.export') }}</Button> 
          </span>
        </div>
      </div>
    </div>
    <NoData v-if="$utils.isEmpty(timeLineList)"></NoData>
    <Timeline v-else style="margin-left: 100px;margin-top: 30px;">
      <TimelineItem v-for="(item, index) of timeLineList" :key="index">
        <span slot="dot" :class="index == isActive ? 'tsfont-check-s text-success' : 'tsfont-circle'"></span>
        <div>
          <span class="timeline-left-text">{{ item.text }}</span>
          <div class="bg-grey padding ml-nm" style="margin-top: -16px;">
            <div class="flex-between cursor-pointer" @click.stop="expandContent(index)">
              <span>{{ item.text }}</span>
              <span :class="index == isActive ? 'tsfont-up' : 'tsfont-down'"></span>
            </div>
            <div v-if="index == isActive" class="mt-nm">{{ item.value }}</div>
          </div>
        </div>
      </TimelineItem>
    </Timeline>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
  },
  directives: { download },
  props: {},
  data() {
    return {
      isActive: -1,
      loadingShow: false,
      donwloadLoading: false,
      dateValue: '',
      sortValue: 'descendingOrder',
      sortList: [
        {
          text: this.$t('page.descendingorder'),
          value: 'descendingOrder'
        },
        {
          text: this.$t('page.ascendingorder'),
          value: 'ascendingOrder'
        }
      ],
      timeLineList: [
        {
          text: '2023-01-18',
          value: '唐太宗李世民（599年1月23日—649年7月10日），祖籍陇西成纪（今甘肃秦安），一说陇西狄道（今甘肃省临洮县）人，又说钜鹿郡人。唐朝第二位皇帝（626年9月3日 [194] —649年7月10日 [140] 在位），政治家、战略家、军事家、书法家、诗人。 [142]李世民少年从军，曾往雁门关解救隋炀帝。首倡晋阳起兵，拜右领军大都督，受封敦煌郡公，领兵攻破长安，拜尚书令、光禄大夫，受封秦国公、赵国公。唐朝建立后，领兵平定薛仁杲、刘武周、窦建德、王世充、刘黑闼等割据势力，为唐朝的建立与统一立下赫赫战功，拜天策上将，封秦王。武德九年六月初四日（626年7月2日），发动“玄武门之变”，杀死太子李建成和齐王李元吉，被册立为皇太子。八月初九日，唐高祖李渊退位，李世民即皇帝位，年号贞观。在位初期，听取群臣意见，虚心纳谏。对内文治天下，厉行节约，劝课农桑，实现休养生息、国泰民安，开创“贞观之治”。对外开疆拓土，攻灭东突厥与薛延陀，征服高昌、龟兹和吐谷浑，重创高句丽。设立安西四镇，与北方地区各民族融洽相处，获得尊号“天可汗”，为唐朝后来一百多年的盛世局面奠定重要基础。贞观二十三年五月己巳日（649年7月10日 [140] ），李世民驾崩于含风殿，享年五十二岁，在位二十三年，庙号太宗，谥号文皇帝（后加谥文武大圣大广孝皇帝），葬于昭陵。他爱好文学与书法，有诗作与墨宝传世。 [140-141]'
        },
        {
          text: '2023-01-17',
          value: '武曌[zhào] [1] （624年－705年12月16日），一般被称为武则天，并州文水（今山西省文水县）人。唐朝至武周时期政治家，武周开国君主（690年10月16日 [171] －705年2月23日在位 [222] ）。荆州都督武士彟次女。 [162]武则天十四岁入后宫，为唐太宗的才人。太宗死后，入感业寺为尼。唐高宗即位后，被召回宫中，封昭仪。永徽六年（655年），在“废王立武”事件后成为皇后。上元元年（674年），加号“天后”，与高宗并成为“二圣”，参预朝政。高宗去世后，武则天以皇太后身份，在唐中宗李显、唐睿宗李旦朝临朝称制。天授元年（690年），武则天自称“圣神皇帝”，改国号为周，建立武周，定都洛阳。当朝期间，贬逐老臣，任用酷吏，滥杀无辜 [181] ，同时举行殿试，创武举、自举、试官等制；经济上采用取薄赋敛、息干戈、省力役等主张；军事上收复安西四镇，平定营州之乱，一度使后突厥归降。晚年逐渐豪奢专断，渐生弊政。神龙元年（705年），宰相张柬之等发动“神龙革命”，拥立中宗复辟，迫使病重的武则天退位，并为其上尊号“则天大圣皇帝”。同年十一月，武则天于上阳宫崩逝，享年八十二岁。中宗遵其遗命，改称“则天大圣皇后”，以皇后身份入葬乾陵。其后累谥为“则天顺圣皇后”。 [162-163]武则天前后当政四十余年，是中国历史上唯一的女皇帝 [173] 。她所开创的时代，上承贞观之治，下启开元盛世，被认为是走向盛唐的重要环节 [164] 。她多智略，兼涉文史，颇有诗才。著有《垂拱集》《金轮集》等，今已佚 [162] 。'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchSqlUpdateData();
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
    searchSqlUpdateData() {
      this.loadingShow = true;
      this.$api.framework.module.searchSqlUpdateData({order: this.sortValue, time: this.dateValue}).then(res => {
        if (res.Status == 'OK') {
          this.timeLineList = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changeSort(item) {
      this.sortValue = item.value;
      this.searchSqlUpdateData();
    },
    expandContent(index) {
      this.isActive = index == this.isActive ? -1 : index;
    }
  },
  filter: {},
  computed: {
    getSortIcon() {
      return (value) => {
        const obj = {
          ascendingOrder: 'tsfont-arrow-up',
          descendingOrder: 'tsfont-arrow-down'
        };
        return obj[value];
      };
    },
    exportSql() {
      return {
        url: '/api/binary/autoexec/script/version/export',
        method: 'post',
        params: {},
        changeStatus: status => {
          if (status == 'start') {
            this.donwloadLoading = true;
          } else if (status == 'success' || status == 'error') {
            this.donwloadLoading = false;
          }
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
/deep/ .ivu-timeline-item-head-custom {
  font-size: 22px;
}
.timeline-left-text {
  position: absolute;
  top: 0;
  left: -100px;
  width: 80px;
}
</style>
