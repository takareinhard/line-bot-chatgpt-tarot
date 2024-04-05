const GPT_TOKEN = ScriptProperties.getProperty('CHATGPT-APIKEY'); //ChatGPTのAPIキーを入れてください
const LINE_TOKEN = ScriptProperties.getProperty('LINE-APIKEY');    // LINEのAPIキーを入れてください
const LINE_ENDPOINT = "https://api.line.me/v2/bot/message/reply";
const GPT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-3.5-turbo';
const MODEL_TEMP = 0.5;
const MAX_TOKENS = 512;

// LINEからPOSTリクエストが渡されてきたときに実行される処理
function doPost(e) {

  // LINEからPOSTされるJSON形式のデータをGASで扱える形式(JSオブジェクト)に変換
  const json = JSON.parse(e.postData.contents);
  // LINE側へ応答するためのトークンを作成(LINEからのリクエストに入っているので、それを取得する)
  const reply_token = json.events[0].replyToken;
  if (typeof reply_token === 'undefined') {
    return;
  }

  // ユーザーから送られてきたメッセージを取得
  const user_message = json.events[0].message.text;

  if (user_message.includes('占って')) {
    tarotCardReply(json);
  } else if (user_message === '恋愛運を占う') {
    tarotCardReply(json, "love");
  } else if (user_message === '金運を占う') {
    tarotCardReply(json, "money");
  } else if (user_message === '仕事運を占う') {
    tarotCardReply(json, "work");
  } else if (user_message === '不倫運を占う') {
    tarotCardReply(json, "adultery");
  }
}

function tarotCardReply(json, readingType = "general") {
  const tarot_result = tarotReading();
  const gpt_interpretation = getGptInterpretation(tarot_result.name, readingType);
  lineReply(json, gpt_interpretation, tarot_result.imageUrl);
}


