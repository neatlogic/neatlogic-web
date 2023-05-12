//api接口的出口
import project from './project/project.js';
import app from './app/app.js';
import status from './app/status.js';
import projecttemplate from './projecttemplate/projecttemplate.js';
import issue from './issue/issue.js';
import issueaudit from './issue/issueaudit.js';
import priority from './issue/priority.js';
import catalog from './issue/catalog.js';
import tag from './tag/tag.js';

export default {
  project,
  app,
  status,
  projecttemplate,
  issue,
  issueaudit,
  priority,
  catalog,
  tag
};
