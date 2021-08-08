#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const pug = require('pug')
const YAML = require('js-yaml')
const Narrator = require('./index')
const argv = require('./lib/argv')

let { s: filePath, d: dir, type } = argv

const AUDIO_ENCODING_EXTS = {
  'MP3': 'mp3',
  'FLAC': 'flac',
  'OGG_OPUS': 'ogg',
}

const extname = path.extname(filePath)
const fileName = path.basename(filePath, extname).replace(/\./g, '_')

dir = dir || `./${fileName}_${(new Date()).toISOString()}`
type = type || extname.replace('.', '')

const narrator = new Narrator()

;(async () => {
  if (type.toLowerCase() === 'pug') {
    const scenario = pug.renderFile(filePath) // deal with multi-file pugs
    await narrator.loadScenario(scenario, 'xml')
  } else {
    const scenario = fs.readFileSync(filePath).toString()
    await narrator.loadScenario(scenario, type)
  }

  const speaches = await narrator.fetchSpeeches()
  const digNum = (speaches.length).toString().length // calc length of ID

  if (!fs.existsSync(dir)) { fs.mkdirSync(dir) }

  const fileNameTextList = []
  for (let i = 0; i < speaches.length; i++) {
    const speach = speaches[i]
    const narratorInfo = speaches[i].narratorInfo || {}
    const info = narratorInfo.info || {}
    const text = info['input']['text']

    const audioEncoding = (info['audioConfig'] || {})['audioEncoding'] || 'MP3'
    const audioExt = AUDIO_ENCODING_EXTS[audioEncoding.toUpperCase()]

    const audioName = `${(i + 1).toString().padStart(digNum, '0')}.${audioExt}`
    const audioPath = `${dir}/${audioName}`
    fs.writeFileSync(audioPath, speach.audioContent, 'binary')
    fileNameTextList.push({ audioName, text })
  }
  // Add Scripts text yaml
  fs.writeFileSync(`${dir}/scripts.yml`, YAML.dump(fileNameTextList), 'utf-8')

  console.log(`${speaches.length} Audio contents written to folder: ${dir}`)
})()
