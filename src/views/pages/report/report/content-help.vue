<template>
  <div>
    <Alert show-icon>
      <div>
        <Poptip
          trigger="hover"
          placement="right"
          width="700"
          :transfer="true"
          title=" 内容配置范例"
        >
          <a href="javascript:void(0)">内容配置范例</a>
          <div slot="content" style="height:600px;">
            <div style="word-break:break-all;white-space:pre-wrap;">
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
                {{ table.config }}
              </div>
              <p>
                柱状图：
                <b>${drawBar(config[必须，json格式，data字段必须])}</b>
                ，data范例：
              </p>
              <div>
                {{ barHelp.data }}
              </div>
              <p>
                横向柱状图：
                <b>${drawBarH(config[必须，json格式，data字段必须])}</b>
                ，data范例：
              </p>
              <div>
                {{ barhHelp.data }}
              </div>
              <p>
                堆积图：
                <b>${drawStackedBar(config[必须，json格式，data字段必须])}</b>
                ，data范例：
              </p>
              <div>
                {{ stackedBar.data }}
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
                {{ pie.data }}
              </div>
              <p>config范例，适用于以上所有图表：</p>
              <div>
                {{ barHelp.config }}
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
  components: {},
  filters: {},
  props: {},
  data() {
    return {
      table: {
        config: '{\n' + '   "data":"dataList",\n' + '   "title":"标题",\n' + '   "header":"表头，可选，为空代表显示使用数据集名称，多个表头用英文逗号分隔",\n' + '   "column":"字段，可选，为空代表显示所有数据集数据，多个字段用英文逗号分隔"\n' + '}'
      },
      barHelp: {
        data: '<resultMap id="bar">\n' + '   <result property="yField"/><!--Y坐标列，必须是数值，必须存在-->\n' + '   <result property="xFiled"/><!--X坐标列，必须存在-->\n' + '   <result property="groupField"/><!--分组列，柱状图选择存在，曲线图必须存在-->\n' + '</resultMap>',
        config: '{\n' + '   "data":"dataList",\n' + '   "title":"标题",\n' + '   "xLabel":"x坐标标题",\n' + '   "yLabel":"y坐标标题",\n' + '   "width":"宽度，默认1000",\n' + '   "height":"高度，默认400",\n' + '   "isShowValue":"false|true，柱子上是否显示数值，默认true",\n' + '   "tick":"number，x坐标显示位置不够时，控制间隔点数"\n' + '}'
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
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
