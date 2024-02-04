<script setup>
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  extra: {
    type: Number,
    default: 32
  },
  itemTag: {
    type: String,
    default: 'div'
  }
});

let itemHeights = ref(new Map());

const wrapper = ref(null);
const visible = ref(0);
const positions = ref([]);

const generateInitialPositions = (i = 0, totalHeight = 0) => {
  if (i >= props.items.length) {
    return;
  }

  visible.value = i + 1;
  positions.value.push({ itemIndex: i, top: 0 });

  setTimeout(() => {
    const itemHeight = itemHeights.value.get(props.items[i].id) || props.itemHeight;
    positions.value[i].top = totalHeight;

    totalHeight += itemHeight;
    console.log(wrapper.value.clientHeight);

    if (wrapper.value.clientHeight > totalHeight) {
      generateInitialPositions(i + 1, totalHeight);
    }
  });
};

const wrapperHeight = computed(() => {
  if (itemHeights.value.size === 0) {
    return 0;
  }

  const averageHeight =
    Array.from(itemHeights.value.values()).reduce((a, b) => a + b, 0) / itemHeights.value.size;

  // calculate the height of the wrapper
  let height = 0;
  for (const item of props.items) {
    height += itemHeights.value.get(item.id) || averageHeight;
  }
  return height;
});

const calculateStartIndex = (scrollTop) => {
  let accumulatedHeight = 0;
  let startIndex = 0;

  // Find the start index
  while (startIndex < props.items.length && accumulatedHeight < scrollTop) {
    accumulatedHeight += itemHeights.value.get(props.items[startIndex].id) || props.itemHeight; // default height
    startIndex++;
  }

  startIndex = Math.max(0, startIndex - 1);

  return startIndex;
};

const calculatePosition = (index) => {
  let top = 0;
  for (let i = 0; i < index; i++) {
    top += itemHeights.value.get(props.items[i].id) || props.itemHeight;
  }
  return top;
};

const handleScroll = (e) => {
  const { scrollTop } = e.target;
  const startIndex = calculateStartIndex(scrollTop);

  let newPositions = [...Array(visible.value).keys()].map((i) => i + startIndex);

  const beforeValues = startIndex < props.extra ? startIndex : props.extra;
  for (let i = 0; i < beforeValues; i++) {
    newPositions.unshift(startIndex - i - 1);
  }

  const afterValues =
    props.items.length - startIndex < props.extra ? props.items.length - startIndex : props.extra;
  for (let i = 0; i < afterValues; i++) {
    newPositions.push(startIndex + visible.value + i);
  }

  const missingNewPositions = newPositions.filter(
    (i) => !positions.value.find(({ itemIndex }) => itemIndex === i)
  );

  if (positions.value.length < newPositions.length) {
    for (let i = 0; i < newPositions.length; i++) {
      if (positions.value.find(({ itemIndex }) => itemIndex === newPositions[i])) {
        continue;
      }
      positions.value.push({
        itemIndex: newPositions[i],
        top: positions.value[positions.value.length - 1].top
      });
    }

    setTimeout(() => {
      for (const position of positions.value) {
        position.top = calculatePosition(position.itemIndex);
      }
    });
  } else if (positions.value.length > newPositions.length) {
    for (let i = 0; i < positions.value.length; i++) {
      if (newPositions.includes(positions.value[i].itemIndex)) {
        continue;
      }
      positions.value.splice(i, 1);
    }
  } else {
    for (const index in positions.value) {
      if (newPositions.includes(positions.value[index].itemIndex)) {
        continue;
      }

      positions.value[index].itemIndex = missingNewPositions.shift();

      setTimeout(() => {
        positions.value[index].top = calculatePosition(positions.value[index].itemIndex);
      });
    }
  }
};

const setItemRef = (el) => {
  if (!el) {
    return;
  }
  const itemId = el.getAttribute('data-id');
  itemHeights.value.set(itemId, el.clientHeight);
};

onMounted(() => {
  generateInitialPositions();
});
</script>

<template>
  <div class="u-haul" @scroll="handleScroll" ref="wrapper">
    <div class="wrapper-height" :style="`height: ${wrapperHeight}px`"></div>
    <component
      :is="itemTag"
      v-for="({ itemIndex, top }, index) in positions"
      :key="index"
      :ref="setItemRef"
      :data-id="props.items[itemIndex].id"
      :style="`transform: translateY(${top}px)`"
      class="item"
    >
      <slot :item="props.items[itemIndex]" :position="top" />
    </component>
  </div>
</template>

<style scoped>
.debug {
  position: sticky;
  top: 0;
}
.u-haul {
  position: relative;
  overflow: auto;
  .item {
    position: absolute;
    width: 100%;
    top: 0;
    will-change: transform;
  }
}
</style>
