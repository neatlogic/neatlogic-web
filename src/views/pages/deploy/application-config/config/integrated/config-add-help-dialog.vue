<template>
  <div>
    <TsDialog
      :title="$t('page.help')"
      width="large"
      type="slider"
      :isShow="true"
      :hasFooter="false"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <ul v-for="(item) in dataList" :key="item.uuid" class="mb-nm">
            <li class="mb-sm">{{ item.title }}</li>
            <li v-for="(v, vIndex) in item.detailList" :key="vIndex" class="text-title">
              <div> {{ v.title }}</div>
              <div class="desc-text-indent">{{ v.desc }}</div>
              <div v-for="(t, tIndex) in v.innerList" :key="tIndex">
                <div class="desc-text-indent pt-sm pb-sm">{{ t.title }}</div>
                <div class="pl-nm">
                  <div
                    v-if="t.type == 'script'"
                    :id="tIndex == 2 ? 'fixedScript' : ''"
                    style="position: relative;"
                    class="bg-code radius-sm pb-sm script-content-box"
                  >
                    <span
                      v-if="tIndex == 2"
                      id="downloadScriptText"
                      class="tsfont-download download-script-box text-op cursor"
                      style="top: 10px;right: 10px;"
                      @click="downloadScript(t.desc)"
                    >{{ $t('term.deploy.downloadscript') }}</span>
                    <div v-for="(n, index) in t.desc" :key="index">
                      {{ n }}
                    </div>
                  </div>
                  <div v-else class="desc-text-indent">
                    {{ t.desc }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      dataList: [
        {
          uuid: this.$utils.setUuid(),
          title: this.$t('term.deploy.functionoverview'),
          detailList: [
            {
              title: '',
              desc: this.$t('term.deploy.gitdesc')
            }
          ]
        },
        {
          uuid: this.$utils.setUuid(),
          title: this.$t('term.deploy.gitlabconfigmode'),
          detailList: [
            {
              title: '1.' + this.$t('term.deploy.writewarehouseinfo'),
              desc: this.$t('term.deploy.writewarehouseinfodesc')
            },
            {
              title: ' 2.' + this.$t('term.deploy.actionconfig'),
              desc: this.$t('term.deploy.actionconfigdesc')
            },
            {
              title: '3.' + this.$t('term.deploy.gitlabcreatehook'),
              desc: this.$t('term.deploy.gitlabcreatehookdesc')
            },
            {
              title: '4.' + this.$t('term.deploy.takeeffect'),
              desc: this.$t('term.deploy.takeeffectdesc')
            }
          ]
        },
        {
          title: this.$t('term.deploy.svnwarehouseconfig'),
          detailList: [
            {
              title: '1.' + this.$t('term.deploy.writewarehouseinfo'),
              desc: this.$t('term.deploy.writesvnwarehouseinfodesc')

            },
            {
              title: '2.' + this.$t('term.deploy.actionconfig'),
              desc: this.$t('term.deploy.actionconfigdesc')
            },
            {
              title: '3.' + this.$t('term.deploy.svncreatehook'),
              desc: this.$t('term.deploy.svnwarehousesetting'),
              innerList: [
                {
                  title: '1）' + this.$t('term.deploy.enterhooksdirectory'),
                  type: 'script',
                  desc: ['[root@centos ~]#cd /svndata/doc/hooks', '[root@centos hooks]#ll', 'total 40', '-rw-r--r-- 1 root root 1977 Jun  8 23:50 post-commit.tmpl', '-rw-r--r-- 1 root root 1638 Jun  8 23:50 post-lock.tmpl', '-rw-r--r-- 1 root root 2289 Jun  8 23:50 post-revprop-change.tmpl', '-rw-r--r-- 1 root root 1567 Jun  8 23:50 post-unlock.tmpl', '-rw-r--r-- 1 root root 3426 Jun  8 23:50 pre-commit.tmpl', '-rw-r--r-- 1 root root 2410 Jun  8 23:50 pre-lock.tmpl', '-rw-r--r-- 1 root root 2786 Jun  8 23:50 pre-revprop-change.tmpl', '-rw-r--r-- 1 root root 2100 Jun  8 23:50 pre-unlock.tmpl', '-rw-r--r-- 1 root root 2780 Jun  8 23:50 start-commit.tmpl']
                },
                {
                  title: '2）' + this.$t('term.deploy.createpostcommit'),
                  type: 'script',
                  desc: ['[root@centos hooks]#cp post-commit.tmpl post-commit', '[root@centos hooks]#chmod +x post-commit']
                },
                {
                  title: '3）' + this.$t('term.deploy.updatepostcommit'),
                  type: 'script',
                  desc: [
                    '#!/bin/sh -x',
                    '# POST-COMMIT HOOK',
                    'export LANG=en_US.UTF-8',
                    'OLD_PATH=${PATH};',
                    'if [ -z "${PATH}" ];',
                    'then',
                    '    export PATH=/usr/local/bin:/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/sbin',
                    'else',
                    '    export PATH=$PATH:/usr/local/bin:/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/sbin',
                    'fi',
                    'DEPLOYURL="http://192.168.8.104:8080/neatlogic/anonymous/api/rest/deploy/ci/svn/event/callback/dev";',
                    'BASIC_AUTH_USER=""',
                    'BASIC_AUTH_PWD=""',
                    'LOG_FILE="/tmp/post-commit.log"',
                    'REPOS="$1"',
                    'REV="$2"',
                    'event=post-commit',
                    "dirsChanged=''",
                    'author=`svnlook author $REPOS -r $REV`',
                    'date=`svnlook date $REPOS -r $REV`',
                    'log=`svnlook log $REPOS -r $REV`',
                    'added=""',
                    'modified=""',
                    'deleted=""',
                    '#' + this.$t('term.deploy.notautodeploynotcontinue'),
                    '#if [ -z `svnlook log $REPOS -r $REV | grep -o "\--autodeploy"` ]; then',
                    '  # exit 0',
                    '#fi',

                    'OLD_IFS=${IFS}',
                    'IFS=$\n',

                    'for dir in `svnlook dirs-changed $REPOS -r $REV`',
                    'do',
                    '    dirsChanged="${dirsChanged}${dir},"',
                    'done',
                    'dirsChanged=${dirsChanged%,}',

                    'for line in `svnlook changed $REPOS -r $REV`',
                    'do',
                    '    content=${line#* }',
                    '    action=${line%% *}',
                    '    if [ "$action" = "A" ];then',
                    '        added="${added}${content},"',
                    '    elif [ "$action" = "U" ] || [ "$action" = "UU" ] || [ "$action" = "_U" ];then',
                    '        modified="${modified}${content},"',
                    '    elif [ "$action" = "D" ];then',
                    '        deleted="${deleted}${content},"',
                    '    fi',
                    'done',

                    'ip=""',
                    'ipAddr=`ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v inet6|awk "{print $2}"|tr -d "addr:"`',
                    'ipArray=(`echo $ipAddr | tr \n ""`)',
                    'ipNum=${#ipArray[@]}',
                    'if [ $ipNum -eq 1 ]',
                    'then',
                    '    ip=${ipArray[0]}',
                    'elif [ $ipNum -gt 1 ]',
                    'then',
                    '    for i in ${ipArray[@]}',
                    '    do',
                    '        if [ -n "$ip" ]',
                    '        then',
                    '            ip="$ip","$i";',
                    '        else',
                    '            ip=$i;',
                    '        fi',
                    '    done',
                    'fi',

                    '#' + this.$t('term.deploy.formatteddata'),
                    'added=${added%,}',
                    'modified=${modified%,}',
                    'deleted=${deleted%,}',
                    'date=${date% +*}',

                    'data="{event:"$event",repo:"${REPOS}",dirsChanged:"${dirsChanged}",revision:"${REV}",author:"${author}",date:"${date}",message:"${log}",added:"${added}",modified:"${modified}",deleted:"${deleted}",ip:"$ip"}"',

                    '#echo "old path: $OLD_PATH" > /tmp/post-commit.log',
                    '#echo "new path: $PATH" >> /tmp/post-commit.log',
                    'echo "">>${LOG_FILE}',
                    'echo "==========================`date "+%Y-%m-%d %H:%M:%S"`==============================" >> ${LOG_FILE}',
                    'echo "deploy RESTFul url is $DEPLOYURL" >> ${LOG_FILE}',
                    'echo "svn post-commit upload data is: $data" >> ${LOG_FILE}',
                    'echo "ci result:" >> ${LOG_FILE}',
                    'curl -s  --basic -u ${BASIC_AUTH_USER}:${BASIC_AUTH_PWD} -X POST -H "Content-Type:application/json" --data "${data}" "${DEPLOYURL}" 2>&1|tee -a ${LOG_FILE};',
                    'echo "">>${LOG_FILE}']

                },
                {
                  title: '4.' + this.$t('term.deploy.takeeffect'),
                  desc: this.$t('term.deploy.svntakeeffectdesc')
                }
              ]
            }
          ]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    window.addEventListener('scroll', this.getTop, true);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {
    window.removeEventListener('scroll', this.getTop, false);
  },
  methods: {
    closeDialog() {
      this.$emit('close');
    },
    getTop() {
      let element = document.getElementById('fixedScript');
      let downloadScriptText = document.getElementById('downloadScriptText');
      let scrollTop = element ? element.getBoundingClientRect().top : 0;
      if (scrollTop > 0 && downloadScriptText) {
        downloadScriptText.style.top = (scrollTop + 10) + 'px'; // 10 间隙
        downloadScriptText.style.right = '30px';
        element.style = '';
      }
    },
    downloadScript(data) {
      // 下载脚本
      let downLoadData = '';
      let fileName = this.$t('term.deploy.postcommitscript');
      if (!data) {
        return;
      }
      data.forEach((v) => {
        if (v) {
          downLoadData += `${v}\n`;
        }
      });
      let url = URL.createObjectURL(new Blob([downLoadData], {
        type: 'application/octet-stream'
      }));
      let link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.desc-text-indent {
  text-indent: 1.5em;
}
.script-content-box {
  max-height: 450px;
  overflow: scroll;
  .download-script-box {
    position: absolute;
  }
}
</style>
