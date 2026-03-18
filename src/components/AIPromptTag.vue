<template>
  <view 
    class="tag" 
    :class="{ selected: selected }"
    @click="$emit('click')"
  >
    <text class="tag-text">{{ text }}</text>
  </view>
</template>

<script>
export default {
  name: 'AIPromptTag',
  props: {
    text: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.tag.selected {
  background: #e3f2fd;
  border-color: #2196f3;
}

.tag-text {
  font-size: 13px;
  color: #666;
}

.tag.selected .tag-text {
  color: #2196f3;
  font-weight: 500;
}
</style>
