import { getFoods } from '../../utils/cloud-db';

const MEAL_TYPE_LABELS = {
  lunch: '午餐',
  dinner: '晚餐'
};

const CATEGORY_LABELS = {
  kuaican: '快餐',
  huoguo: '火锅',
  fenmian: '粉面',
  riliao: '日料',
  other: '其他'
};

Page({
  data: {
    loading: false,
    error: '',
    foods: []
  },

  onLoad() {
    this.loadFoods();
  },

  // 读取当前用户菜单，先提供稳定的菜单查看入口。
  async loadFoods() {
    this.setData({
      loading: true,
      error: ''
    });

    try {
      const foodsResult = await getFoods();

      if (foodsResult.error) {
        this.setData({
          error: foodsResult.error,
          foods: []
        });
        return;
      }

      this.setData({
        foods: (foodsResult.data || []).map((food) => this.formatFood(food))
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 补齐菜单列表展示文案，避免模板中堆条件判断。
  formatFood(food) {
    const mealTypes = food.mealType || [];
    const mealTypeText = mealTypes.map((type) => MEAL_TYPE_LABELS[type]).filter(Boolean).join(' / ');

    return {
      ...food,
      mealTypeText: mealTypeText || '未设置餐次',
      categoryLabel: CATEGORY_LABELS[food.category] || '其他',
      statusText: food.enabled ? '启用' : '停用',
      statusClass: food.enabled ? 'food-status--enabled' : 'food-status--disabled'
    };
  }
});
