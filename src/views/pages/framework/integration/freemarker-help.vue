<template>
  <div>
    <div style="white-space:normal">
      {{ $t('term.framework.freemarkerrootprefix') }}
      <strong>DATA</strong>
      {{ $t('term.framework.freemarkerrootsuffix') }}
      <strong>${DATA.keyword}</strong>{{ $t('term.framework.freemarkergetparam') }}
    </div>
    <dl>
      <dt>{{ $t('term.framework.freemarkerinterpolationtitle') }}</dt>
      <dd>
        (1) <strong>${var}</strong>: string <strong>${strVar}</strong>, int <strong>${intVar}</strong>, boolean <strong>${booVar?string("yes","no")}</strong>
      </dd>
      <dd>
        (2) <strong>${var!}</strong>: {{ $t('term.framework.freemarkerdefaultvalue') }} <strong>${var!'default value'}</strong>.
      </dd>
      <dd>
        (3) <strong>${object.property}</strong>: {{ $t('term.framework.freemarkerobjectvalue') }} <strong>${User.name}</strong>
      </dd>
      <dd>
        (4) <strong>&lt;#assign num = 100 /&gt;</strong>: {{ $t('term.framework.freemarkerassign') }}
      </dd>
      <dd>
        (5) {{ $t('term.framework.freemarkerlistvalue') }}:
        <strong>&lt;#list list as item&gt;</strong>
        <strong>${item}</strong>
        <strong>&lt;/#list&gt;</strong>
      </dd>
      <dd>
        (6) {{ $t('term.framework.freemarkermapvalue') }}:
        <strong>&lt;#list map?keys as key&gt;</strong>
        <strong>${key}:${map[key]}</strong>
        <strong>&lt;/#list&gt;</strong>
      </dd>
      <dt>{{ $t('term.framework.freemarkerconditiontitle') }}</dt>
      <dd>
        (1) <strong>if</strong>:
        <strong>&lt;#if condition&gt;</strong>
        {{ $t('term.framework.output') }}
        <strong>&lt;/#if&gt;</strong>
      </dd>
      <dd>
        (2) <strong>if - else</strong>:
        <strong>&lt;#if condition&gt;</strong>
        {{ $t('term.framework.output') }}
        <strong>&lt;#else&gt;</strong>
        {{ $t('term.framework.output') }}
        <strong>&lt;/#if&gt;</strong>
      </dd>
      <dd>
        (3) <strong>if - elseif - else</strong>:
        <strong>&lt;#if age &gt; 18&gt;</strong>
        {{ $t('term.framework.young') }}
        <strong>&lt;#elseif age == 18&gt;</strong>
        {{ $t('term.framework.adult') }}
        <strong>&lt;#else&gt;</strong>
        {{ $t('term.framework.teenager') }}
        <strong>&lt;/#if&gt;</strong>
      </dd>
      <dd>
        (4) <strong>switch</strong>:
        <strong>&lt;#switch var&gt;</strong>
        <strong>&lt;#case condition1&gt;</strong>
        {{ $t('term.framework.output') }}
        <strong>&lt;#break&gt;</strong>
        <strong>&lt;#case condition2&gt;</strong>
        {{ $t('term.framework.output') }}
        <strong>&lt;#break&gt;</strong>
        <strong>&lt;#default&gt;</strong>
        {{ $t('term.framework.output') }}
        <strong>&lt;/#switch&gt;</strong>
      </dd>
      <dt>{{ $t('term.framework.freemarkerexampletitle') }}</dt>
      <dd><strong>{{ $t('page.data') }}</strong>: {"userList":[{"username":"Alex","title":"Lead"},{"username":"Bob","title":"Staff"},{"username":"Cindy","title":"Staff"}]}</dd>
      <dd>
        <strong>{{ $t('term.framework.template') }}</strong>:
        <pre>&lt;#assign titlelist=[]/&gt;
&lt;#list DATA.userList as user&gt;
&lt;#if !titlelist?seq_contains(user['title'])&gt;
&lt;#assign titlelist=titlelist+[user['title']]/&gt;
&lt;/#if&gt;
&lt;/#list&gt;
&lt;#assign t=0/&gt;
{
&lt;#list titlelist as title&gt;
&lt;#assign i=0/&gt;
&lt;#if t gt 0&gt;,&lt;/#if&gt;
"${title}":[
&lt;#list DATA.userList as user&gt;
&lt;#if user['title'] == title&gt;
&lt;#if i gt 0&gt;,&lt;/#if&gt;
"${user['username']}"
&lt;#assign i=i+1/&gt;
&lt;/#if&gt;
&lt;/#list&gt;
]
&lt;#assign t=t+1/&gt;
&lt;/#list&gt;
}</pre>
      </dd>
      <dd><strong>{{ $t('page.result') }}</strong>: { "Lead":[ "Alex" ], "Staff":[ "Bob", "Cindy" ] }</dd>
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
    <div>{{ $t('term.framework.moregrammarvisit') }}<a href="https://freemarker.apache.org/docs/index.html" target="_blank">{{ $t('term.framework.officialdocs') }}</a></div>
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
