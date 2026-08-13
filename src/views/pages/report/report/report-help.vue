<template>
  <div>
    <Collapse v-model="panel" accordion>
      <Panel name="1">
        {{ $t('term.report.datasourceconfigexample') }}
        <div slot="content">
          <div>
            <Tag><strong>&lt;</strong> <i class="text-grey tsfont-arrow-right"></i> <strong>&amp;lt;</strong></Tag>
            <Tag><strong>&gt;</strong> <i class="text-grey tsfont-arrow-right"></i> <strong>&amp;gt;</strong></Tag>
            <Tag><strong>&</strong> <i class="text-grey tsfont-arrow-right"></i> <strong>&amp;amp;</strong></Tag>
            <Tag><strong>"</strong> <i class="text-grey tsfont-arrow-right"></i> <strong>&amp;quot;</strong></Tag>
            <Tag><strong>'</strong> <i class="text-grey tsfont-arrow-right"></i> <strong>&amp;apos;</strong></Tag>
          </div>
          <div>
            <TsCodemirror codeMode="xml" height="auto" :value="datasourceHelp"></TsCodemirror>
          </div>
        </div>
      </Panel>
      <Panel name="2">
        {{ $t('term.report.contentconfigexample') }}
        <div slot="content">
          {{ $t('term.report.contenthelpsupport') }} <b>freemarker</b>{{ $t('term.report.syntaxvia') }}<b>report.xxx</b>{{ $t('term.report.getspecifiedresultset') }}<br>
          {{ $t('term.report.contenthelpexampleprefix') }}<b>${report.userList }</b>{{ $t('term.report.and') }} <b>${report.teamList }</b> {{ $t('term.report.getresultset') }}<br>
          {{ $t('term.report.chartfunctiondesc') }}
          <p>{{ $t('term.report.table') }}:<b>${drawTable(data[{{ $t('term.report.required') }}], config[{{ $t('term.report.optionaljson') }}])}{{ $t('term.report.configexampleprefix') }}</b></p>
          <TsCodemirror codeMode="javascript" height="auto" :value="table.config"></TsCodemirror>
          <p>{{ $t('term.report.chartsetting.barchart') }}:<b>${drawBar(data[{{ $t('term.report.required') }}], config[{{ $t('term.report.optionaljson') }}])}</b>{{ $t('term.report.dataexampleprefix') }}</p>
          <TsCodemirror codeMode="xml" height="auto" :value="barHelp.data"></TsCodemirror>
          <p>{{ $t('term.report.chartsetting.horizontalbarchart') }}:<b>${drawBarH(data[{{ $t('term.report.required') }}], config[{{ $t('term.report.optionaljson') }}])}</b>{{ $t('term.report.dataexampleprefix') }}</p>
          <TsCodemirror codeMode="xml" height="auto" :value="barhHelp.data"></TsCodemirror>
          <p>{{ $t('term.report.stackedchart') }}:<b>${drawStackedBar(data[{{ $t('term.report.required') }}], config[{{ $t('term.report.optionaljson') }}])}</b>{{ $t('term.report.dataexampleprefix') }}</p>
          <TsCodemirror codeMode="xml" height="auto" :value="stackedBar.data"></TsCodemirror>
          <p>{{ $t('term.report.horizontalstackedchart') }}:<b>${drawStackedBarH(data[{{ $t('term.report.required') }}], config[{{ $t('term.report.optionaljson') }}])}</b>{{ $t('term.report.dataexamplerefer') }}<b>{{ $t('term.report.stackedchart') }}</b></p>
          <p>{{ $t('term.report.curvechart') }}:<b>${drawLine(data[{{ $t('term.report.required') }}], config[{{ $t('term.report.optionaljson') }}])}</b>{{ $t('term.report.dataexamplerefer') }}<b>{{ $t('term.report.chartsetting.barchart') }}</b></p>
          <p>{{ $t('term.report.chartsetting.piechart') }}:<b>${drawPie(data[{{ $t('term.report.required') }}], config[{{ $t('term.report.optionaljson') }}])}</b>{{ $t('term.report.dataexampleprefix') }}</p>
          <TsCodemirror codeMode="xml" height="auto" :value="pie.data"></TsCodemirror>
          <p>{{ $t('term.report.configexampleforallcharts') }}</p>
          <TsCodemirror codeMode="javascript" height="auto" :value="barHelp.config"></TsCodemirror>
        </div>
      </Panel>
    </Collapse>
  </div>
