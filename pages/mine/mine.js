const MINE_IMAGE_URLS = {
  profileAvatar: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/masco/mascot_rice_holding_bowl@2x.png'
};

Page({
  data: {
    imageUrls: MINE_IMAGE_URLS,
    menuItems: [
      {
        id: 'foods',
        label: '我的菜单',
        icon: '/assets/icons/ui/icon_bowl.svg',
        url: '/packageSub/menu-edit/menu-edit'
      },
      {
        id: 'records',
        label: '已吃记录',
        icon: '/assets/icons/ui/icon_calendar.svg',
        url: '/packageSub/records/records'
      },
      {
        id: 'settings',
        label: '设置',
        icon: '/assets/icons/ui/icon_setting.svg',
        url: '/packageSub/settings/settings'
      }
    ]
  },

  // 分包页面尚未创建时给出明确提示，避免用户误以为空白或报错。
  onMenuTap() {
    wx.showToast({
      title: '页面待搭建',
      icon: 'none'
    });
  }
});
