# Google TTS Narrator

[![npm version](https://badge.fury.io/js/google-tts-narrator.svg)](https://badge.fury.io/js/google-tts-narrator)
![Coverage Status](https://img.shields.io/badge/coverage-95%25-brightgreen)
[![NPM](https://img.shields.io/npm/l/google-tts-narrator)](https://www.npmjs.com/package/google-tts-narrator)


Use **[Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)** to convert **[SSML](https://cloud.google.com/text-to-speech/docs/ssml)** (or other types, see below) text into speeches.

[English](./README.md) | [日本語](./doc/ja-JP.md)

## Setup
- Create or setup a Google Cloud project
- Make sure you account's **billing is enabled** ([4 million characters are free each month](https://cloud.google.com/text-to-speech#section-11))
- Enable the Cloud Text-to-Speech API
- Download **Account key**(it is a JSON file)
- Set `GOOGLE_APPLICATION_CREDENTIALS="/FULL/PATH/TO/ACCOUNT_KET.json"` to 

View **[here](https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries#before-you-begin)** for more Infomations

## Install

As a module

```sh
npm i google-tts-narrator
```

As a cli app

```sh
npx google-tts-narrator --from my_scenario.ssml.pug --to my_scenario_sounds/
```

## Scenario File
### [SSML(XML)](https://en.wikipedia.org/wiki/Speech_Synthesis_Markup_Language)
Google Cloud Text-to-Speech only allowed ONE `<speak></speak>` for each call,
this library will analyze your SSML file and call for each `<speak></speak>` elements with different configs.

You need to set `audioConfig` and `voice` attributes for each dialogue, which could found & tested **[here](https://cloud.google.com/text-to-speech#section-2)** and **[here](https://cloud.google.com/text-to-speech/docs/samples)**.


```xml
<speak audioConfig='{"audioEncoding": "MP3", "pitch": 0, "speakingRate": 1}'
  voice='{"languageCode": "en-US", "name": "en-US-Wavenet-G"}'>
  The <say-as interpret-as="characters">SSML</say-as>standard
  <break time="1s"/>is defined by the
  <sub alias="World Wide Web Consortium">W3C</sub>.
</speak>

<speak audioConfig='{"audioEncoding": "MP3", "pitch": 0, "speakingRate": 1}'
  voice='{"languageCode": "en-ES", "name": "es-ES-Standard-C", "ssmlGender": "MALE"}'>
  ¡Hola<break time="200ms"/>mundo!
</speak>
```

Upper scenario file will convert to 2 sound tracks:  
<audio controls src="./doc/assets/demo_1.mp3">
  [demo_1.mp3](./doc/assets/demo_1.mp3)
</audio>
<br/>
<audio controls src="./doc/assets/demo_2.mp3">
  [demo_2.mp3](./doc/assets/demo_2.mp3)
</audio>

### [PUG(was Jade)](https://pugjs.org/api/getting-started.html)
Pug is an indent style HTML template DSL(Domain-Specific Language), it can also compiled to XML files.

SSML upper also could written like below

```pug
speak(
  audioconfig='{"audioEncoding": "MP3", "pitch": 0, "speakingRate": 1}'
  voice='{"languageCode": "en-US", "name": "en-US-Wavenet-G"}')
  | The #[say-as(interpret-as='characters') SSML] standard #[break(time='1s')/]
  | is defined by the #[sub(alias='World Wide Web Consortium') W3C].

speak(
  audioconfig='{"audioEncoding": "MP3", "pitch": 0, "speakingRate": 1}'
  voice='{"languageCode": "en-ES", "name": "es-ES-Standard-C", "ssmlGender": "MALE"}')
  | ¡Hola#[break(time='200ms')/] mundo!
```

Even could separate speakers' settings from scripts, it will made dialogue script more smoothly.  
**[Warning]** Only Cli mode can deal with separated pug files!  

```pug
//- _speaker.pug
mixin enSpeaker(audioConfig = {}, voice = {})
  -
    audioConfig = Object.assign({
      speakingRate: 1.12, audioEncoding: 'MP3',
    }, audioConfig)
    voice = Object.assign({
      languageCode: 'en-US', ssmlGender: 'MALE',
    }, voice)
  speak(audioConfig=audioConfig voice=voice)
    block

mixin jaSpeaker(audioConfig = {}, voice = {})
  -
    audioConfig = Object.assign({
      pitch: 1.6, speakingRate: 1.12,
      audioEncoding: 'MP3',
    }, audioConfig)
    voice = Object.assign({
      languageCode: 'ja-JP', name: 'ja-JP-Wavenet-A',
    }, voice)
  speak(audioConfig=audioConfig voice=voice)
    block
```

```pug
//- include_demo.pug
include _speaker.pug

+enSpeaker Hello!
+jaSpeaker こんにちは！
+enSpeaker Goodbye!
+jaSpeaker さようなら！
```

### YAML(JSON)
You may also create an array of Text-to-Speech params in JSON or YAML  

YAML

```yaml
- &staff # Setup staff
  audioConfig:
    audioEncoding: MP3
    pitch: 1.6
    speakingRate: 1.07
  voice:
    languageCode: ja-JP
    name: ja-JP-Wavenet-A
  input:
    text: いらっしゃいませ。
- &customer # Setup customer
  audioConfig:
    audioEncoding: MP3
    pitch: 1.6
    speakingRate: 1.07
  voice:
    languageCode: ja-JP
    name: ja-JP-Wavenet-D
  input:
    text: チーズバーガーをください。
-
  <<: *staff
  input:
    ssml: |-
      <speak>
        かしこまりました。お召し上がりですか?<break time="300ms"/>お持ち帰りですか?
      </speak>
-
  <<: *customer
  input:
    text: 持ち帰ります。
```

JSON
```json
[
  {
    "voice": {
      "languageCode": "en-US",
      "ssmlGender": "NEUTRAL"
    },
    "audioConfig": {
      "audioEncoding": "MP3"
    },
    "input": {
      "text": "Hello, world!"
    }
  },
  {
    "voice": {
      "languageCode": "en-ES",
      "name": "es-ES-Standard-C"
    },
    "audioConfig": {
      "audioEncoding": "MP3"
    },
    "input": {
      "text": "¡Hola, mundo!"
    }
  }
]
```

## Cli
Make sure `GOOGLE_APPLICATION_CREDENTIALS` is set, and Cloud Text-to-Speech API permission enabled.  

Run command below to generate sound tracks.

```
npx google-tts-narrator -s PATH/TO/FILE
```

System will guess type by your scenario file's extension, and create a directory for sound tracks if not given.

```
Options:
  -s, --from     Your Scenario File Path                              [required]
  -d, --to       Target Directory Path
  -t, --type     Scenario File Type, One of [pug|xml|yaml|json]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
```

## API
Make sure `GOOGLE_APPLICATION_CREDENTIALS` is set, or [set credentials manually](https://googleapis.dev/nodejs/text-to-speech/latest/v1.TextToSpeechClient.html).

```js
const Narrator = require('google-tts-narrator');
const options = { credentials: require('/PATH/TO/credentials.json') }

const scenario = fs.readFileSync('PATH/TO/scenario.pug', 'utf-8');
const gen = Narrator.yieldSpeeches(scenario, 'pug', options);

...
```

API mode only support single file scenario  

### Generate Style
Use Generate Style API to create sounds step by step, it will save the costs.

```js
const fs = require('fs');
const Narrator = require('google-tts-narrator');

const scenario = fs.readFileSync('PATH/TO/scenario.pug', 'utf-8');
const gen = Narrator.yieldSpeeches(scenario, 'pug');

(async () => {
  for await (let speach of gen) {
    const { step } = speach.narratorInfo;
    fs.writeFileSync(`PATH/TO/DIR/${step}.mp3`, speach.audioContent, 'binary');
  }
})();
```

### Async/Await Style
Classical async/await style also can be used to batch create sound tracks.

```js
const fs = require('fs');
const Narrator = require('google-tts-narrator');

const scenario = fs.readFileSync('PATH/TO/scenario.pug', 'utf-8');

(async () => {
  const speaches = await Narrator.fetchSpeeches();
  speaches.forEach((speach, i) => {
    fs.writeFileSync(`PATH/TO/DIR/${i}.mp3`, speach.audioContent, 'binary');
  })
})();
```

## Special Thanks
Ms Rie Ishikawa of [Rose Ladies School](https://twitter.com/RLSvoice) provides all Japanese dialogue samples for kindness.  
All copyrights of Japanese dialogue samples belongs to Rose Ladies School. Rie Ishikawa.

## [LICENSE](./LICENSE)
MIT(Except Japanese Dialogue Samples)
