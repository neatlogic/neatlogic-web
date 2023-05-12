<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <Row class="mb-md" :gutter="8">
            <Col span="8"></Col>
            <Col span="8">
              <TsFormDatePicker 
                v-model="dateTimeRange"
                :placeholder="$t('page.plantime')"
                format="yyyy-MM-dd HH:mm:ss"
                type="datetimerange"
                border="border"
                @on-change="changeDateTimeRange"
              ></TsFormDatePicker>
            </Col>
            <Col span="8">
              <InputSearcher v-model="searchParam.keyword"></InputSearcher>
            </Col>
          </Row>
        </div>
        <div>
          <JobList :params="searchParam"></JobList>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    JobList: resolve => require(['pages/autoexec/manage/job/job-list.vue'], resolve)
  },
  props: {
    id: {
      type: Number
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        title: this.$t('term.inspect.jobexerecord'),
        hasFooter: false,
        maskClose: true,
        isShow: true,
        width: 'large'
      },
      dateTimeRange: [],
      searchParam: {
        scheduleId: this.id,
        keyword: '',
        startTime: {},
        sourceList: ['scheduleinspectapp']

      }
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
    close() {
      this.$emit('close');
    },
    changeDateTimeRange() {
      if (this.dateTimeRange instanceof Array) {
        if (this.dateTimeRange.length > 1) {
          this.searchParam.startTime = {
            startTime: this.dateTimeRange[0],
            endTime: this.dateTimeRange[1]
          };
        }
      } else {
        this.searchParam.startTime = {};
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
