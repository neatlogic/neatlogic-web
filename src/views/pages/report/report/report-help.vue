<template>
  <div>
    <Collapse v-model="panel" accordion>
      <Panel name="1">
        {{ $t('term.report.datasourceconfigexample') }}
        <div slot="content">
          <div>
            <Tag><strong>&lt;</strong> <i class="text-grey ts-long-arrow-right"></i> <strong>&amp;lt;</strong></Tag>
            <Tag><strong>&gt;</strong> <i class="text-grey ts-long-arrow-right"></i> <strong>&amp;gt;</strong></Tag>
            <Tag><strong>&</strong> <i class="text-grey ts-long-arrow-right"></i> <strong>&amp;amp;</strong></Tag>
            <Tag><strong>"</strong> <i class="text-grey ts-long-arrow-right"></i> <strong>&amp;quot;</strong></Tag>
            <Tag><strong>'</strong> <i class="text-grey ts-long-arrow-right"></i> <strong>&amp;apos;</strong></Tag>
          </div>
          <div>
            <!-- <div v-highlight>{{ datasourceHelp }}</div>-->
            <TsCodemirror codeMode="xml" height="auto" :value="datasourceHelp"></TsCodemirror>
          </div>
        </div>
      </Panel>
      <Panel name="2">
        {{ $t('term.report.contentconfigexample') }}
        <div slot="content">
          <!-- <div v-highlight>{{ contentHelp }}</div>-->
          内容配置支持<b>freemarker</b>语法，通过<b>report.xxx</b>获取指定结果集。<br>
          例如：数据源配置中包含id="userList"的select节点和id="teamList"的rest节点，则可通过<b>${report.userList }</b>和 <b>${report.teamList }</b> 获取结果集。<br>
          除自行填写freemarker模板外，系统提供了以下图表函数，帮助快速生成简单图表
          <p>表格：<b>${drawTable(data[必须], config[可选，json格式])}，config范例：</b></p>
          <TsCodemirror codeMode="javascript" height="auto" :value="table.config"></TsCodemirror>
          <p>柱状图：<b>${drawBar(data[必须], config[可选，json格式])}</b>，data范例：</p>
          <TsCodemirror codeMode="xml" height="auto" :value="barHelp.data"></TsCodemirror>
          <p>横向柱状图：<b>${drawBarH(data[必须], config[可选，json格式])}</b>，data范例：</p>
          <TsCodemirror codeMode="xml" height="auto" :value="barhHelp.data"></TsCodemirror>
          <p>堆积图：<b>${drawStackedBar(data[必须], config[可选，json格式])}</b>，data范例：</p>
          <TsCodemirror codeMode="xml" height="auto" :value="stackedBar.data"></TsCodemirror>
          <p>横向堆积图：<b>${drawStackedBarH(data[必须], config[可选，json格式])}</b>，data范例请参考<b>堆积图</b></p>
          <p>曲线图：<b>${drawLine(data[必须], config[可选，json格式])}</b>，data范例请参考<b>柱状图</b></p>
          <p>饼图：<b>${drawPie(data[必须], config[可选，json格式])}</b>，data范例：</p>
          <TsCodemirror codeMode="xml" height="auto" :value="pie.data"></TsCodemirror>
          <p>config范例，适用于以上所有图表：</p>
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
          '   <result property="yField"/><!--Y坐标列，必须是数值，必须存在-->\n' +
          '   <result property="xFiled"/><!--X坐标列，必须存在-->\n' +
          '   <result property="groupField"/><!--分组列，柱状图选择存在，曲线图必须存在-->\n' +
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
              '   <result property="xField"/><!--X坐标列，必须是数值，必须存在-->\n' +
              '   <result property="yFiled"/><!--Y坐标列，必须存在-->\n' +
              '   <result property="groupField"/><!--分组列，选择存在-->\n' +
              '</resultMap>'
      },
      stackedBar: {
        data: '<resultMap id="stacked">\n' +
              '   <result property="groupField"/><!--一级分类，必须存在-->\n' +
              '   <collection property="dataList"><!--数据集，必须存在-->\n' +
              '       <result property="typeField"/><!--二级分类，必须存在-->\n' +
              '       <result property="valueField"/><!--数组，选择存在-->\n' +
              '   </collection>\n' +
              '</resultMap>'
      },
      pie: {
        data: '<resultMap id="pie">\n' +
              '   <result property="typeField"/><!--分类字段，必须存在-->\n' +
              '   <result property="valueField"/><!--值字段，必须存在-->\n' +
              '</resultMap>'
      },
      datasourceHelp: '<mapper>\n' + 
                  '   <!--resultMap需要关联sql语句，可以重复使用，用于定义最终返回的数据字段-->\n' +
                  '   <!--resultType属性默认是List，Sql执行结果会以List的形式返回；设置成Map，Sql结果则会以Map的形式返回，Map的Key是第一层id值的组合-->\n' +
                  '   <resultMap id="userMap" resultType="List">\n' +
                  '       <!--在返回的结果集中，以所有id的property中的字段为key进行去重操作，支持多个id字段-->\n' +
                  '       <id property="userId" />\n' +
                  '       <!--绑定结果集中的字段，必须和结果集中的字段名对应，没绑定的字段会被丢弃-->\n' +
                  '       <result property="userName" />\n' +
                  '       <!--以property中的值为key绑定次级结果集，collection中可嵌套id、result和collection。-->\n' +
                  '       <collection property="roleList">\n' +
                  '           <result property="roleName" />\n' +
                  '       </collection>\n' +
                  '   </resultMap>\n' +
                  '\n' + 
                  '   <!--select语句块用于定义查询sql语句-->\n' +
                  '   <!--resultMap 必填属性，关联一个resultMap id\n' +
                  '   <!--lazyload 选填属性，默认值false，设为true时，该段select语句在页面第一次加载时不运行-->\n' +
                  '   <!--timeout 选填属性，查询超时时间，默认值30秒-->\n' +
                  '   <select id="userList" resultMap="userMap" lazyload="false" timeout="30">\n' +
                  '       SELECT user_id AS userId, user_name AS userName, c.name AS roleName from user a LEFT JOIN user_role b ON a.uuid = b.user_uuid LEFT JOIN role c ON b.role_uuid = c.uuid\n' +
                  '       WHERE true\n' +
                  '       <if test="userId != null">\n' +
                  '       <!--当test中的表达式为true，则输出if的主体内容，表达式使用javascript语法-->\n' +
                  '           AND user_id = #{userId}\n' +
                  '       </if>\n' +
                  '       <ifNotNull parameter="userName">\n' +
                  '       <!--如果parameter不为空值，则输出ifNotNull的主体内容-->\n' +
                  '           AND user_name = #{userName}\n' +
                  '       </ifNotNull>\n' +
                  '       <ifNull parameter="email">\n' +
                  '       <!--如果parameter为空值，则输出ifNull的主体内容-->\n' +
                  '           AND email = \'xx@xx.com\'\n' +
                  '       </ifNull>\n' +
                  '       <forEach parameter="userIds" separator=",">\n' +
                  '       <!--如果parameter为数组，则使用separator分隔输出变量-->\n' +
                  '           AND user_id IN (#{userIds})\n' +
                  '       </forEach>\n' +
                  '   </select>\n' +
                  '\n' +
                  '   <!--rest语句块用于定义查询远程接口-->\n' +
                  '   <!--url 必填属性，目标地址-->\n' +
                  '   <!--lazyload 选填属性，默认值为false，设为true时，该段select语句在页面第一次加载时不运行-->\n' +
                  '   <!--authtype 选填属性，为空代表匿名访问，支持basic或token，如果为basic，则需要提供username和password属性，如果为token，则需要提供token属性-->\n' +
                  '   <!--timeout 选填属性，读取超时时间，默认值30秒-->\n' +
                  '   <!--rest内容块用于定义请求参数，需要符合json格式，请求将以payload形式发送-->\n' +
                  '   <rest id="restUserList" url="http://xxx.yyy.zzz" lazyload="false" authtype="basic" username="user" password="pwd" timeout="30">\n' +
                  '       <!--此处同样支持<if><ifNull><ifNotNull><forEach>标签，具体请参考上面说明-->\n' +
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
