<script setup>
import { ref } from 'vue';
import UHaul from './components/UHaul.vue';

const items = ref([]);
for (let i = 0; i < 10000; i++) {
  items.value.push({ id: `id-${i}`, value: `item ${i}` });
}
</script>

<template>
  <UHaul :items="items">
    <template #default="{ item, position }">
      <div style="display: flex; align-items: center; gap: 20px">
        <img
          height="150px"
          src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGIwdzIxaXZpM3F6eTNxcTRlNWl2Zjd0b21qOG1rMzM5dnFla2FvbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/quEsMOrr3hmQ8/giphy.gif"
        />
        {{ item }} - {{ position }}
      </div>
    </template>
  </UHaul>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.u-haul {
  height: 100vh;
}
</style>
