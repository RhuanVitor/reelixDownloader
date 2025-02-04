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
        <button @click="getOptions" class="btn-1">Procurar</button>
      </div>
    </section>
    <section class="downloadOptions">
      <p class="videoTitle">{{ title }}</p>
      <img v-if="thumbnail" :src="thumbnail" class="img-1"
      style="
      max-width:80%; 
      width: 400px;
      cursor: pointer;">

      <div class="custom-select" @click="toggleDropdown" v-if="videoOptions || audioOptions">
        <div class="selected">
          {{ selectedOption? `${selectedOption.format} ${selectedOption?.quality || selectedOption?.audioBitrate}` : "Selecione uma opção" }}
          <img src="./assets/svg/arrow.svg" height="30px" style="padding-left: 5px;">
        </div>

        <ul v-show="selectionOpen" class="dropdown">
          <div v-show="videoOptions" class="text-1" style="width: 100%;">Video:</div>
          <li v-for="videoOp in videoOptions" :key="videoOp.itag" @click.stop="selectOption(videoOp)">
            <img src="./assets/svg/video-icon.svg" alt="video-icon" height="20px"> 
            <p style="width: 60%; display: flex; align-items: center; justify-content: center;">{{ `${videoOp.format} ${videoOp.quality}` }}</p>
          </li>
          <div v-show="audioOptions" class="text-1">Audio: </div>
          <li v-for="audioOp in audioOptions" :key="audioOp.itag" @click.stop="selectOption(audioOp)">
            <img src="./assets/svg/audio-icon.svg" alt="audio-icon" height="20px"> 
            <p style="width: 60%; display: flex; align-items: center; justify-content: center;">{{ `${audioOp.format} ${audioOp.audioBitrate}` }}</p>
          </li>
        </ul>
      </div>

      <button @click="download()" class="btn-1" v-show="selectedOption" 
      style="width: 300px;
      height: 40px;
      border-radius: 5px;
      margin-top: 20px;">
        Baixar
      </button>

    </section>

    <p v-if="!thumbnail && !title" 
      class="text-2">Coloque o link no campo acima e as opções de download aparecerão aqui.
    </p>
  </main>
</template>

<script>
import axios from 'axios'
import { saveAs } from 'file-saver';

export default{
  data(){
    return{
      url: '',
      thumbnail: '',
      title: '',
      videoOptions: '',
      audioOptions: '',
      loading: false,
      selectedOption: false,
      selectionOpen: false
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
        this.audioOptions = fetchData.data.audioOptions.map(format => ({...format, audioBitrate: format.audioBitrate + "Kbps"}))

      }catch(error){
        console.log(error.msg)
      }
    },

    toggleDropdown(){
      this.selectionOpen = !this.selectionOpen;
    },

    selectOption(option){
      this.selectedOption = option
      this.selectionOpen = !this.selectionOpen;
    },

    async download(){
      const itag = this.selectedOption.itag
      try{
        const response = await axios.get(`http://localhost:4000/api/download?url=${this.url}&itag=${itag}`,
          {responseType: 'blob'}
        )
        
        let fileName

        if (this.selectedOption.format == 'mp3'){
          fileName = `${this.title}.mp3`
        } else{
          fileName = `${this.title}.mp4`
        }

        saveAs(response.data, fileName)
      }catch(error){
        console.log(error)
        alert("Ocorreu um erro.")
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.selected{
  margin-top: 40px;
  background-color: rgb(31, 31, 31);
  border-radius: 5px;
  width: 300px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: solid #323232 2px;
}

li{
  color: white;
  list-style: none;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.5s;
  height: 40px;
}
  
li:hover{
  background-color: rgb(23, 23, 23);
}

.dropdown{
  background-color: rgb(31, 31, 31);
  border-radius: 5px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.selected{
  color: white;
}
</style>
