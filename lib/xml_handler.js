const { DOMParser } = require('xmldom')

class XmlHandler {
  constructor(xmlStr = '') {
    this.speakNodes = Array.from(XmlHandler.xml2nodes(xmlStr))
  }

  get size() {
    return this.speakNodes.length
  }

  get textList() {
    return this.speakNodes.map(node => node.textContent.trim())
  }

  get googleApiArray() {
    return this.speakNodes.map(XmlHandler.xmlNode2GoogleApi)
  }

  * yieldGoogleApi() {
    for (let i = 0; i < this.size; i++) {
      const node = this.speakNodes[i]
      yield XmlHandler.xmlNode2GoogleApi(node)
    }
  }

  static xml2nodes(xmlStr) {
    const domParser = new DOMParser()
    const dom = domParser.parseFromString(xmlStr, 'text/xml')
    const speakNodes = dom.getElementsByTagName('speak')

    return speakNodes
  }

  static xmlNode2GoogleApi(node) {
    const audioConfig = JSON.parse(node.getAttribute('audioConfig'))
    const voice = JSON.parse(node.getAttribute('voice'))
    node.removeAttribute('audioConfig')
    node.removeAttribute('voice')

    return {
      audioConfig, voice,
      input: { ssml: node.toString() },
    }
  }
}

module.exports = XmlHandler
