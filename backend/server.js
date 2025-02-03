const express = require('express');
const cors = require('cors')
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path')
const fs = require('fs')
const os = require('os')

const app = express().use(express.json()).use(cors());

app.get('/api/getOptions', async (req, res) => {
    const url = req.query.url;
    var infoFiltered = [];
    var itags = new Set;

    try{
        var info = await ytdl.getInfo(url);
        info.formats.map(format => (
            {
                format: format.mimeType.split(';')[0],
                quality: format.qualityLabel,
                bitrate: format.bitrate,
                audioBitrate: format.audioBitrate,
                itag: format.itag,
            }
        )).filter(f => f.format != 'video/webm' && f.format != 'audio/webm').forEach(f => {
            if(!itags.has(f.itag)){
                itags.add(f.itag);
                infoFiltered.push(f);
            };
        });

        const audioOptions = infoFiltered.filter(option => option.format != 'video/mp4')
        const videoOptions = infoFiltered.filter(option => option.format == 'video/mp4' && parseInt(option.itag) <= 200)
        
        res.status(200).json({
            thumbnail: info.videoDetails.thumbnails.find(thumb => thumb.width == "1920").url, 
            title: info.videoDetails.title, 
            videoOptions,
            audioOptions
    })

    } catch(error){
        res.status(500).json({msg: 'Ocorreu um erro no servidor!'})
        console.log(error)
    }
});

app.get('/api/download', async (req, res) => {
    const {url, itag} = req.query;
    if(!url || !itag){
        return res.status(400).json({msg: "Ocorreu um erro, os parametros URL e itag são necessarios no URL da requisição!"})
    };

    if(!ytdl.validateURL(url)){
        return res.status(400).json({msg: "Ocorreu um erro, URL invalido!"})
    }

    try{
        const info = await ytdl.getInfo(url);
        const fileName = encodeURIComponent(info.videoDetails.title);
        const format = info.formats.find(f => f.itag == itag);

        if(!format){
            return res.status(400).json({msg: "Formato não encontrado"});
        }

        if(format.mimeType.split(';')[0] == 'audio/mp4'){
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.mp3`);
            return ytdl(url, {format}).pipe(res);
        }

        const audioFormat = info.formats.find(f => f.audioBitrate && !f.qualityLabel);
        const tempAudioPath = path.join(os.tmpdir(), 'temp_audio.mp4');

        if(!audioFormat){
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.mp4`);
            return ytdl(url, {format}).pipe(res)
        }

        const audioPromise = new Promise((resolve, reject) => {
            ytdl(url, { format: audioFormat })
                .pipe(fs.createWriteStream(tempAudioPath))
                .on('finish', resolve)
                .on('error', reject)
        })
        
        await audioPromise;

        const ffmpegProcess = ffmpeg()
            .input(ytdl(url, {format}))
            .input(tempAudioPath)
            .outputOptions([
                '-c:v copy',
                '-c:a aac',
                '-f mp4', 
                '-movflags frag_keyframe+empty_moov'
            ])
            .on('end', () => {
                fs.unlink(tempAudioPath, () => {})
            })
            .on('error', (error) => {
                console.log("OCorreu um erro no ffmpeg: ", error)
                return res.status(500).json({msg: "Ocorreu um erro ao processar o video!"})
            })

            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.mp4`);
            ffmpegProcess.pipe(res)
    } catch(error){
        console.log(error)
    }
});

app.listen(4000, () => {
    console.log('Servidor rodando em http://localhost:4000');
});