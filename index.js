'use strict'

const GoogleTTS = require('./lib/google_tts')

class Narrator extends GoogleTTS {
  static async * yieldSpeeches(scenario = '', type = 'pug', opt = {}) {
    const tts = new GoogleTTS(opt)
    await tts.loadScenario(scenario.toString(), type)
    const textList = tts.textList

    while (true) {
      const { done, value } = tts.gen.next()
      if (done) { break }
      const [response] = await tts.client.synthesizeSpeech(value)
      tts.step++
      value['input']['text'] = textList[tts.step - 1]
      response['narratorInfo'] = {
        step: tts.step, totalCount: tts.totalCount, info: value,
      }

      yield response
    }
  }

  static async fetchSpeeches(scenario = '', type = 'pug', opt = {}) {
    const tts = new GoogleTTS(opt)
    await tts.loadScenario(scenario.toString(), type)
    const { requestDataList: requestList, textList } = tts

    const results = []
    for (let i = 0; i < requestList.length; i++) {
      const value = requestList[i]
      const [response] = await tts.client.synthesizeSpeech(value)
      value['input']['text'] = textList[i]
      response['narratorInfo'] = {
        step: tts.step, totalCount: tts.totalCount, info: value,
      }

      results.push(response)
    }

    return results
  }

  static async fetchSpeechByIndex(scenario = '', type = 'pug', index = 0, opt = {}) {
    const tts = new GoogleTTS(opt)
    await tts.loadScenario(scenario.toString(), type)
    const { requestDataList: requestList, textList } = tts
    const requestData = requestList[index]

    if (!requestData) {
      throw `Element id=${index} not in this scenario`
    }

    const [response] = await tts.client.synthesizeSpeech(requestData)
    requestData['input']['text'] = textList[index]
    response['narratorInfo'] = {
      step: tts.step, totalCount: tts.totalCount, info: requestData,
    }

    return response
  }
}

module.exports = Narrator
