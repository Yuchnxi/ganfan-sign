import { FORTUNE_TEXTS } from '../../data/fortune-texts';
import {
  acceptDrawRecord,
  addDrawRecord,
  getAcceptedRecords,
  getDailyDraw,
  getFoods,
  getSettings,
  increaseDailyDraw
} from '../../utils/cloud-db';
import { formatDate } from '../../utils/date';

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

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getDateBefore(days) {
  const date = new Date();

  date.setDate(date.getDate() - days);
  return formatDate(date);
}

Page({
  data: {
    selectedMealType: 'lunch',
    mealTypeLabel: MEAL_TYPE_LABELS.lunch,
    imageUrls: HOME_IMAGE_URLS,
    loading: false,
    showResultDialog: false,
    drawResult: null,
    todayDrawCount: 0,
    remainingDraws: 3
  },

  onLoad() {
    this.loadTodayDrawState();
  },

  // 切换当前要抽取的餐次。
  onSelectMeal(event) {
    if (this.data.loading) {
      return;
    }

    const selectedMealType = event.currentTarget.dataset.type;

    this.setData({
      selectedMealType,
      mealTypeLabel: MEAL_TYPE_LABELS[selectedMealType]
    });
  },

  // 加载今日抽签次数，用于展示剩余次数；失败时保留安全默认值。
  async loadTodayDrawState() {
    const today = formatDate();
    const [dailyResult, settingsResult] = await Promise.all([
      getDailyDraw(today),
      getSettings()
    ]);
    const todayDrawCount = dailyResult.data.count || 0;
    const maxDailyDraws = settingsResult.data.maxDailyDraws || 3;

    this.setData({
      todayDrawCount,
      remainingDraws: Math.max(maxDailyDraws - todayDrawCount, 0)
    });
  },

  // 执行抽签主流程：筛选食物、创建记录，并展示结果弹框。
  async onDrawTap() {
    if (this.data.loading) {
      return;
    }

    this.setData({ loading: true });

    try {
      const today = formatDate();
      const [foodsResult, settingsResult, dailyResult] = await Promise.all([
        getFoods(),
        getSettings(),
        getDailyDraw(today)
      ]);

      if (foodsResult.error || settingsResult.error || dailyResult.error) {
        this.showError(foodsResult.error || settingsResult.error || dailyResult.error);
        return;
      }

      const settings = settingsResult.data;
      const enabledFoods = foodsResult.data.filter((food) => (
        food.enabled && food.mealType && food.mealType.includes(this.data.selectedMealType)
      ));

      if (enabledFoods.length === 0) {
        this.showError('请先添加食物');
        return;
      }

      const recentStartDate = getDateBefore(settings.excludeRecentDays || 0);
      const acceptedResult = await getAcceptedRecords(recentStartDate, today);

      if (acceptedResult.error) {
        this.showError(acceptedResult.error);
        return;
      }

      const recentFoodIds = acceptedResult.data.map((record) => record.foodId);
      const filteredFoods = enabledFoods.filter((food) => !recentFoodIds.includes(food.id));
      const candidateFoods = filteredFoods.length > 0 ? filteredFoods : enabledFoods;
      const selectedFood = getRandomItem(candidateFoods);
      const fortuneText = getRandomItem(FORTUNE_TEXTS);
      const currentCount = dailyResult.data.count || 0;
      const maxDailyDraws = settings.maxDailyDraws || 3;
      const shouldIncreaseCount = currentCount < maxDailyDraws;
      let nextCount = currentCount;

      if (shouldIncreaseCount) {
        const increaseResult = await increaseDailyDraw(today);

        if (increaseResult.error) {
          this.showError(increaseResult.error);
          return;
        }

        nextCount = increaseResult.data.count || currentCount + 1;
      }

      const recordResult = await addDrawRecord({
        date: today,
        mealType: this.data.selectedMealType,
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        foodImage: selectedFood.image,
        category: selectedFood.category,
        fortuneText,
        accepted: false,
        drawCount: nextCount
      });

      if (recordResult.error) {
        this.showError(recordResult.error);
        return;
      }

      this.setData({
        todayDrawCount: nextCount,
        remainingDraws: Math.max(maxDailyDraws - nextCount, 0),
        drawResult: {
          ...recordResult.data,
          mealTypeLabel: this.data.mealTypeLabel
        },
        showResultDialog: true
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 再抽一次保留当前餐次，并让上一条记录自然保持未采纳。
  onRedrawTap() {
    this.onDrawTap();
  },

  // 食物图缺失或 COS 路径不可访问时，用饭团图兜底，避免弹框图片区域空白。
  onResultImageError() {
    if (!this.data.drawResult) {
      return;
    }

    this.setData({
      'drawResult.foodImage': HOME_IMAGE_URLS.riceFriend
    });
  },

  // 用户确认“就吃这个”后，将当前记录标记为 accepted。
  async onAcceptTap() {
    if (this.data.loading || !this.data.drawResult) {
      return;
    }

    this.setData({ loading: true });

    try {
      const acceptResult = await acceptDrawRecord(this.data.drawResult.id);

      if (acceptResult.error) {
        this.showError(acceptResult.error);
        return;
      }

      this.setData({
        showResultDialog: false,
        drawResult: null
      });

      wx.showToast({
        title: '今日就吃这个',
        icon: 'success'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 统一展示用户可理解的失败提示。
  showError(message) {
    wx.showToast({
      title: message || '抽签失败，请稍后再试',
      icon: 'none'
    });
  }
});