// タロットカード占い処理
function tarotReading() {
  const cards = [
    {
      name: 'カップのページ',
      imageUrl: 'https://main--amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE%E3%83%9A%E3%83%BC%E3%82%B8.png'
    },
    {
      name: 'カップの10',
      imageUrl: 'https://main--amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE10.png'
    },
    {
      name: '皇帝',
      imageUrl: 'https://main--amazing-caramel-3147d7.netlify.app/%E7%9A%87%E5%B8%9D.png'
    },
    {
      name: 'ペンタクルのキング',
      imageUrl: 'https://main--amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE%E3%82%AD%E3%83%B3%E3%82%B0.png'
    },
    {
      name: 'カップのナイト',
      imageUrl: 'https://main--amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE%E3%83%8A%E3%82%A4%E3%83%88.png'
    },
    {
      name: 'ペンタクルの9',
      imageUrl: 'https://main--amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE9.png'
    },
    {
      name: 'カップの2',
      imageUrl: 'https://main--amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE2.png'
    },
    {
      name: 'ワンドの2',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE2.png'
    },
    {
      name: 'カップのエース',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE%E3%82%A8%E3%83%BC%E3%82%B9.png'
    },
    {
      name: 'カップのクイーン',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE%E3%82%AF%E3%82%A4%E3%83%BC%E3%83%B3.png'
    },
    {
      name: 'ワンドの5',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE5.png'
    },
    {
      name: 'ペンタクルの7',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE7.png'
    },
    {
      name: 'ペンタクルの3',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE3.png'
    },
    {
      name: 'ペンタクルの2',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE2.png'
    },
    {
      name: 'ワンドのキング',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE%E3%82%AD%E3%83%B3%E3%82%B0.png'
    },
    {
      name: '力',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E5%8A%9B.png'
    },
    {
      name: 'ワンドの3',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE3.png'
    },
    {
      name: 'ペンタクルのクイーン',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE%E3%82%AF%E3%82%A4%E3%83%BC%E3%83%B3.png'
    },
    {
      name: '愚者',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E6%84%9A%E8%80%85.png'
    },
    {
      name: 'カップの6',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE6.png'
    },
    {
      name: 'ワンドのクイーン',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE%E3%82%AF%E3%82%A4%E3%83%BC%E3%83%B3.png'
    },
    {
      name: 'ペンタクルの7',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE7.png'
    },
    {
      name: 'ソードの7',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE7.png'
    },
    {
      name: '正義',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E6%AD%A3%E7%BE%A9.png'
    },
    {
      name: 'ワンドの6',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE6.png'
    },
    {
      name: 'ソードのキング',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE%E3%82%AD%E3%83%B3%E3%82%B0.png'
    },
    {
      name: '星',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E6%98%9F.png'
    },
    {
      name: 'ペンタクルの10',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE10.png'
    },
    {
      name: '戦車',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E6%88%A6%E8%BB%8A.png'
    },
    {
      name: 'ワンドの4',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE4.png'
    },
    {
      name: 'ペンタクルのエース',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE%E3%82%A8%E3%83%BC%E3%82%B9.png'
    },
    {
      name: 'カップの10',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE10.png'
    },
    {
      name: '月',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E6%9C%88.png'
    },
    {
      name: 'ワンドの7',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE7.png'
    },
    {
      name: '運命の輪',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E9%81%8B%E5%91%BD%E3%81%AE%E8%BC%AA.png'
    },
    {
      name: 'ソードの2',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE2.png'
    },
    {
      name: 'ソードの3',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE3.png'
    },
    {
      name: '女帝',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E5%A5%B3%E5%B8%9D.png'
    },
    {
      name: 'ワンドのページ',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE%E3%83%9A%E3%83%BC%E3%82%B8.png'
    },
    {
      name: '魔術師',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E9%AD%94%E8%A1%93%E5%B8%AB.png'
    },
    {
      name: '悪魔',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E6%82%AA%E9%AD%94.png'
    },
    {
      name: 'ソードの6',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE6.png'
    },
    {
      name: '恋人',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E6%81%8B%E4%BA%BA.png'
    },
    {
      name: '死神',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E6%AD%BB%E7%A5%9E.png'
    },
    {
      name: 'ソードの8',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE8.png'
    },
    {
      name: 'ワンドのエース',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE%E3%82%A8%E3%83%BC%E3%82%B9.png'
    },
    {
      name: '吊るされた男',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E5%90%8A%E3%82%8B%E3%81%95%E3%82%8C%E3%81%9F%E7%94%B7.png'
    },
    {
      name: 'ペンタクルのページ',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE%E3%83%9A%E3%83%BC%E3%82%B8.png'
    },
    {
      name: 'ペンタクルのナイト',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE%E3%83%8A%E3%82%A4%E3%83%88.png'
    },
    {
      name: 'ソードの9',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE9.png'
    },
    {
      name: 'ワンドのナイト',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE%E3%83%8A%E3%82%A4%E3%83%88.png'
    },
    {
      name: 'ソードのエース',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE%E3%82%A8%E3%83%BC%E3%82%B9.png'
    },
    {
      name: '審判',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E5%AF%A9%E5%88%A4.png'
    },
    {
      name: 'カップの3',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE3.png'
    },
    {
      name: 'ワンドのクイーン',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE%E3%82%AF%E3%82%A4%E3%83%BC%E3%83%B3.png'
    },
    {
      name: 'カップのキング',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE%E3%82%AD%E3%83%B3%E3%82%B0.png'
    },
    {
      name: '節制',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E7%AF%80%E5%88%B6.png'
    },
    {
      name: '女教皇',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E5%A5%B3%E6%95%99%E7%9A%87.png'
    },
    {
      name: '教皇',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E6%95%99%E7%9A%87.png'
    },
    {
      name: 'ペンタクルの5',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE5.png'
    },
    {
      name: 'ソードの4',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE4.png'
    },
    {
      name: 'カップの4',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE4.png'
    },
    {
      name: 'カップの5',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%AB%E3%83%83%E3%83%97%E3%81%AE5.png'
    },
    {
      name: 'ワンドの8',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE8.png'
    },
    {
      name: '塔',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E5%A1%94.png'
    },
    {
      name: 'ソードの10',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE10.png'
    },
    {
      name: 'ソードのページ',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE%E3%83%9A%E3%83%BC%E3%82%B8.png'
    },
    {
      name: '太陽',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E5%A4%AA%E9%99%BD.png'
    },
    {
      name: 'ワンドの9',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE9.png'
    },
    {
      name: 'ソードの5',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE5.png'
    },
    {
      name: 'ペンタクルの8',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE8.png'
    },
    {
      name: 'ソードのナイト',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%82%BD%E3%83%BC%E3%83%89%E3%81%AE%E3%83%8A%E3%82%A4%E3%83%88.png'
    },
    {
      name: 'ペンタクルの4',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE4.png'
    },
    {
      name: '世界',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E4%B8%96%E7%95%8C.png'
    },
    {
      name: 'ワンドの10',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%AF%E3%83%B3%E3%83%89%E3%81%AE10.png'
    },
    {
      name: '隠者',
      imageUrl: 'hhttps://amazing-caramel-3147d7.netlify.app/%E9%9A%A0%E8%80%85.png'
    },
    {
      name: 'ペンタクルの6',
      imageUrl: 'https://amazing-caramel-3147d7.netlify.app/%E3%83%9A%E3%83%B3%E3%82%BF%E3%82%AF%E3%83%AB%E3%81%AE6.png'
    },
    // 他のカードデータを追加
  ];
  const selected_card = cards[Math.floor(Math.random() * cards.length)];
  return selected_card;
}

