<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/imgs/logo.png" />
    <HelloWorld msg="欢迎" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "HomeView",
  components: {
    HelloWorld,
  },
};
</script>
