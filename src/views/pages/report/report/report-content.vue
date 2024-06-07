<template>
  <div>
    <Alert show-icon>
      <div>
        <Poptip
          v-model="isHelpShow"
          trigger="hover"
          placement="right"
          width="700"
          :transfer="true"
          :title="$t('term.report.dataSourceconfigexample')"
        >
          <a href="javascript:void(0)">{{ $t('term.report.datasourceconfigexample') }}</a>
          <div slot="content" style="height:600px;">
            <div>
              <Tag>
                <strong>&lt;</strong>
                <i class="text-grey tsfont-arrow-right"></i>
                <strong>&amp;lt;</strong>
              </Tag>
              <Tag>
                <strong>&gt;</strong>
                <i class="text-grey tsfont-arrow-right"></i>
                <strong>&amp;gt;</strong>
              </Tag>
              <Tag>
                <strong>&</strong>
                <i class="text-grey tsfont-arrow-right"></i>
                <strong>&amp;amp;</strong>
              </Tag>
              <Tag>
                <strong>"</strong>
                <i class="text-grey tsfont-arrow-right"></i>
                <strong>&amp;quot;</strong>
              </Tag>
              <Tag>
                <strong>'</strong>
                <i class="text-grey tsfont-arrow-right"></i>
                <strong>&amp;apos;</strong>
              </Tag>
            </div>
            <TsCodemirror
              ref="datasourceHelp"
              :value="datasourceHelp"
              codeMode="xml"
              :isReadOnly="true"
            ></TsCodemirror>
          </div>
        </Poptip>
      </div>
    </Alert>
    <div v-if="reportData.paramList && reportData.paramList.length > 0">
      <i
        v-for="(param, index) in reportData.paramList"
        :key="index"
        v-clipboard="param.name"
        v-clipboard:success="clipboardSuc"
        class="ivu-tag ivu-tag-size-default ivu-tag-default ivu-tag-checked"
      >{{ param.label }}({{ param.name }})</i>
    </div>
    <div><TsCodemirror codeMode="xml" :value.sync="sql" height="500px"></TsCodemirror></div>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
export default {
  name: '',
  components: {
    TsCodemirror
  },
  directives: { clipboard },
  props: {
    reportData: { type: Object }
  },
  data() {
    return {
      isHelpShow: false,
      sql: this.reportData.sql,
      datasourceHelp: 
        `<mapper>	
          <resultMap id="dataMap" type="java.util.LinkedHashMap">
            <id column="id" property="${this.$t('term.report.taskid')}"/>
            <result column="title" property="${this.$t('page.title')}"/>
            <result column="status" property="${this.$t('page.status')}"/>
            <result column="start_time" property="${this.$t('page.reportingtime')}"/>
            <result column="end_time" property="${this.$t('page.completetime')}"/>
            <result column="owner" property="${this.$t('page.informant')}"/>
            <result column="serial_number" property="${this.$t('page.workordernumber')}"/>
            <collection property="stepList" javaType="java.util.List" ofType="java.util.LinkedHashMap">
              <id column="stepId" property="${this.$t('term.report.stepid')}"/>
              <result column="name" property="${this.$t('term.report.stepname')}"/>
            </collection>
          </resultMap>
          <select id="getProcessTaskList" resultMap="dataMap">
            SELECT 
              a.id,
              a.title,
              a.status,
              a.start_time,
              a.end_time,
              a.owner,
              a.serial_number,
              b.id AS stepId,
              b.name
            FROM processtask a
            JOIN processtask_step b
            <where> 
              <if test="keyword != null and keyword != ''">
                AND a.title LIKE CONCAT('%',#{keyword},'%')
              </if>
              <if test="statusList != null and statusList.size() > 0">
                AND a.status IN 
                <foreach collection="statusList" item="status" open="(" separator="," close=")">
                  #{status}
                </foreach>
              </if>
              <if test="startTimeRange != null and startTimeRange.size() > 1">
                AND a.start_time &gt;= startTimeRange[0] AND a.start_time &lt;= startTimeRange[1]
              </if>
            </where> 
          </select>
        </mapper>`
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
    clipboardSuc: function() {
      this.$Message.success(this.$t('message.copysuccess'));
    }
  },
  filter: {},
  computed: {},
  watch: {
    isHelpShow: {
      handler: function(val) {
        if (val) {
          this.$nextTick(() => {
            const editor = this.$refs['datasourceHelp'];
            editor && editor.refresh();
          });
        }
      }
    },
    sql: {
      handler: function(val) {
        this.$emit('setSql', val);
      }
    },
    reportData: {
      handler: function(val) {
        if (val) {
          this.sql = val.sql;
        } else {
          this.sql = '';
        }
      }
    }
  }
};
</script>
<style lang="less"></style>
