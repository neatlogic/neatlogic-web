//api接口的出口
import repository from '@/resources/api/codehub/codehub/repository/repository';
import service from '@/resources/api/codehub/codehub/repository/repositoryservice';
import issue from '@/resources/api/codehub/codehub/issue/issue';
import versiontype from '@/resources/api/codehub/codehub/version/versiontype';
import repositorydetail from '@/resources/api/codehub/codehub/repository/repositorydetail';
import version from '@/resources/api/codehub/codehub/version/version';
import strategy from '@/resources/api/codehub/codehub/version/strategy';
import merge from '@/resources/api/codehub/codehub/merge/merge';
import project from '@/resources/api/codehub/codehub/project/project';
import credential from '@/resources/api/codehub/codehub/repository/repositorycredential';
import tactics from '@/resources/api/codehub/codehub/notifytactics/tactics';
import api from '@/resources/api/codehub/codehub/api/api';
export default {
  repository,
  service,
  issue,
  versiontype,
  repositorydetail,
  version,
  strategy,
  merge,
  project,
  credential,
  tactics,
  api
};
