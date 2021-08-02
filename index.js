'use strict'

const GoogleTTS = require('./lib/google_tts')

class Narrator extends GoogleTTS {
  static async * yieldSpeeches(scenario = '', type = 'pug') {
    const tts = new GoogleTTS()
    await tts.loadScenario(scenario.toString(), type)

    while (true) {
      const { done, value } = tts.gen.next()
      if (done) { break }
      const [response] = await tts.client.synthesizeSpeech(value)
      tts.step++
      response['narratorInfo'] = {
        step: tts.step, totalCount: tts.totalCount,
      }

      yield response
    }
  }

  static async fetchSpeeches(scenario = '', type = 'pug') {
    const tts = new GoogleTTS()
    await tts.loadScenario(scenario.toString(), type)

    const results = []
    while (true) {
      const { done, value } = tts.gen.next()
      if (done) { break }
      const [response] = await tts.client.synthesizeSpeech(value)

      results.push(response)
    }

    return results
  }

  static async fetchSpeechByIndex(scenario = '', type = 'pug', index = 0) {
    const tts = new GoogleTTS()
    await tts.loadScenario(scenario.toString(), type)
    const requestList = Array.from(tts.gen)

    if (!requestList[index]) {
      throw `Element id=${index} not in this scenario`
    }

    const [response] = await tts.client.synthesizeSpeech(requestList[index])

    return response
  }
}

module.exports = Narrator
