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
          :title="$t('term.report.contentconfigexample')"
        >
          <a href="javascript:void(0)">{{ $t('term.report.contentconfigexample') }}</a>
          <div slot="content" style="height:600px;">
            <div>
              内容配置支持
              <b>freemarker</b>
              语法，通过
              <b>report.xxx</b>
              获取指定结果集。
              <br />
              例如：数据源配置中包含id="userList"的select节点和id="teamList"的rest节点，则可通过
              <b>{"data": "userList"}</b>
              和
              <b>${"data": "teamList"}</b>
              获取结果集。
              <br />
              除自行填写freemarker模板外，系统提供了以下图表函数，帮助快速生成简单图表
              <p>
                表格：
                <b>${drawTable(config[必须，json格式，data字段必须])}，config范例：</b>
              </p>
              <div>
                <TsCodemirror
                  ref="editor1"
                  :value="table.config"
                  :isReadOnly="true"
                  codeMode="json"
                ></TsCodemirror>
              </div>
              <p>
                柱状图：
                <b>${drawBar(config[必须，json格式，data字段必须])}</b>
                ，data范例：
              </p>
              <div>
                <TsCodemirror
                  ref="editor2"
                  :value="barHelp.data"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>
                横向柱状图：
                <b>${drawBarH(config[必须，json格式，data字段必须])}</b>
                ，data范例：
              </p>
              <div>
                <TsCodemirror
                  ref="editor3"
                  :value="barhHelp.data"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>
                堆积图：
                <b>${drawStackedBar(config[必须，json格式，data字段必须])}</b>
                ，data范例：
              </p>
              <div>
                <TsCodemirror
                  ref="editor4"
                  :value="stackedBar.data"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>
                横向堆积图：
                <b>${drawStackedBarH(config[必须，json格式，data字段必须])}</b>
                ，data范例请参考
                <b>堆积图</b>
              </p>
              <p>
                曲线图：
                <b>${drawLine(config[必须，json格式，data字段必须])}</b>
                ，data范例请参考
                <b>柱状图</b>
              </p>
              <p>
                饼图：
                <b>${drawPie(config[必须，json格式，data字段必须])}</b>
                ，data范例：
              </p>
              <div>
                <TsCodemirror
                  ref="editor5"
                  :value="pie.data"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>config范例，适用于以上所有图表：</p>
              <div>
                <TsCodemirror
                  ref="editor6"
                  :value="barHelp.config"
                  :isReadOnly="true"
                  codeMode="json"
                ></TsCodemirror>
              </div>
            </div>
          </div>
        </Poptip>
      </div>
    </Alert>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  filters: {},
  props: {},
  data() {
    return {
      isHelpShow: false,
      table: {
        config: `{\n   "data":"dataList",\n   "title":"${this.$t('page.title')}",\n   "header":${this.$t('term.report.describe.headerdescribe')},\n   "column":${this.$t('term.report.describe.columndescribe')}\n}`
      },
      barHelp: {
        data: '<resultMap id="bar">\n' + '   <result property="yField"/><!--Y坐标列，必须是数值，必须存在-->\n' + '   <result property="xFiled"/><!--X坐标列，必须存在-->\n' + '   <result property="groupField"/><!--分组列，柱状图选择存在，曲线图必须存在-->\n' + '</resultMap>',
        config: `{\n   "data":"dataList",\n   "title":${this.$t('page.title')},\n   "xLabel":${this.$t('term.report.axis.xcoordinatetitle')},\n   "yLabel":${this.$t('term.report.axis.ycoordinatetitle')},\n   "width":${this.$t('term.report.widthdescribe')},\n   "height":${this.$t('term.report.heightdescribe')},\n   "isShowValue":${this.$t('term.report.showvaluedescribe')},\n   "tick":${this.$t('term.report.tickdescribe')}\n}`
      },
      barhHelp: {
        data: '<resultMap id="barh">\n' + '   <result property="xField"/><!--X坐标列，必须是数值，必须存在-->\n' + '   <result property="yFiled"/><!--Y坐标列，必须存在-->\n' + '   <result property="groupField"/><!--分组列，选择存在-->\n' + '</resultMap>'
      },
      stackedBar: {
        data: '<resultMap id="stacked">\n' + '   <result property="groupField"/><!--一级分类，必须存在-->\n' + '   <collection property="dataList"><!--数据集，必须存在-->\n' + '       <result property="typeField"/><!--二级分类，必须存在-->\n' + '       <result property="valueField"/><!--数组，选择存在-->\n' + '   </collection>\n' + '</resultMap>'
      },
      pie: {
        data: '<resultMap id="pie">\n' + '   <result property="typeField"/><!--分类字段，必须存在-->\n' + '   <result property="valueField"/><!--值字段，必须存在-->\n' + '</resultMap>'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {},
  watch: {
    isHelpShow: {
      handler: function(val) {
        if (val) {
          this.$nextTick(() => {
            for (let e in this.$refs) {
              if (this.$refs[e] && this.$refs[e].refresh) {
                this.$refs[e].refresh();
              }
            }
          });
        }
      }
    }
  }
};
</script>
<style lang="less" scoped></style>
