<template>
  <div id="gui">
    <div class="mass-bar">100</div>
  </div>
</template>

<script>
export default {
name: "App"
}
</script>

<style scoped>
  #gui {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
  }
  .mass-bar {
    color: saddlebrown;
    font-size: 24px;
    position: absolute;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    user-select: none;
  }
</style>