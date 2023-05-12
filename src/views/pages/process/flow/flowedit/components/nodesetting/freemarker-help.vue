<template>
  <div>
    <div style="white-space:normal">
      数据根元素是
      <strong>DATA</strong>
      ，例如传入参数是{"keyword":"关键字"}，则需要通过
      <strong>${DATA.keyword}</strong>来获取参数值。
    </div>
    <dl>
      <dt>1.取值（插值）指令及适用类型：</dt>
      <dd>
        (1)
        <strong>${var}</strong>， 获取string:
        <strong>${strVar}</strong>
        获取int:
        <strong>${intVar}</strong>
        获取boolean:
        <strong>${booVar?string("yes","no")}</strong>
      </dd>
      <dd>
        (2)
        <strong>${var!}</strong>，对null或者不存在的对象进行取值时设置默认值： <strong>${var!'我是默认值'}</strong>。
      </dd>
      <dd>
        (3)
        <strong>${封装对象.属性}</strong>
        ，对封装对象进行取值：
        <strong>${User.name}</strong>
      </dd>
      <dd>
        (4)
        <strong>&lt;#assign num = 100 /&gt;</strong>，定义变量，支持计算和赋值。
      </dd>
      <dd>
        (5)对List集合进行取值：
        <strong>&lt;#list list集合 as item&gt;</strong>
        <strong>${item}</strong> --取值
        <strong>&lt;/#list&gt;</strong>
      </dd>
      <dd>
        (8)对Map集合进行取值：
        <strong>&lt;#list map?keys as key&gt;</strong>
        <strong>${key}:${map[key]}</strong>
        <strong>&lt;/#list&gt;</strong>
      </dd>
      <dt>2.条件判断指令：</dt>
      <dd>
        (1)
        <strong>if</strong>单条件：
        <strong>&lt;#if 条件&gt;</strong>
        输出
        <strong>&lt;/#if&gt;</strong>
      </dd>
      <dd>
        (2)
        <strong>if - else</strong>匹配或不匹配：
        <strong>&lt;#if 条件&gt;</strong>
        输出
        <strong>&lt;#else&gt;</strong>
        输出
        <strong>&lt;/#if&gt;</strong>
      </dd>
      <dd>
        (3)
        <strong>if - elseif - else</strong>多条件：
        <strong>&lt;#if age &gt; 18&gt;</strong>
        青年
        <strong>&lt;#elseif age == 18&gt;</strong>
        成年
        <strong>&lt;#else&gt;</strong>
        少年
        <strong>&lt;/#if&gt;</strong>
      </dd>
      <dd>
        (4)
        <strong>switch</strong> --常与 <strong>case break default</strong>一起使用，参数可为字符串：
        <strong>&lt;#switch var&gt;</strong>
        <strong>&lt;#case 条件1&gt;</strong>
        输出
        <strong>&lt;#break&gt;</strong>
        <strong>&lt;#case 条件2&gt;</strong>
        输出
        <strong>&lt;#break&gt;</strong>
        <strong>&lt;#default&gt;</strong>
        输出
        <strong>&lt;/#switch&gt;</strong>
      </dd>
      <!-- 
      <dt>3.处理字符串函数：</dt>
      <dd>
        <div>
          <strong>substring</strong> 截取字符串，包头不包尾（下标）
        </div>
        <div>
          <strong>cap_first</strong> 第一个字母大写
        </div>
        <div>
          <strong>end_with</strong> 以什么字母结尾
        </div>
        <div>
          <strong>contains</strong> 是否包含目标字符串
        </div>
        <div>
          <strong>date datetime</strong> time 转换成日期格式
        </div>
        <div>
          <strong>starts_with</strong> 以什么字母开头
        </div>
        <div>
          <strong>index_of</strong> 返回某个指定的字符串值在字符串中首次出现的位置（下标）
        </div>
        <div>
          <strong>last_index_of</strong> 获取指定字符出现的最后位置（下标）
        </div>
        <div>
          <strong>split</strong> 分隔
        </div>
        <div>
          <strong>trim</strong> 去两端空格
        </div>
      </dd>
      <dt>4.处理数字：</dt>
      <dd>
        <div>
          <strong>x?string("0.##")</strong> 变成小数点后几位
        </div>
        <div>
          <strong>round</strong> 四舍五入
        </div>
        <div>
          <strong>floor</strong> 去掉小数点
        </div>
        <div>
          <strong>ceiling</strong> 近1变成整数
        </div>
      </dd>
      <dt>5.处理list：</dt>
      <dd>
        <div>
          <strong>first</strong>: 取List值第一个值
        </div>
        <div>
          <strong>last</strong>: 取List值最后一个值
        </div>
        <div>
          <strong>seq_contains:</strong> 是否包含指定字符
        </div>
        <div>
          <strong>seq_index_of</strong>: 指定字符所在位置
        </div>
        <div>
          <strong>size</strong>: 集合大小
        </div>
        <div>
          <strong>reverse</strong>: 集合倒序排列
        </div>
        <div>
          <strong>sort</strong>: 对集合进行排序
        </div>
        <div>
          <strong>sort_by</strong>: 根据某一个属性排序
        </div>
        <div>
          <strong>chunk</strong>: 分块处理
        </div>
      </dd>
      <dt>6.其他：</dt>
      <dd>
        <div>
          <strong>is_string</strong>是否为字符类型
        </div>
        <div>
          <strong>is_number</strong>是否为整数类型
        </div>
        <div>
          <strong>is_method</strong>是否为方法
        </div>
        <div>
          <strong>()</strong>: 判断整个变量
        </div>
        <div>
          <strong>has_content</strong>判断对象是否为空或不存在
        </div>
        <div>
          <strong>eval</strong>求值
        </div>
      </dd>-->
    </dl>
    <div>更多语法请访问<a href="https://freemarker.apache.org/docs/index.html" target="_blank">官方文档</a></div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
dd {
  word-break: break-all;
  white-space: normal;
  padding-left: 10px;
}
</style>
