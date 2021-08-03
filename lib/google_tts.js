const textToSpeech = require('@google-cloud/text-to-speech')
const XmlHandler = require('./xml_handler')
const pug = require('pug')
const YAML = require('js-yaml')

class GoogleTTS {
  constructor(options = {}) {
    this.client = new textToSpeech.TextToSpeechClient(options)
    this.handler = null
    this.jsonData = null
    this.gen = null
    this.totalCount = 0
    this.step = 0
    this.type = null
  }

  get textList() {
    if (this.handler) {
      return this.handler.textList
    } else if (this.jsonData) {
      return this.jsonData.map(data => {
        if (data.input.text) {
          return data.input.text
        } else if (data.input.ssml) {
          return XmlHandler.xml2nodes(data.input.ssml)[0].textContent.trim()
        } else {
          return null
        }
      })
    } else {
      throw 'Plz run `loadScenario()` before call this func'
    }
  }

  get requestDataList() {
    if (this.handler) {
      return this.handler.googleApiArray
    } else if (this.jsonData) {
      return this.jsonData
    } else {
      throw 'Plz run `loadScenario()` before call this func'
    }
  }

  async loadScenario(scenario = '', type = 'pug') {
    this.type = type.toLowerCase()
    switch (this.type) {
      case 'pug':
      case 'jade':
        scenario = pug.render(scenario)
        // Then pass to 'xml' handler
      case 'xml':
      case 'ssml':
        this.handler = new XmlHandler(scenario)
        this.totalCount = this.handler.size
        this.gen = this.handler.yieldGoogleApi()
        break
      case 'yml':
      case 'yaml':
        this.jsonData = YAML.load(scenario)
        // Then pass to 'json' handler
      case 'json':
        if (!this.jsonData) {
          this.jsonData = Array.from(JSON.parse(scenario))
        }
        this.totalCount = this.jsonData.length
        this.gen = this.jsonData[Symbol.iterator]() // Array 2 iterator
        break
      default:
        throw '`type` must in one of [pug|xml|yaml|json]'
    }
  }

  async * yieldSpeeches() {
    if (!this.gen) {
      throw 'Plz run `loadScenario()` before call this func'
    }

    while (true) {
      const { done, value } = this.gen.next()
      if (done) { break }
      const [response] = await this.client.synthesizeSpeech(value)
      this.step++

      yield response
    }
  }

  async fetchSpeeches() {
    if (!this.gen) {
      throw 'Plz run `loadScenario()` before call this func'
    }

    const results = []
    while (true) {
      const { done, value } = this.gen.next()
      if (done) { break }
      const [response] = await this.client.synthesizeSpeech(value)
      this.step++
      response['narratorInfo'] = {
        step: this.step, totalCount: this.totalCount,
      }

      results.push(response)
    }

    return results
  }
}

module.exports = GoogleTTS
