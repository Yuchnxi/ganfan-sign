const MEAL_TYPE_LABELS = {
  lunch: '午餐',
  dinner: '晚餐'
};

const HOME_IMAGE_URLS = {
  heroMascot: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/masco/mascot_rice_mini@2x.png',
  drawScene: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/scene/home_bucket_with_tag@2x.png',
  riceFriend: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/masco/mascot_rice_waving@2x.png',
  chickFriend: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/characters/character_chick@2x.png',
  tomatoFriend: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/characters/character_tomato@2x.png'
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