// ChatGPTでタロットカードの解釈を生成
function getGptInterpretation(card_name, readingType = "general") {
  let user_content;
  switch (readingType) {
    case "love":
      user_content = 'あなたは占い師です。タロットカードで「' + card_name + '」のカードが出てきた時の、恋愛運を占って下さい。日本語で300文字以内で文章が完結するようにお願いします。';
      break;
    case "money":
      user_content = 'あなたは占い師です。タロットカードで「' + card_name + '」のカードが出てきた時の、金運を占って下さい。日本語で300文字以内で文章が完結するようにお願いします。';
      break;
    case "work":
      user_content = 'あなたは占い師です。タロットカードで「' + card_name + '」のカードが出てきた時の、仕事運を占って下さい。日本語で300文字以内で文章が完結するようにお願いします。';
      break;
    case "adultery":
      user_content = 'あなたは占い師です。タロットカードで「' + card_name + '」のカードが出てきた時の、不倫運を占って下さい。日本語で300文字以内で文章が完結するようにお願いします。';
      break;
    default:
      user_content = 'あなたは占い師です。タロットカードで「' + card_name + '」のカードが出てきた時の、今日の運勢を占って下さい。日本語で300文字以内で文章が完結するようにお願いします。';
  }

  const messages = [{ "role": "user", "content": user_content }];
    const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + GPT_TOKEN
    },
    payload: JSON.stringify({
      model: MODEL_NAME,
      messages: messages,
      temperature: MODEL_TEMP,
      max_tokens: MAX_TOKENS
    })
  };
  const response = UrlFetchApp.fetch(GPT_ENDPOINT, requestOptions);
  const res = JSON.parse(response.getContentText());

  // ChatGPTから返却されたメッセージを返す
  return res.choices[0].message.content.trimStart();
}

// LINEへの応答（画像付き）
function lineReply(json, replyText, imageUrl) {

  // 応答用のメッセージを作成
  const message = {
    "replyToken": json.events[0].replyToken,
    "messages": [
      {
        "type": "image",
        "originalContentUrl": imageUrl,
        "previewImageUrl": imageUrl
      },
      {
        "type": "text",
        "text": "Card images are © Copyright U.S. Games Systems, Inc"
      },
      {
        "type": "text",
        "text": replyText
      },
      {
        "type": "text",
        "text": "さらに詳しい占いはチャット占い・電話占いにて！\nhttps://www.taka-fortune.com/fortune-menu"
      }
    ]
  };

  // LINE側へデータを返す際に必要となる情報
  options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json; charset=UTF-8",  // JSON形式を指定、LINEの文字コードはUTF-8
      "Authorization": "Bearer " + LINE_TOKEN           // 認証タイプはBearer(トークン利用)、アクセストークン
    },
    "payload": JSON.stringify(message)                    // 応答文のメッセージをJSON形式に変換する
  };

  // LINEへ応答メッセージを返す
  UrlFetchApp.fetch(LINE_ENDPOINT, options);
}
