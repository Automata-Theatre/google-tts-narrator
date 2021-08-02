# Google TTS Narrator

[![npm version](https://badge.fury.io/js/google-tts-narrator.svg)](https://badge.fury.io/js/google-tts-narrator)
![Coverage Status](https://img.shields.io/badge/coverage-95%25-brightgreen)
[![NPM](https://img.shields.io/npm/l/google-tts-narrator)](https://www.npmjs.com/package/google-tts-narrator)

**[Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)** を利用し **[SSML](https://cloud.google.com/text-to-speech/docs/ssml)** (またはその他形式)の脚本を読み上げるプログラムです。


[English](../README.md) | [日本語](./ja-JP.md)

## 環境設定
- Google Cloud Consoleにプロジェクトを作成します
- Cloud プロジェクトに対して**課金が有効になっている**ことを確認します([毎月最初の400万文字が無料](https://cloud.google.com/text-to-speech#section-11))
- Cloud Text-to-Speech API を有効にします
- **アカウント キー**(JSONファイル)をダウンロードします
- 環境変数 `GOOGLE_APPLICATION_CREDENTIALS="/FULL/PATH/TO/ACCOUNT_KET.json"` になるようにセットします

詳しくは **[こちら](https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries#before-you-begin)** をご覧ください。

## Install

モジュールとして

```sh
npm i google-tts-narrator
```

Cliアプリとして

```sh
npx google-tts-narrator --from my_scenario.ssml.pug --to my_scenario_sounds/
```

## シナリオファイルの書き方
### [SSML(XML)](https://en.wikipedia.org/wiki/Speech_Synthesis_Markup_Language)
Google Cloud Text-to-SpeechのAPIは一回のCallに `<speak></speak>` 要素一つしか対応しておりません。
このライブラリーはお手元のSSMLファイルを分析し、各 `<speak></speak>` 要素にそれぞれ異なるConfigでText-to-Speech APIにアクセスします。

但し、それぞれの `<speak></speak>` 要素に `audioConfig` と `voice` のプロパティーを設置しなければなりません。設置の仕方は下記のサンプルをご覧ください。また **[こちらのページ](https://cloud.google.com/text-to-speech#section-2)** や　**[こちらのページ](https://cloud.google.com/text-to-speech/docs/samples)** では、使用可能な条件を紹介しており、テストができます。

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

上記シナリオは以下の２本MP3に変換されています。

<audio controls src="./assets/demo_1.mp3">
  [demo_1.mp3](./assets/demo_1.mp3)
</audio>
<br/>
<audio controls src="./assets/demo_2.mp3">
  [demo_2.mp3](./assets/demo_2.mp3)
</audio>

### [PUG(was Jade)](https://pugjs.org/api/getting-started.html)
PugはインデントスタイルでHTMLを書けるDSL(Domain-Specific Language)です。
HTMLだけでなく、XMLの作成も用いられます。


前述したSSMLファイルは以下のように書き直せます。

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

その上、語り手の設定を独立したファイルに分割して、会話の見通しをよくすることができます。
**[警告]** モジュールとして利用する場合、分割したpugファイルは読み込めません。

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
またJSONやYAMLファイルにて、Text-to-Speech API用の変数を配列にして一括処理できます。  

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
環境変数 `GOOGLE_APPLICATION_CREDENTIALS` を設定してから実行してください。

下記のコマンドで合成音声が生成されます。

```
npx google-tts-narrator -s PATH/TO/FILE
```

シナリオファイルPath以外、何も設定していない場合、システムは拡張子よりタイプを算出し処理を行い、出力フォルダも自動で作成します。


```
Options:
  -s, --from     Your Scenario File Path                              [required]
  -d, --to       Target Directory Path
  -t, --type     Scenario File Type, One of [pug|xml|yaml|json]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
```

## API
環境変数 `GOOGLE_APPLICATION_CREDENTIALS` を設定するか、下記のように[手動で認証ファイルを設置](https://googleapis.dev/nodejs/text-to-speech/latest/v1.TextToSpeechClient.html)します。


```js
const Narrator = require('google-tts-narrator');
const options = { credentials: require('/PATH/TO/credentials.json') }

const scenario = fs.readFileSync('PATH/TO/scenario.pug', 'utf-8');
const gen = Narrator.yieldSpeeches(scenario, 'pug', options);

...
```

また、APIとして利用する場合、single fileのみ対応します。


### Generate Style
ジェネレーターを使って音声を１ステップずつ合成できます、途中でやめられるので、時間や経費の節約につながります。

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
async/await スタイルのAPIを使って、シナリオを一括変換することもできます。

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
本プロジェクトのサンプルに使う日本語対話サンプルは **[Rose Ladies School](https://twitter.com/RLSvoice)** の **石川りえ先生** のご厚意より寄贈されております。  
該当部分の著作権は[Rose Ladies School](https://twitter.com/RLSvoice)の石川りえ先生に帰属します。

## [LICENSE](./LICENSE)
MIT(日本語対話サンプルを除く)
