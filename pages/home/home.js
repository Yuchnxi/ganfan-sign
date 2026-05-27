const MEAL_TYPE_LABELS = {
  lunch: '午餐',
  dinner: '晚餐'
};

Page({
  data: {
    selectedMealType: 'lunch',
    mealTypeLabel: MEAL_TYPE_LABELS.lunch
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
