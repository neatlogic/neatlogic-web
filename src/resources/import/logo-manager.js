let logoConfig = {
  logoWhiteIcon: '', // 明亮logo
  logoDarkIcon: '' // 暗黑logo
};
const requireLogoWhite = require.context('@/commercial-module/', true, /logo_white\.png$/);
const requireLogoDark = require.context('@/commercial-module/', true, /logo_dark\.png$/);
requireLogoWhite.keys().forEach(path => {
  if (requireLogoWhite(path)) {
    logoConfig.logoWhiteIcon = requireLogoWhite(path);
  }
});
requireLogoDark.keys().forEach(path => {
  if (requireLogoDark(path)) {
    logoConfig.logoDarkIcon = requireLogoDark(path);
  }
});
export default logoConfig;
