import { CLOUD_ENV_ID } from './utils/constants';

App({
  globalData: {
    cloudReady: false
  },

  // 小程序启动时初始化云开发；环境 ID 未配置时使用开发者工具当前默认环境。
  onLaunch() {
    this.initCloud();
  },

  // 初始化微信云开发能力，后续云数据库读写统一走 utils/cloud-db.js。
  initCloud() {
    if (!wx.cloud) {
      wx.showToast({
        title: '请使用新版微信打开',
        icon: 'none'
      });
      return;
    }

    const cloudConfig = {
      traceUser: true
    };

    if (CLOUD_ENV_ID) {
      cloudConfig.env = CLOUD_ENV_ID;
    }

    wx.cloud.init(cloudConfig);
    this.globalData.cloudReady = true;
  }
});
