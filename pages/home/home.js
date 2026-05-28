const MEAL_TYPE_LABELS = {
  lunch: '午餐',
  dinner: '晚餐'
};

const HOME_IMAGE_URLS = {
  heroMascot: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/masco/mascot_rice_chopsticks@2x.png',
  drawScene: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/scene/home_bucket_with_tag@2x.png',
  riceFriend: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/masco/mascot_rice_waving@2x.png',
  chickFriend: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/characters/character_chick@2x.png',
  tomatoFriend: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/characters/character_tomato@2x.png'
};

Page({
  data: {
    selectedMealType: 'lunch',
    mealTypeLabel: MEAL_TYPE_LABELS.lunch,
    imageUrls: HOME_IMAGE_URLS
  },

  // 切换当前要抽取的餐次。
  onSelectMeal(event) {
    const selectedMealType = event.currentTarget.dataset.type;

    this.setData({
      selectedMealType,
      mealTypeLabel: MEAL_TYPE_LABELS[selectedMealType]
    });
  },

  // 首版框架只保留入口提示，具体抽签流程在接入云数据后实现。
  onDrawTap() {
    wx.showToast({
      title: '抽签流程待接入',
      icon: 'none'
    });
  }
});
