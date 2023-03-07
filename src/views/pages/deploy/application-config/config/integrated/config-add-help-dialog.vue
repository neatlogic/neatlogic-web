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
                    >下载脚本</span>
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
          title: '功能概述',
          detailList: [
            {
              title: '',
              desc: '代码仓库合并代码后（如GitLab的post-receive事件、SVN的post-commit事件），调用本系统接口，创建发布作业，或创建发布批量作业。'
            }
          ]
        },
        {
          uuid: this.$utils.setUuid(),
          title: 'GitLab仓库配置方式',
          detailList: [
            {
              title: '1.填写仓库信息',
              desc: '需要填写仓库信息，包括GitLab服务地址、用户名、密码、仓库名、分支信息'
            },
            {
              title: ' 2.动作配置',
              desc: '绑定动作，如创建作业、创建批量作业，并填写动作参数，如发布作业的版本号等'
            },
            {
              title: '3.GitLab创建Hook',
              desc: '本系统将根据第1步中的仓库信息，调用GitLab接口，自动创建指定分支范围内，由post-receive事件触发的Hook'
            },
            {
              title: '4.生效',
              desc: ' 配置完成后，当第1步中指定的仓库及分支发生post-receive事件时，GitLab将通过接口访问本系统，根据第2步中的作业参数，在本系统创建发布作业'
            }
          ]
        },
        {
          title: 'SVN仓库配置方式',
          detailList: [
            {
              title: '1.填写仓库信息',
              desc: '需要填写仓库信息，包括SVN服务地址、仓库名、分支信息'

            },
            {
              title: '2.动作配置',
              desc: '绑定动作，如创建作业、创建批量作业，并填写动作参数，如发布作业的版本号等'
            },
            {
              title: '3.SVN创建Hook',
              desc: 'SVN仓库，需要用户自行登陆SVN服务器，修改Hook脚本',
              innerList: [
                {
                  title: '1）进入hooks目录',
                  type: 'script',
                  desc: ['[root@centos ~]#cd /svndata/doc/hooks', '[root@centos hooks]#ll', 'total 40', '-rw-r--r-- 1 root root 1977 Jun  8 23:50 post-commit.tmpl', '-rw-r--r-- 1 root root 1638 Jun  8 23:50 post-lock.tmpl', '-rw-r--r-- 1 root root 2289 Jun  8 23:50 post-revprop-change.tmpl', '-rw-r--r-- 1 root root 1567 Jun  8 23:50 post-unlock.tmpl', '-rw-r--r-- 1 root root 3426 Jun  8 23:50 pre-commit.tmpl', '-rw-r--r-- 1 root root 2410 Jun  8 23:50 pre-lock.tmpl', '-rw-r--r-- 1 root root 2786 Jun  8 23:50 pre-revprop-change.tmpl', '-rw-r--r-- 1 root root 2100 Jun  8 23:50 pre-unlock.tmpl', '-rw-r--r-- 1 root root 2780 Jun  8 23:50 start-commit.tmpl']
                },
                {
                  title: '2）基于post-commit模板文件，创建post-commit文件并作执行授权',
                  type: 'script',
                  desc: ['[root@centos hooks]#cp post-commit.tmpl post-commit', '[root@centos hooks]#chmod +x post-commit']
                },
                {
                  title: '3）修改post-commit脚本，在脚本中调用本系统创建作业接口(需要修改下方脚本中DEPLOYURL参数的接口地址)',
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
                    '# 如果提交信息中没有 --autodeploy，不执行后续持续集成动作',
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

                    '# 格式化数据',
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
                  title: '4.生效',
                  desc: ' 配置完成后，当第1步中指定的仓库及分支发生post-commit事件时，SVN将执行post-commit脚本，调用本系统接口，根据第2步中的作业参数，在本系统创建发布作业'
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
      let fileName = 'post-commit脚本.txt';
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
