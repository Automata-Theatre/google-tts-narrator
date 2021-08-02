const textToSpeech = require('@google-cloud/text-to-speech')
const XmlHandler = require('./xml_handler')
const pug = require('pug')
const YAML = require('js-yaml')

class GoogleTTS {
  constructor() {
    this.client = new textToSpeech.TextToSpeechClient()
    this.handler = null
    this.gen = null
    this.totalCount = 0
    this.step = 0
    this.type = null
  }

  async loadScenario(scenario = '', type = 'pug') {
    let scenarioArray = null
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
        scenarioArray = YAML.load(scenario)
        // Then pass to 'json' handler
      case 'json':
        if (!scenarioArray) {
          scenarioArray = Array.from(JSON.parse(scenario))
        }
        this.totalCount = scenarioArray.length
        this.gen = scenarioArray[Symbol.iterator]() // Array 2 iterator
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

      results.push(response)
    }

    return results
  }
}

module.exports = GoogleTTS
