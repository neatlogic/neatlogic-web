<template>
  <div>
    <Poptip
      trigger="hover"
      width="700"
      :transfer="true"
      :title="$t('term.framework.grammarhint')"
    >
      <a href="javascript:void(0)">{{ $t('term.framework.grammarhint') }}</a>
      <div slot="content">
        <dl>
          <dt class="syntax-help">
            <div>1.{{ $t('term.framework.javascriptconstraint') }}<strong>O</strong>{{ $t('term.framework.javascriptconstraintmiddle') }}<strong>N</strong>{{ $t('term.framework.javascriptconstraintsuffix') }}</div>
            <div class="indent-1">{{ $t('term.framework.javascriptprinttip') }}<strong>print("xx")</strong>{{ $t('term.framework.javascriptprinttipsuffix') }}</div>
          </dt>
          <dt class="syntax-help">
            <div>2.{{ $t('term.framework.javascriptexample') }}{{ $t('term.framework.javascriptdata') }}&#123;"userList":[</div>
            <div class="indent-2">&#123;"username":"{{ $t('term.framework.javascriptsampleuserone') }}","title":"{{ $t('term.framework.javascriptsamplelead') }}"&#125;,</div>
            <div class="indent-2">&#123;"username":"{{ $t('term.framework.javascriptsampleusertwo') }}","title":"{{ $t('term.framework.javascriptsamplestaff') }}"&#125;,</div>
            <div class="indent-2">&#123;"username":"{{ $t('term.framework.javascriptsampleuserthree') }}","title":"{{ $t('term.framework.javascriptsamplestaff') }}"&#125;</div>
            <div class="indent-1">]&#125;</div>
            <div class="indent-1">{{ $t('term.framework.javascriptrule') }}for (var i = 0; i &lt; O.userList.length; i++) {</div>
            <div class="indent-2">var userObj = O.userList[i];</div>
            <div class="indent-2">if (!N[userObj['title']]) {</div>
            <div class="indent-3">N[userObj['title']] = [];</div>
            <div class="indent-2">}</div>
            <div class="indent-2">N[userObj['title']].push(userObj['username']);</div>
            <div class="indent-1">}</div>
            <div class="indent-1">{{ $t('term.framework.javascriptresult') }}&#123;"{{ $t('term.framework.javascriptsamplelead') }}":[ "{{ $t('term.framework.javascriptsampleuserone') }}" ] , "{{ $t('term.framework.javascriptsamplestaff') }}":[ "{{ $t('term.framework.javascriptsampleusertwo') }}" , "{{ $t('term.framework.javascriptsampleuserthree') }}" ] &#125;</div>
          </dt>
        </dl>
      </div>
    </Poptip>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
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
.syntax-help {
  font-family: monospace;
  white-space: pre-wrap;
}
.indent-1 {
  padding-left: 28px;
}
.indent-2 {
  padding-left: 56px;
}
.indent-3 {
  padding-left: 84px;
}
</style>
