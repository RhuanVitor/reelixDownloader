<template>
  <main>
    <section class="top-box">
      <div class="title-box">
        <h1 class="title-1">Reelix</h1><h1 class="title-2">Downloader</h1>
      </div>
      <p class="text-1">Baixe videos e imagens redes sociais gratuitamente!</p>
      <div class="icons-box">
        <img src="./assets/svg/youtube-icon.svg" height="25px" class="icon">
        <img src="./assets/svg/twitter-icon.svg" height="25px" class="icon">
        <img src="./assets/svg/tiktok-icon.svg" height="25px" class="icon">
        <img src="./assets/svg/reddit-icon.svg" height="25px" class="icon">
        <img src="./assets/svg/instagram-icon.svg" height="25px" class="icon">
      </div>
    </section>
    <section>
      <div class="input-box-1">
        <img src="./assets/svg/link.svg" alt="link-icon" 
        style="height: 27px;
        filter: invert();">
        <input v-model="url" class="input-1">
        <button @click="getOptions" class="btn-1">Baixar</button>
      </div>
    </section>
    <section class="downloadOptions">
      <img v-if="thumbnail" :src="thumbnail" class="img-1"
      style="
      max-width:80%; 
      width: 400px;
      cursor: pointer;">
    </section>

    <p v-if="!thumbnail && !title" 
      class="text-2">Coloque o link no campo acima e as opções de download aparecerão aqui.
    </p>
  </main>
</template>

<script>
import axios from 'axios'

export default{
  data(){
    return{
      url: '',
      thumbnail: '',
      title: '',
      videoOptions: '',
      audioOptions: '',
      loading: false
    }
  },

  methods: {
    async getOptions(){
      if (!this.url){
        alert("Insira um url!")
      }

      try{
        const fetchData = await axios.get(
        `http://localhost:4000/api/getoptions?url=${this.url}`
        )

        this.thumbnail = fetchData.data.thumbnail
        this.title = fetchData.data.title;
        this.videoOptions = fetchData.data.videoOptions;
        this.audioOptions = fetchData.data.audioOptions;

      }catch(error){
        console.log(error.msg)
      }
    }
  }
}
</script>

<style scoped>
main{
  min-height: 96vh;
  width: 98vw;
  margin-top: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.top-box{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px;
}

.title-box{
  display: flex;
}

.icons-box{
  width: 600px;
  max-width: 90vw;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px;
  gap: 15px;
}

.downloadOptions{
  margin: 40px;
  width: 1000px;
  max-width: 90vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
