<script setup lang="ts">

</script>

<template>
  <div class="wrapper">
    <img src="@/../public/img/grandmother.jpg"
         title="Нейробабушка добавлена чисто ради шутки, но в итоге она и останется"
    />
    <span class="text">
            Не балуйся
      </span>

  </div>
</template>

<style scoped>
.wrapper {
  max-width: 500px;
  text-align: center
}

.wrapper img {
  width: 100%;
}

.wrapper .text {
  font-size: 2.5em;
  font-weight: bold;
  top: -125px;
  position: relative;
  color: white;
  /*-webkit-text-stroke-width: 1px;*/
  /*-webkit-text-stroke-color: black;*/
  text-shadow:
      1px 1px 0 #000,
      -1px 1px 0 #000,
      -1px -1px 0 #000,
      1px -1px 0 #000;
}


</style>