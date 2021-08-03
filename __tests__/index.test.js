const Narrator = require('../index')

const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)

const testFiles = {
  xml: 'samples/general_demo.ssml.xml',
  pug: 'samples/dialogue_demo.ssml.pug',
  json: 'samples/json_demo.json',
  yml: 'samples/yaml_demo.yml',
}

describe('Test scenario parser', () => {
  for (const type in testFiles) {
    const filePath = testFiles[type]
    test(`Should load ${type} file`, async () => {
      const narrator = new Narrator()
      const scenario = await readFile(filePath)
      await narrator.loadScenario(scenario.toString(), type)

      expect(narrator.totalCount).toBeGreaterThan(0)
      expect(narrator.step).toBe(0)
      expect(narrator.gen.next().value).toBeTruthy()
    })

    test(`Should get text list & request data list from ${type}`, async () => {
      const narrator = new Narrator()
      const scenario = await readFile(filePath)
      await narrator.loadScenario(scenario.toString(), type)

      const { textList, requestDataList } = narrator
      expect(textList.length).toBeGreaterThan(0)
      expect(textList.length).toEqual(requestDataList.length)
      expect(textList[0]).toBeTruthy()
      expect(requestDataList[0]).toBeTruthy()
      expect(requestDataList[0].input).toBeTruthy()
    })
  }
})

describe('Test tts api', () => {
  test('Test generator mode', async () => {
    const narrator = new Narrator()
    const scenario = await readFile(testFiles['xml'])
    await narrator.loadScenario(scenario.toString(), 'xml')

    const gen = narrator.yieldSpeeches()
    const { done, value } = await gen.next()

    expect(done).toBeFalsy()
    expect(value.audioContent).toBeTruthy()
    expect(narrator.step).toBe(1)
  })

  test('Test batch mode', async () => {
    const narrator = new Narrator()
    const scenario = await readFile(testFiles['json'])
    await narrator.loadScenario(scenario.toString(), 'json')

    const speaches = await narrator.fetchSpeeches()

    expect(speaches.length).toEqual(narrator.totalCount)
    expect(speaches[0].audioContent).toBeTruthy()
    expect(narrator.step).toBe(narrator.totalCount)
  })

  test('Test quick api generator mode', async () => {
    const scenario = await readFile(testFiles['pug'])
    const gen = Narrator.yieldSpeeches(scenario.toString(), 'pug')

    await gen.next() // discard 1st result
    const { done, value } = await gen.next()
    expect(done).toBeFalsy()
    expect(value.audioContent).toBeTruthy()
    expect(value.narratorInfo.step).toEqual(2)
  })

  test('Test quick api batch mode', async () => {
    const scenario = await readFile(testFiles['json'])
    const speaches = await Narrator.fetchSpeeches(scenario.toString(), 'json')

    expect(speaches.length).toBeGreaterThan(0)
    expect(speaches[0].audioContent).toBeTruthy()
  })

  test('Test quick api id mode', async () => {
    const scenario = await readFile(testFiles['pug'], 'utf-8')
    const speach = await Narrator.fetchSpeechByIndex(scenario, 'pug', 3)

    expect(speach.audioContent).toBeTruthy()
  })
})

describe('Test error handler', () => {
  test('Throws if not init', async () => {
    const narrator = new Narrator()
    const gen = narrator.yieldSpeeches()

    expect(() => narrator.textList).toThrow()
    expect(() => narrator.requestDataList).toThrow()

    gen.next().catch(e => expect(e).toMatch('loadScenario'))
    narrator.fetchSpeeches().catch(e => expect(e).toMatch('loadScenario'))
  })
})
