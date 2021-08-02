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
      response['narratorInfo'] = {
        step: tts.step, totalCount: tts.totalCount,
      }
      tts.step++

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
}

module.exports = Narrator
