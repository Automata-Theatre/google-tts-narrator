#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const GoogleTTS = require('./lib/google_tts')
const argv = require('./lib/argv')

let { s: filePath, d: dir, type } = argv

const extname = path.extname(filePath)
const fileName = path.basename(filePath, extname).replace(/\./g, '_')

dir = dir || `./${fileName}_${(new Date()).toISOString()}`
type = type || extname.replace('.', '')

const googleTTS = new GoogleTTS()

;(async () => {
  const scenario = fs.readFileSync(filePath).toString()
  await googleTTS.loadScenario(scenario, type)

  const speaches = await googleTTS.fetchSpeeches()
  const digNum = (speaches.length).toString().length // calc length of ID

  if (!fs.existsSync(dir)) { fs.mkdirSync(dir) }

  for (let i = 0; i < speaches.length; i++) {
    const speach = speaches[i]

    const audioName = `${(i + 1).toString().padStart(digNum, '0')}.mp3`
    const audioPath = `${dir}/${audioName}`
    fs.writeFileSync(audioPath, speach.audioContent, 'binary')
  }

  console.log(`${speaches.length} Audio contents written to folder: ${dir}`)
})()
