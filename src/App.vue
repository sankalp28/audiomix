<template>
  <div id="app">
    <router-view name="head"></router-view>
    <div class="content-section">
      <router-view />
    </div>
  </div>
</template>
<style>
@import url('//unpkg.com/element-ui@2.13.0/lib/theme-chalk/index.css');
@import url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap');
</style>