</template>
<script>
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
export default {
  name: '',
  components: {
    TsCodemirror
  },
  directives: {
    'highlight': {
      //只能执行一次，绑定inerted事件
      inserted: function(el, binding, vnode) {
        el.innerHTML = el.innerHTML.replace(/\n/g, '<br>');
        el.innerHTML = el.innerHTML.replace(/\s/g, '&nbsp;');
        hljs.highlightBlock(el);
      }
    }
  },
  props: {},
  data() {
    return {
      panel: '1',
      table: {
        config: `{\n
        "title":${this.$t('page.title')},\n
        "header":${this.$t('term.report.describe.headerdescribe')},\n
        "column":${this.$t('term.report.describe.columndescribe')}\n
         }`
      },
      barHelp: {
        data: '<resultMap id="bar">\n' +
          '   <result property="yField"/><!--' + this.$t('term.report.yfieldrequirednumber') + '-->\n' +
          '   <result property="xFiled"/><!--' + this.$t('term.report.xfieldrequired') + '-->\n' +
          '   <result property="groupField"/><!--' + this.$t('term.report.groupfieldbaroptional') + '-->\n' +
          '</resultMap>',
        config: `{\n
           "title": ${this.$t('page.title')},\n
           "xLabel":${this.$t('term.report.axis.xcoordinatetitle')},\n
           "yLabel":${this.$t('term.report.axis.ycoordinatetitle')},\n
           "width":${this.$t('term.report.describe.widthdescribe')},\n
           "height":${this.$t('term.report.describe.heightdescribe')},\n
           "isShowValue":${this.$t('term.report.describe.showvaluedescribe')},\n
           "tick":${this.$t('term.report.describe.tickdescribe')}\n
         }`
      },
      barhHelp: {
        data: '<resultMap id="barh">\n' +
              '   <result property="xField"/><!--' + this.$t('term.report.xfieldrequirednumber') + '-->\n' +
              '   <result property="yFiled"/><!--' + this.$t('term.report.yfieldrequired') + '-->\n' +
              '   <result property="groupField"/><!--' + this.$t('term.report.groupfieldoptional') + '-->\n' +
              '</resultMap>'
      },
      stackedBar: {
        data: '<resultMap id="stacked">\n' +
              '   <result property="groupField"/><!--' + this.$t('term.report.primarycategoryrequired') + '-->\n' +
              '   <collection property="dataList"><!--' + this.$t('term.report.datasetrequired') + '-->\n' +
              '       <result property="typeField"/><!--' + this.$t('term.report.secondarycategoryrequired') + '-->\n' +
              '       <result property="valueField"/><!--' + this.$t('term.report.arrayoptional') + '-->\n' +
              '   </collection>\n' +
              '</resultMap>'
      },
      pie: {
        data: '<resultMap id="pie">\n' +
              '   <result property="typeField"/><!--' + this.$t('term.report.categoryfieldrequired') + '-->\n' +
              '   <result property="valueField"/><!--' + this.$t('term.report.valuefieldrequired') + '-->\n' +
              '</resultMap>'
      },
      datasourceHelp: '<mapper>\n' + 
                  '   <!--' + this.$t('term.report.resultmapdesc') + '-->\n' +
                  '   <!--' + this.$t('term.report.resulttypedesc') + '-->\n' +
                  '   <resultMap id="userMap" resultType="List">\n' +
                  '       <!--' + this.$t('term.report.iddedupdesc') + '-->\n' +
                  '       <id property="userId" />\n' +
                  '       <!--' + this.$t('term.report.resultfieldbinddesc') + '-->\n' +
                  '       <result property="userName" />\n' +
                  '       <!--' + this.$t('term.report.collectionbinddesc') + '-->\n' +
                  '       <collection property="roleList">\n' +
                  '           <result property="roleName" />\n' +
                  '       </collection>\n' +
                  '   </resultMap>\n' +
                  '\n' + 
                  '   <!--' + this.$t('term.report.selectblockdesc') + '-->\n' +
                  '   <!--' + this.$t('term.report.resultmaprequiredattr') + '\n' +
                  '   <!--' + this.$t('term.report.lazyloadselectdesc') + '-->\n' +
                  '   <!--' + this.$t('term.report.timeoutselectdesc') + '-->\n' +
                  '   <select id="userList" resultMap="userMap" lazyload="false" timeout="30">\n' +
                  '       SELECT user_id AS userId, user_name AS userName, c.name AS roleName from user a LEFT JOIN user_role b ON a.uuid = b.user_uuid LEFT JOIN role c ON b.role_uuid = c.uuid\n' +
                  '       WHERE true\n' +
                  '       <if test="userId != null">\n' +
                  '       <!--' + this.$t('term.report.ifdesc') + '-->\n' +
                  '           AND user_id = #{userId}\n' +
                  '       </if>\n' +
                  '       <ifNotNull parameter="userName">\n' +
                  '       <!--' + this.$t('term.report.ifnotnulldesc') + '-->\n' +
                  '           AND user_name = #{userName}\n' +
                  '       </ifNotNull>\n' +
                  '       <ifNull parameter="email">\n' +
                  '       <!--' + this.$t('term.report.ifnulldesc') + '-->\n' +
                  '           AND email = \'xx@xx.com\'\n' +
                  '       </ifNull>\n' +
                  '       <forEach parameter="userIds" separator=",">\n' +
                  '       <!--' + this.$t('term.report.foreachdesc') + '-->\n' +
                  '           AND user_id IN (#{userIds})\n' +
                  '       </forEach>\n' +
                  '   </select>\n' +
                  '\n' +
                  '   <!--' + this.$t('term.report.restblockdesc') + '-->\n' +
                  '   <!--' + this.$t('term.report.urlrequiredattr') + '-->\n' +
                  '   <!--' + this.$t('term.report.lazyloadrestdesc') + '-->\n' +
                  '   <!--' + this.$t('term.report.authtypedesc') + '-->\n' +
                  '   <!--' + this.$t('term.report.timeoutreaddesc') + '-->\n' +
                  '   <!--' + this.$t('term.report.restcontentdesc') + '-->\n' +
                  '   <rest id="restUserList" url="http://xxx.yyy.zzz" lazyload="false" authtype="basic" username="user" password="pwd" timeout="30">\n' +
                  '       <!--' + this.$t('term.report.restsupporttagsprefix') + '<if><ifNull><ifNotNull><forEach>' + this.$t('term.report.restsupporttagssuffix') + '-->\n' +
                  '       {"userId":"#{userId}"}\n' +
                  '   </rest>\n' +
                  '</mapper>'
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
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
