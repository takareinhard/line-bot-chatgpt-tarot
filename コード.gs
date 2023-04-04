const GPT_TOKEN = ScriptProperties.getProperty('CHATGPT-APIKEY'); //ChatGPTのAPIキーを入れてください
const LINE_TOKEN = ScriptProperties.getProperty('LINE-APIKEY');    // LINEのAPIキーを入れてください
const LINE_ENDPOINT = "https://api.line.me/v2/bot/message/reply";
const GPT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-3.5-turbo';
const MODEL_TEMP = 0.5;
const MAX_TOKENS = 256;

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

  // ユーザーからのメッセージが「占って」と一致する場合
  if (user_message === '占って') {
    // タロットカード占い処理を実行
    const tarot_result = tarotReading();
    const gpt_interpretation = getGptInterpretation(tarot_result.name);
    lineReply(json, gpt_interpretation, tarot_result.imageUrl);
  } else {
    // （略）通常の対話処理を実行
  }
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
    // {
    //   name: 'ペンタクルのナイト',
    //   imageUrl: 'https://lh3.googleusercontent.com/Y5JaWe9c5Q42FfHhYBfOhoYvFXPanVBnzfyvGcTzIlUNXkBpRvOOJitQqlpv7fQSByaYNgBXyIZAPO6hC6iY66LIH1eak4CUKwR6CyUWuLDabhODPhp0mVUuauGbUSKi9tAz00Tt-LWsT1IGYBFHfS1WMTN6Lpug6sjCg1JQttfJi1__uejZ0cHXA6Pry7tfqwmwf7AFJU3LHLWRRI1Az8E5wtcu4JhGM34febohn4EHhjnhUrUuREmtow0D9jtZk7wwIOrt8USRSr2MTplyOo9WvBWDgA4js-SoqzWWZ3J7BWeHt80bTEehQ50vnileFk9MImYYRQpg5NvJtpVDwKqpI8tLxrhJK4pgeeUVlGGOtCmqK8oe4nkl0qjxO0-cwDFeS9DaNm3M2k3EPsMGZcHG40CvSzCOsLkeQ8JBjxPXoe3YbmsFA9mz-v5GnB-cWhF5VUwZ79q7GjRypACU-aVM7X_qfKbcMfkK6qnruVPHFzoJc6203ItJrbhaUo-Vwbut-6a9A_-iY9SQdaWODv8GwyawgnHU-7RQzDwG_0nFaxA11aYyEi_K_xDD97i5I6T5YqYNRrShv8oednq0rrbIAMwDKtrdEhsc9gA9A2IEoXhRFF9Ht0Ky1OcujlQDd9-3e5dFDPnzsCa-4opZ9Cwy7JDxDkoR_dYmtMYZTvvu3WbcRq3FYKVbZjzNIMBOZ9oq3TVhdCMr20ndwBZIhwbnJ595ngyrSqjiRixAXcOK-sIm1QABdF-LoCAldaFI7R1ZbjroBT2Ud0Mev2F0i5SYQGgklAmmfIrU41UJpI6xItb8GWoJgYLY_7kFMB8uUVGA1iWPNOUlN-NpLJvHpSgnBZFfFwWShs6tJ7680wswlOQk5jdhqdYHjFHqVTUE0E3Z1GTz44v4XfmDjmq7MPWFaIrFIfGfvzEDXC-e6B1Ygrr-aqzUpuIofwMLQFqPkYi0fHc0AXrNaHmUQFiXPVjtZ9t0IiTeiNEHYUfdn6FCJT9CxgmfJIaCiRLGCOjCCuCZd5HlD9ZYxXQiWfK7_Ir6nfpncfSKl2pJQsWEZhxChR5bTPHgz6sWCAqVm23tlmTHeSJON_9GZ99d2AMvoLGlUfI5mFkrkkztrFDqBEiCrg8jKNQyHwH3t0siLVgIdTz7hjQ=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'ソードの9',
    //   imageUrl: 'https://lh3.googleusercontent.com/LZXgAxMlvaajwnx4TJ6SvcrAU8Jucx_PcekVJBT2mPBYgeWm7TKRdlGTuLjsGvZJZYQ2uiLdsMy2-SW57weLITY0-rbkvRfwy-LoXD3K0IPYasUygaeM_-eylTUyxNiNu3RFcO94JyvOcvS2RCV-quK9DMiR7E3tSSUjGfSpkTBIRTfH44DRKwjyGWD9QwzSG_s3iRGBkB4axyvUcU_4QZC0_j49GrjtXRvEyBCl_24x2hRoWT8YbhelY4HtQTEpeXxW6bc7zw3yHZWtl6wWjNBpcSjHcx7T9r0W1A3P3ZK5P0g8T3Xdi5zHSFawgtcUWYYzt27stVWRGyB6Q0GLqt1IjwmTePskOQEzE8R33Wwa9Ed0W-adwlAPJ4dkwkPcCYI1jtU8awkUeD_RRKW-VckPfu80pZ28z6pDl1sZvHuCXHD6vbPZVvbO7-9xlH0iOLTtNQnp-0Sl_5nP82yc7AWOfgemxfugprfyZV527hB5KCyov6Sq38iWM4_SRhLFqJVIGsGM0KXaG_-IO6uXEwvJ2ZzrIBw1vOMa4iO5_O58gEmXp1H9_yoAnBARINrWiA_68vk2MdgmDj1gJa9b4UzBJ9I09Ne_Eeuc0VGItZfAOlxj0QKUPZCyKrg168Mxu2ij-FvjDjdM08HXsiMAnzTltOEM-_CupmVXskkuh_dWMpEXDSx_FXcOCohY37dIGyS3RkVhJQWRfIChq8Ifs2d-Fu8JFGDoB3KW0jIJEqfDVq9Q9kNbD3rtbNNevWq3oK4HqDzaElhn8_VjTUvTadETmJZMHGN7ih93mLBXsGvq6a9hkvmt-vWG5zP-rpJXsfTPMrCcx95MYQa_MWwlYyHmT_kbQ0dYxZqEqrUWOVEw_mfv-3vJW5LDFjpy8D7C9f9aRf-IxNDEPyMDKtmeyQurVRCdn_9pwEeSVSKQuTRcl35JcRbzQZe7T0Xbzo74w8gm5xR02DxGArUGbzFP_sSV8C74JzqygtX8x5JPlXCKMlN3tRbdkruBkymcTTSNA9w1-681AtAZXeQ8NBlEYOgZEP9moJWZk-3JtROCVA0-XS7ZlWVHsDvjBgnBL3k36JwK4zJsSNPkL23W840TzLOU56eBAV0tUMawYkiiriIvT0lGLxdnyTZ_Z_iaJ9RXfQ5vFUM=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'ワンドのナイト',
    //   imageUrl: 'https://lh3.googleusercontent.com/PENlNZkGKTVI1gsTLyBGe3837s-QpZRMispLz28sjAtU8LSs2kbaAgf_ibFE3AmatpitLdoatCVs0nuu0cxbQ5D0OKq53UKN6IY4p8DEURxqetDEJJ5oGZynmcs55O1F89svXgN4TIBAPlPfPemvYJ8Z__aTBYDggzhSNfc1uyoBBagjpPwBnbyM6GdX1kN9Q9Z4NoFvdDegx1K5lu8AbJ0foUjmLuuxEV3mNwUcvaQ5D8gOXnHqSzu_k-TkgaiyPXX9F6BP9XgwWasOhVR1XFdN744k7V5ZguW_kFT2wIjbmS2gziSAzGQWehGoK4YFAWy48bx4IPZ0nPSzFHc1aMdfpJAiwDjUqnwtC5rEzusjAG4dXUp8mPckOqe66J4kDrpgxOrYck4Giq7L_TfSOWa8pji3cHDvT99EQK11bFqZEARjmkMK5Qea1Yj75oL_Mz76ir2MOfE5DcLUHK9fkadDYzawIXclsTd2zzer9ZPnqx8w8cE4vRTlw4HRCZ1AxDGOMuAYRmvVA_rZxMhrs3bJSI4JrZmJwharv25EVNpghkej6uTUQSQimyQRNGgDFMhTSQg-F3gY-KwqzIf8qKiTuoOZ3PvRiFnUoN4LLMUaStY525mB1DbwQZRkjHwJFHAJR5LzM7mtgQRY7dLDsjg7x41FDu_thaDL5CmeWTIS47jcCWcU-ZTRwSJxHK5d1WLxP15uR-vgrhqFQxWJHAFwkZBdgrG480s5vQ0usKt3StDxx1k76ISQNoWLITDTX7S7NVhdiYWSlBD3Ar8ZtvCMnFk8l5jS90snElc94o-DWaEi0Yoo7QxnT6-AHmPwHCbtVg1Zo-COlasAvUzCz4qOAxnxTaw8-Ac3WyTtljgpcApgPL_an6m_wFH_xhymCRwbU9MEiQrNrWY9J2u_wVrnW5mfdjLa-NSLLSyEJWPF0kJHd_WhM1WDwg6eLVOuCDptg5AQd14LBpS78bUk2Bc9VcYy59BsmqwdaXWNNLAVsxJ-V4mEtDDsLJ-DvdGJ_-CnTaxqx-5umLKbZFiBuRcjLj_5jh1ARx_UDAQOWhrmlngNclJPl2XySr6zT8UAezB6qNyjrAt1h18gNw6JFcbGT5jKy4roDHGfH9Y5MZ6-wJVBzIeTRhqJM3dwEL2GbKmdPLE=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'ソードのエース',
    //   imageUrl: 'https://lh3.googleusercontent.com/4EbMSSzeHf031TK7hJ-78ZXW0y961JozpOHWDhV-0L7T5YmkT6AifUXaVQaOickOfFvdip6MrbJc6ZoB4z-SEtqewhWKMiceTtk-ju5a9TjJwlclL4VXznSL8ZLZ1W_nx9aMbQ9NC7ga9GdfRVDOSnT-s1556Nanm6PEqGo7N3N61YNrCGppnNAmVvHqJcyedVIXu5bTEoFxP9PMhTZ6WtjsxYPl4RIve7Se9rjM3_imLK8nARFsdjB4UYJaVWSFOHCoth0zGk6KSuUL2dTRxlYmgA1gPDHcYjCdm7JF-oH2U2JY7b3l678jvN01NZyEn5whs-NzqgZCJgD3QvNfPPbPyfGs78UpGxbDB8ciu0IZAY12h0pDShP0NXrZl5bPysqekMgvsHh_wnpzhgICPW_tifYc0S3DUA-ksUHOqQqq3uvloB5ZYgwYSWPJm0xIvR4tfr3iCtIRnyQQ2d0Hol2F2qosNf08XbyA2Cho1WOJm8VF-QOcxj_Idh4EeFJQxgPChYH4fQI7qDpXRUOxd03v16kYmhryeFjt866jby_1OVxXDNoRisU8lZ4t6aBRpf3AEKXpXxviFovTCSMQWNsD_ZfQrapjA_3ZbXj6rkbTfZhuXD4tx5nN-YtzUTm1n3se-S9SpgbUmc41MHrVCxkWPz4FbgHEWFpwSpGyDkp3rsU_Ktz7hoG4toFRgEEh709v_fDVFM3BbTBmSQJCOPI-FvAHezbVH9G9GZuGnrdqu0lvTfD6nUZIdQA5v2_ZPUEVt9cMuG0QEuS80m7TCy7giqO0w5VqbuKWEvIzpjOOq9V4yzKODBJDfZ-D1CL8zdCw8iivDf1cwqO6lh5aunKWGmXUTirBCesPIqcamayzRGYj_JiPen6M5fzYZY92YsaGDr05K9xEFfyc007zGnP6EI7Bslszk4jYS6zkAuDQjVLSL3cYyCN9YfxJt3U00QhxSJPOLYbqihJZzfndXIzF7K3fiB7xNfWX1RpG19wzaLgn9DVPADVj1KkOleNao9yWCMGP2bhNEQ4-6J57i_z_1ULkEqguQX2PbBUShHIIrCNY0p8g3d3kzCl-8F1EtdRShHHA9HBsgMCMy6W-dv6tm1u9ERvM-yqpwiF963103aPADFB7a6WJlL4gTMwdqgpZp7o=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: '審判',
    //   imageUrl: 'https://lh3.googleusercontent.com/I1oSzO0rAFrqX3tnvlvGp_jnA8gQj74hFnVUSRb1uyjUhy9PpZVoN4rtiw-PVLHJo4WrECyBo6FCB1k7vUZEdGKnZKw64FqWRBBgUj52LwR0vTWB1YmEFDiiXWA7YyaMXezrqotHu3wxW6AyYJCwGD_Vu61f_S6LfazEd3n_WVF2SorSK5vIf5mMem84z0Okr5pqprCR3PsArznmVh0QZ0TOkbr5fu6OPjse4vOMfCmfXh7_gKMHNI41k-j6w6awCiaaA4Gi23SLPXh_vz70vnSmshjoMlrWuT4dRnmTz0lmy6_h0NH8AAmgOXoH0AQnN3SthCe9_Swg0KHcZlT8hMHoBtpX-cSO053-DniBGHFwByabctYgVn2rLLR3PfbBaeUvbirLJ6l3cL3PrjmMW61H49G1r0sDAzYMXAJiqQnOJWk5csq4D0clE74rdzhrI0KRHtNHhAYiHIVNMYGoDM9T1LNS-BrDJ6VyMZTocsyo3zH-KX6McVwi5GemMQ8sWPwkq_HMIyliOv4Ac8AG3P0VkP6nsAxXqY2G4mz3cfB3OV4s_lLwEfBck0PG2THdZZ1H6Miw2wP6_QZ6eb1NGMcXGj7dQx3-thB8rZe_OPxA0fuOPNBEmOpZuHHn5vKJmUqPxC9MjiCrY4u6g9tyre5pqyeXxaS_EmdOblo21MmqezQfuR0dSqpKuP39eUngvfHmWhJ-uwv6M3Vn9nOdES7oIhMqFajBZx2Kmm0ZsnrQEtfGv6yLmBhQtjtt8PfQYUKkLYINmsUY7fspArP6Sosmw0TnKC8TNHigHrLDVJXM_M076UqEbg-MCqpS1aKCmuYVA4wZbW_p15RdIiZdYMcIxsQLwIVzQTb1H-nkcZhRs5nF4nEIhFXjJU0pEphx0yenmHQ_LGzaGK-tGugiP8nlehf1jjPPXOZlzNbiiO6jdm-JrmEQiR4GykuSqdBUjhfg9BQFtU6kBY2uIlGvk5AFKmdVtRXWSniChZ6TZWvi-bAvNNbmTxU30u0CcP-eQka9Li7XtRm4MkSjBsJ5-y0Px5Siu4l1rV9LkC8cmH5h0_TeWWaBkuccCRnOin-SkYQPL1mGy5RhosscoEFzRljdCb6zsMez9c2qUHHBYDS2MnagfPzMcfRALPtYoYRth7CRpcU=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'カップの3',
    //   imageUrl: 'https://lh3.googleusercontent.com/S2mmMnY-7y2nZwgibyFDv4oJlrQ1n5hx30FMuMKivX5Mw55aDH3u-qvcvCHRH1FyRQRbRDIHlh8Tgcte5ewwQKYqpr7b7Q7P1iQ2_P_euLNLI2JQLirOx4yb-cVZD1J-BICubeTDPXLRWRQESM4Z0GlXvhbfnQo2TN1MORLeVDOGbQvl9nLynCJCKCDR17RL_VFcNth0Ingkt7NqyGvKeR2jlNl-NPcyvcMDjcNKtDtgJ3E3FYKrjCuzoTuFTUoQLzd3gfwam-MppGRbSLn0MWklFWSOQXSskL3g8aLjEoVYFzvm0DXo6SB5F03z21Y2XzwqpzaHghelZmJUyGI1Z2QLMyKCW5V0m0rFC2cc4r-RwDFMzDIvcSbO1pJdV8zDCDvCnj7iscgfsA0CmBWtrkYvoW0FO3bmuX54aQVerlnktpNbNGJ2eC3tObL_aLF0B7dmg-18J1zHZ0rsiCCEzrRLqSW79_spwZsQbgZIWABb6-XFca6e2qU06b3VfyAvn7reeM79He305rISKF8gmnjZGdWyvEyyeqAfCGItyjOk-upGcCPcw6lg7YRWGdXR7i3_-Lj9h8Pp5tht-7x2UP8JnjYr47KoweQKpvO9Aob1gfCwQ_X5GBwispuDg0pSFzmV5Y9GVRgFOkSdgVXNnWyE_5DWGss-xMW_LLZtkVXnYr9_tNey2Px1ieQo5bGFb9iqW_EXpX9G6fsWtOJuhJLs_atF5eFevYIikb0yLzfh2SaV3u8l8kD5JfpxIhljKw1qxrleVWDF6yx32NTslAkCpB9BDEoafpTI0PM64LgL0X1bf8j_7YNZNLns0pVN0DpezsgUw2V6SkSw_3RPtBABKyNg6nTQlSJKItAugBj-ArV-C1V4Z6MWvgFqXgSnr2GpL8KKS1PRSj23THDKvp1p0EgnxP1ic9YkRo6OQQ0xsUymbBY-a4RouOWKGozwOaW7WAjr-3g2cpNhGfvW5jdlWHKJpIM-5Dzd4bIGuKgFvuOdwFrcx6hlGLPL6h5TpYjnhntCu5RLrkwZ1n5Cl0Zz5eKV2hJS15Qkd3WTZuXuUzLitOpgY2zLfZOIdcP5SQoSOsu0O490WE1m4Mizk8OW3lJcz74F8Z_8gyb_DrZ3jpiiobiaEviP4_HjKiCy7JQR0Gg=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'ワンドのクイーン',
    //   imageUrl: 'https://lh3.googleusercontent.com/AQMryr_98P6PuNIWZhpVuynKM3Eu9bj3n_Gw5vFhRX6a-uIACjQFBixtx8bFjLApHpz4CgCKpQEuLanQxk4zQCGS3T6qiq-rQ1uCIGvxruc5LES1jRzma3TceJmdG0WIIsIIZWAD8uBWI4nq9IIoB9DRekDp5rP9Qey2RM1EVfF4Qnt89ni0dxgz-UFLjmgagU2667XNCk9siRV_Ss8LVAS5VEXOGq657uagMnKXoEKofinnEsGParw9IdTQUYlenGFrtRPNhUMZfsHkaELS7P3OZpapW3gzt_qPb8YAkPJd6iFfDG8WmhGl2MuMciqDMrAPNHgX-06JBWC_0oyqkJbbDCBfTyowsZ5PWaoYuZYSPJesu3JdscGd2YJT8ilqFAo_Dz2pL64wYQK_m5Aj03TDN-fFjqEjfwLwGspRe5hJ4PLU38XmqqEYOoHJT5xxbw1KE3hFDMBBToAQISru6FG0JIeyiFZOddZKE8RLslF2twaLUFaGxLJMLLTOHP1J2T1uNmC6w__6jmA9RrLKRcP1AvZG4lLKHg7ydkPn5OSU05kclOM7RkK-Zkv-3nJQvnq9YyymuTHvsNjdOTlYWb79RTn0wRjJAqB1TJEJUwrx1PWXuckS8wN679oY4JFNUGVgKx8ZIpGDWGJ5UDfUu5VSLmQyaMi54OustjZ3Ni0z23McsbSKy-UUWd-Ue7QpIG0i1RYO7hY8L-enw3VhgImQU7UN5JElw4BEFt4IftrhODFAZxgy3uMBY1Pdz2ZYBsa1HxpdFpoGct69nae9NzkuDNMPX-LHTORTKaap_SwqbPg6N3sTCkXxzPJ52Y1r9o6bhmFTz8_Dwbe1VVovb2u5qaqJ6mq7MvzUHH537h3RGPfo1XyeXcIm072DUexDF9RU_W88Wf-71uoA0cSHh3ZMtTr7LNzrUAF-daIXJvk9j0TzvIXglSxhL9BG3RRlNpbohyqj2ImAVZVe0_GNRNZK_sLnHu_avPqR9YPX5MRsQPpU9wIk3dIop5uXdSCKZJ6T7L9_uttdm7364eeWNJ35o5ozvDvZwWv7MAUL0hkccct4hMEmT6WN6Ohas6c9c8ZKzMAlBznfiqeRC921XUkchLqcB75CtA-sHvYHtvEhw_Rh_SsYKE6T28vsmMvXtlxQrRc=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'カップのキング',
    //   imageUrl: 'https://lh3.googleusercontent.com/vX0RwpjQ83Af7hKqem-MNBk0WdJy9GgrlBuWh0o9NMjVVBepi8Ng9funzqfKPOJqYfBTYcovl2HlFcQ7UhDrAvGtqCDam2Jt7vzgcqgHw-wPhQoyiO6GUvI4z6Fj9fcs04DsqX_7OpMIGNh-7Bz14vgtDsCnyzNMPsSDuJCxac_-BZz1JEwRpwsrfDiaqtyzA0Z27GV5xHutFNgraIPFw_ycLVy-YWMMdbClnQs7OdZhPS3iQGtgg-i16s0R7DiOeohZI5zFo7gWupq0YWVfhO_4CnG0SRS_sgo41J1g-BxEaWqPpeMKDFFd7NQK5q6DB_ZmnoWyKt6Bd-GP9e2XgqE_EXjIvKOchsYW1i_7OcJsbBJ37oNcaG3tFaarFxCmctxPp-QXY20mMft37MsjGO8Lu1sGuGqWhqT1vbDgUAlXofPD5YqZuQ3ChNsQ65GaIsLUdjYumOPhovuEH6b8TpldoOhVULDAkIv41q1BiSGoUe5pA7hUd2qpBLPSfcLtZVTH8zbKICDmCjQ6DFCzjN29rI2KhtR3bErTy_1DihpyRIJN_3AAGv3JTsn3dRc8zvspEPaJbtEKonHbStS2QGxJjvK0xl6Vrj5xQJtLY6Dtmcn-RF3H5dDlo294nHXMk8IRfzWsAdqcDHnsCUWxbHjSVslSgztEJmh1nlunbZ2m0TeUUipLXnhatySG0vWtZlLGHTKlymiud36bnKbL8bstM5Y7CoqcwG54UeH5TLw_bo66qKhv9onI7kV2GBnGGiyVwZpNODyvIkR8E4Mcv7Lof4Aty2YYDQkwOBLxgS4uSTSw2BuKRHWLeGOjthM6jqhcHB3FqSnbo5G32B0u-0RKk024SEiwskWD8Vi0O1Ef7kcgthTPqGK6zgWZITvfEDsxwpAtpLiv3YV77hLjXQ1ZXmQJIcOgv8UYR46PGU7wXts0fxrwZ13t6Yt1M3J7hlir2VcaAugnRWBoiSFhWoBF5eL-wwDWcVlMpf-BhPXJycUX3q7Y7iUCbdfVsJUNEHmA4VoXXVa2-5DQAu3GBwHdZQllwg2MnTPhLXSQx5hWtFkmyvPjBI6x5Z142x2Z6byeKn9kJas_fv1m9U0cKk_KKSA3ZzxOjPABfpLLEIkMaopA7qg7jYKH-liuF1zxP_rFMIg=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: '節制',
    //   imageUrl: 'https://lh3.googleusercontent.com/GBxjM-eXhpN82fBAhy7O2CFA-tIJ-Eq94NRQfherjuhOLEW8SA_7vqOgyJzFMWW1JuAAhIoQIhG4iKsn1oYUdEdauKnFOsNEIYzqcQ2K88H6Uh_zJVLDPV9uXfEwpG9v5t8IMxo_9Lym5cH_cx1Ai6PWYNicPi1uOJSHh05tPnQOeURqsq6txM_4pWeXgRwfFWSB-9mVkQbSMZApL9L7UTon3fjoWEwdiaNaz577mWSdOC06NLZOK1PHoYPbzqXTQCtlNXpfmqFPzdj6HCfWRoMoWUfI1yRJFMNNyk6tebcScpbrfjkyzNr4BXEj88Xh1Z3YO76FI0OWHrQChT8CnoL1bVDl1tCd6NLcQT0VVly1Kys6YB31UBjtg9lCAZmYtVdUYzsTGws5b0vg9cMEBx-Kp3xWmtVawcPm4WrTFKjHl-YQ3CTCJnQ40TH_6esNXQpDffZkevPOArJyltpFPlYIvNSHfMiAYCQ4jyVWZa-6nfp0lHxiGymJNn7j7f743MmS0gKMSbauRgxTmOmW4zGKtMwDd6zxUarjZjVPI2bYzt8ay2YY67RpgL-V4VAEgVQik2oImf14z71buvfKuFWdDbYNGdc81inzdbI7IFFJ_psx4Ite9mG5XNSnsAn33K39D_bLnF1NUywFo1LSuKJEHaqfnV7lfB2AoLd7Sw_3MMeJi0ihTXlwgs-hzWnpaB_vbsMjP0eCEb71zvKA36deCRpRmKuGL0frqrcUnbxqLI2WZP33Jp82BVHBrJYAu389MgLiySFK1BsUk1rgvFIIKYbdHWpzewNcZkm3I3caFsweWHqs7qPRiPyzBj0zYYzvmx1TwpzoMASfXHhhoITo9V2fFb-fx3az7Ii_QaD1Nd-jBsseM6-bhYZTxRBp1K5sV_8eSoightMkGFSEHCtZiOa30QTUDKx5sNHYOicNIaAogGUmjaUEglA56DFZ5Q72OX5Wcl5crKFMDUTzyDqmjyRX9MRFDJlk8NgCcJLbDYxHAFHvmi3IImIVYpW6laOa3RGyxa_gpU_18XgSt37zYF4KiSGb_wIT1fgNE3OOpaPYZHH3p5xQ81tKmibLILNGaSO69L4KRPc-XR6yOKdvJHTgfy6w8LdP50MMJr9YGs0CvyDpiHuK6VsY_xMPcj-C_Wo=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: '女教皇',
    //   imageUrl: 'https://lh3.googleusercontent.com/qONnJOUA8DnQ0grdV90X99E5vT-4qRTKNU0BpBLE0UbiAQSOQI0UUpf1uMhzTzMaVQ7THQ6WDj4NY8WC4Xjf31Fgs2fkfiAx5fUNo1nFC2vtej7v9eFXb0Z0Fgl3vYXSY0zYj4EaqnfUra0CFxueuElMl_Cc32XuWQtg9JBM4xBTAdk5regXiMnY-U0Su-U0MVPmlNTguLzczFK35oj72AQSIMyByE-TqvKYMH1dcyy8lYxep733V2uifgJ0ew8dWDmSijPbikU-VhzdpVwGgU9voDNwh-khZx-A2rXM5BZny_WMl4ihPxBFYrM1476rHvPtQa-18j1AjyU87xPPnnkTNx4GnPADimx15cv4KDNWaB8wAYEGrx6-Ty5634CrpOkqJP8ansZh9hPiDpXh9QPzuOv9eVyIj0SKcbaRvNL0e5orRN2LMwg_DCoTXIE5DN2svDdwmeDwvhsR7al77n7W-eTYlqiX0FdFG_CuJN0MOhSSwDTvDN1948MMUeQ1aPUiKGmrB2nJHqDPun61rYLXf14H9lzK1G-QvJLsnPSMbpD3HKkqPkFACUdy3rqMB2nQknf5NtdeaqyqiYXo0m9wPUKMOfcadUI-EyB3UchTINfT6uQ0sZRPWEe84zIKCr1j8RSM5JGqNoMEFmbqaL6PGFHwAqEpQuKkRqZrd3j1UvjFmaIUEdTMnYtsDVszxakOhNS6tgamoWeTtc3dzHfyWc-V57Iy-SbEjur20pTyyhSwBFGRntr96UPfkOuFgadYYPsXxgHR-3WeKLyqdN62OM6O2y6K-xee-utXeSNRwvEH4bM4vqUSZGeLzb26AH4_As0H4j98AKShzgg_RQNmCM7riDFd04hbS8hhIYiItnX3xKYmTu6G9GJBwArVforJur4sqGMlp_tbCyy27jMj7wqF4EFi7E3RsLwU2y146oR-3XZv2xcRAJneqYrzG0-imZiV2MXRL7hrhWl2T4CTOLSDXgGgjktAc8LQqHJz7Rd73eLtikj4I8EeD0KXZ-Of2R1CgrocvF5BF0Xh-o6Ikj7Di91cMyGiIMngfKylwXYQ-BvqH6VN7fRklTd-OhUtjlwOPs1pHLOJDgxhbHtdU3jXfDWCTiJlOO1RPf_L8CY3DO9phCEIe5c_rvy9AvZIiLI=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: '教皇',
    //   imageUrl: 'https://lh3.googleusercontent.com/gaw66xX27ixuJ_eRG_2dFsc0aIirDicbiAG1lwkegg1fGYcp6xp41ecPZNXWgvkhA0ckOpG4m1iuJhRR3To9wJdrTDA5lxGFjhNX3uQXffKmKC-13Sa4QKfdBJ2F5Dz6ujt9vO0SSMPnebD5ep03kABgfUZjQ_xHZAxfyL5zqflvKGiRBf83eB10SmYDLx9OhnuKfgmhj4w7Lfq7fvw_86DpXaEJ-Jk3Ht_pK1UThUHMiLsH18Zv71zVclBuRrqDUHU66HYCttt9co9fYzNtTIDqETDlCu2f_XCvmSEGtT3RpRVevAoJ_NE7LuO55WsBvnJ91xgOLHhJiZUjxwk7KMrelpsvDkNtWDdbMzdy29SqOzvIaz4KWLQQ14_kCYspf5ARX534GHrpG81vPKPZR2nZ3uCCtjQcvmAk5WjY51ikL_0ykW8cnpyqZ5RCGAMfSMzoLLmBNz09KQreut0jPbVgK8H-y9v-C2RuP91gXR2NnLWwsP70nflLgNZnm4yPJb55N6_GcSqEJzXGXLB2zj5BO5nHqWf3vzOug1NN2YHRPXZs1zHN1ZuQ27qPKHlcI8KqoRzwLoUCcPfkN3OVGUvtlPVjxwXo8CV6cQ22D0I1AqBmoZ8GPpm7VSMHttbRdUO8cD0Ok25gJAgUdPi0H6z7WKgR0bMkcBbcofI2PfpGjPAjIv-UFMMZs-1qzASOXlHo-3pkzcMNBdj_dejzCJPX2lIo2ydDO9aTzgIff6tOp8e0XQGwslVUCfCvdvt1FbktjYjLwcPgKqH6d9CEsVKFP00qxchi-EGDJR47AMHEomjAKCJJGLbnlNt7sybEXNQd30WSuqfVGjCrjK9c3zfcKnzJVuyWlr7pp4sCUoObnXnOzZOocV0EYpKIFkKZ6PIBwmeG36g_mrqVIhfW_ut9Ybw2yVXdRxP6GQesw4OyrNDQSMhBkS-tYkhw-EMNnm9WY_bxtLXPLQL7OT5nkUNtXhi6Ep4NXJdUVqzLZwrWOJlAwKDWYLU4ctyvs2pvJWXE_NwYm4uRpGC3M7eNoIKNanesLOGF2mDew9pMYwe2cWGo8a7F2ySWPSarNml54v6uhgbMfH298rS0GHIwlIheWr0fbDyCRDN5FawnnLQBYCHME1ckaJDeu_R75SL9nt5LXWs=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'ペンタクルの5',
    //   imageUrl: 'https://lh3.googleusercontent.com/7CigAKrp6O0a3nPof15DUv96oGPTeSvw2I3wiDT20dM2IA9J5R4PIx6xRTxCzdSsy2NhzAEfqOuuFpgu_4bbxSTd-V2ANzrlsYhDP5MJJ-vumJY59DoH6yXtJrpj7LsWmBb4YrFcZ61jSqj4oU9BrteCcHnmNO5GPWxIRQpzznyWdkTy3gDhpaKiWB6qTvBjMGh9B3Tf2A0a90USi_SUXG3lbUPfGwVUYZTGZMpqfWVjjSR7sr4LyVc0ueV5Pc_N_XMV3pPY6_Jmn1hRpkVEJRQEnv_qz8i4qZmFRPrVRWi2Iyl3fqUCwSAQXbQCJR3GyEVKIhmomB0IlLfiAzBMe-bryciYstf8UMTgC5IcbqM_PfFwpcs0vk9PKrUUxKRh6lDh4NryDEdXwFZxL3NCNSy1Kf7SY1_7mRxHEeOcw1w_yJox6rE2e6f34IXirLxraB_5hJx183_9ZLssJsiNKAULg40Dq9HOoQdhl9bihn82zSh4FL4ZeQXo1f8BZOM_WZnOxU-aLr-TFLhykMQ8sZXtPCqr4fdB3FCRkWDWfIBdoXi-WBiIH_SDT1kftqTM87IEjvvDhHuzyTC59pykRx6MfjerYkDUGqbDGWFIDnXSlOETKMQK0_2b44xgV35ILItVHPnNcnI8T4MibXqta2-iB9JIJkZCXowRZ3x4fHE8tRFvY0a4Jo0dW5lodu2Y0ChSVkRvb0bHxnyxu2EsdrB7RyczP5nFHqH0ARNluTyKV5Zdcuo9oleXX6gEDyBAAFBLVKSE1SV03KIP1FlNOX1cwjNWCdlt7oR0tVhjoQEcC6T0d20TIrSDhGzdvhMcu37dlyYIe2m4PQ47XR56gNnepzgn93QME_ng1WIxEbK709lA1uFvGnKCg7XvXbzDcOPjSasEawUsW131eouQYM1bSyW8a-v-jFI7S2f7t-D2BgDJvwk0B_Wd3tuPMi3Mq_bJDALeElVAJfwX8fWqbNiQS0tpnIZN0ejOMly8QYq19dyqUEGDiFSbLfGCDxABsAQ4Nblv_Qv6wKQARDFguScqYCivvpxfC65VWQgSIKuEce0RKRYTIrXrIFjsEfcEGQfk6fIzYX6UVDpONHwGzspczXnd9Nhyt28hYARhrK_-LZhbMm3R0q8zVageHE-dxuGBPqo=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'ソードの4',
    //   imageUrl: 'https://lh3.googleusercontent.com/vjc5qdgBWl90dVxJ-qXXLGD7UiAJkApXpFrJDAu_myrXM8ds19XG0KFHzpq7DlbUcvT787-tfVTLWJbbvtxLAkWt_218kzrGfOyuZ5Lekd_T7bGesQYM4rA4Q-wmIUdlMpBxXaW3gREWIhn4QQ2p4Opz8qbz2eRVurdn9zeL9Po91vhQ372mitBdP2FNKkGEprfQ3W7e6-OwAhDfyGMtiypv2SJ6W3akb3kZsKrIiWYWG8jmj4iegiINeIxPmHha305VMglCR8KNjlv9u9q-jIAznMBqP1b4Hxe71PXY1A3SfhTm-w8OJ-xs0xluyvl3kJlh27JYxE1ciqB0GVC2B0lvTI871juIItmjl1-9kBdt3vig2QmV8J67hiNUlwaPw9i8cJRSfO74JUBOAeFPyVvBdwov1KgFIKBh2BMCPBQwfTVltMoZb08IiTB1bowtiNNPLqcVUve9C5WOV_iTaM0JlWUIhUImFNcdUjscwF1_RWdlaTxJXBcE2VzndMdo8pdhzacZ3QYx6R-YxH9ur6fmNzpugikAtERiOPDGh6sz3fgljHoULhLOhgOycAljuldS-7Qmdv4tlXPW87pgZ4x0G74sAUjGNPKNU_qr1PiuGXWxI8IIfmE8u6ezTDac-bMBuOJgIGAf1EDAUQUEPq2aM_FzDCxUfW8fAOMxo2Ngl8cVuwtFshg04aaHsnvCNzALnGagXSZi90NLzGUiIihvK9oOdH2siPSxtrXIMuUlnAG2FeX58BBpIrKP84yncxj-Pfa5BOaOX67zDzCYB8anoZNBVyvAuOdnoYlEkX0x38Kziljwnk60LfIJs9MHkEKZKn050BAX7FTgamK2wofo48SkyhW73qCKbBG6Ce9ZRU6jI4M6HMNZnuqc7I8yb3ezdctTvKqHiRjavtpDPpaaKgv6c-VjFEYavRc3mjeBepWHpwHw1MgZ4OQpxZY3kLc17vCM6CCG_vnxC5njKaxoafS5SJvAUuK80whq6LuC4_fXrk5UNH1DYZ-QXFBMZY3DrmjuGgOfcHfUFApf7HLDO91OhZzvT1x1iy22BT_0NLfsZchbNj-id1su35n27KPWWpQr-BbRTD3bGJOKMEbf74W425Bdr7Y4OqtMat7VEO9VFabXZqfLu7HTvPcF6bElkMs=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'カップの4',
    //   imageUrl: 'https://lh3.googleusercontent.com/845eiqFR4UMDxp4XDHqaZ0aNoUi-UNOXl_kGOnCCOxT2sGMvQrt4oXc99sWwxljVjO4uyKCj85cSirUBnPO8vjn36bJVtU8gwJWR-XfR2Ml3HwtQsB20T6ggVQgWUw6tCnK1mnHvUswLSJ6FzfPDO3DLFQnxPuX7iJUQbY_p5lHmmcUxQ_D4sExkG7V3wRSvyUrYCqUPKrNagmJBLtHUMtfCCMs5EAYKi9MXXmJTj44q1z3UvKc815pxmCivMgYpX51vA3gO_IGk7d9KYNgufaFQR5GKdh79SwNJna0EiHHZ9qS3y96KcJ4dgebIurPAQdM0wW7xhKRt8q39AiiX5OIlqoYKcN3yoHQZwXfXwYJO4RvycuY_4yG_zolsj-o_2gYNOUtEr_kjScL_DBi2za7ex8OxXdVwoxtFCtdbRtO8sCFgEis6OLeO5Y7xK3SB4TjsL8loDL5a8b4u_-5EAi0CwS4JES4MorSaEF20A8XpZqEyin3Z_rljc4CV_iQzDxCWRfsgu2DicKvLEJqKsM9vTkH7u2A3wYCMwenfrCJ22K8OejUzyRTQvYzE4eJkW-zyOk1gw_5l8heSQAf8oQ0HIKfYAkgL0Bz_8Wli7zo3ehQ6VCPo2QD9kSXTgerEW9h6H0yvDNzl-Bey0D1mx8EUk1MOslCT2ZJs0i0OnjZO2HxAOHwyCKWfF7BTJDVzxcbUvY1rywC9ms57AAqYCHqWNTt3R2hO0jcrcxoH6WSfATTAbB67_Cb308ahLFIzbKs0IZZ01oCMcOsGlbK-g1_ZdzxE-sA5loKw4K0fUdUXY80myOM7ikJ1nDPJSNTbWCTMx4BVAGpBPIgAqU2Ca9KhfyEai8I6FSbq1kmOR4mCgK3o7WLgvP08rUPLDOTQO7mSHYBeiiKOKdfF0pRDMvICDWLx580f1RolSV37TJSW9Gu52qDPWjWpEprhjxP_9fONCPS41FFTsxmKV_gyxlWwX5rPrHmWMzx2wGJh0HP7b4mgt2KLgT786rUfYGiIT0Nf1wuXpqSu5ovXX9gGKuDXi8kxj9KiN9ZfL5x0QHEapcyPuXRPjAJJiYqn7YqKyIwo4YvM5qmj4Ynrmi6YDAQ5BamspLMhYtf80bnhbsN-cBUrtaeJ4A3bXK1ZGHIF_4Ie6ts=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'カップの5',
    //   imageUrl: 'https://lh3.googleusercontent.com/o2my3iovcLYxLXYgW05QijmlIThRqqjOBLpCkpobVcTWwdUWaSLX0nPsixRiOXELjTy4ViN6rzZNstDTreIYjgMhNE13oufgme5YuivwZo5rz7uF9S78zG28R70DMUokXYR1uiq19qqE5KSdctthIAiMRbZTX47GzoaAmxx1E8nTmDGI1eyHdxW32z_7EvTNFpFyBI3037QpK--GSev94L2ukTQuRx0DWmLzs_34VZGC0ehRau6e_MJ-UMM-8dw9Aw_n0Yjd3qvzp_hvX1-iinzujMoGuOHa96koo-MONModLWbeIyAz1sK0REB1Q91VAIa8uIIn9PXL296o43L4S_oO14fx05QjdywhvAeJQu255Tzb6VJxGIVJmpmMPEYnUj2uiLDJXB-RGe-n3aRKWwXPTVS9P5_MuZOJY2tlizZCt9RJjugPNGqmFSbJ0MY9WTFFs3KHhlIVSYE_pvLpr6NkmZq6rZn5CEJDaje4zisBXSIOKJ5PYseyMpCzqrggBtoDsnvSW-w4ItG0tgRk6aYPOTeLbcmR4Kamor3dDpF6uDasIYefsw1nFpCuiWuLrCu9ftZqB4HekS5y-H0cfd9zw_njPKTHHCLW0szmUn_V0ZdeaKBdlTcJ0r3DRRC4yvvd0Xi_kzKdyhoOlRcobkZJhtxgJIiIldIdfzDgFQs0LN6Z2aCBi7USuK-OhlAQiLf9T7LwoKzEtF8AKoDWv3Tl3sbZonSHgiXM2R7hdDL_0fyCfUz40ldIbUobSpFmYta_6M2X2mwWDtP9p8vp9i76yXmuFAKma9oE8xfUmQZBlxmvjotRRJCNy3quIynRSM56d7DlqUA8gT4ulQOot7cHUkhqjRYDYJ5XVTvK-9cHPPOJgs0xSuezkdqcQDYauNwIkouZa9F0RbUpBBeLUW4J17rKk7J3xm40jCTN9nHziwBIxHmwE3IG156hFHT8RSbXAuoRTik1FA0Wxu-b-F_4eX1lmB_lNesgoKrP69GtNndC_8J5A8y1-TLt8ECaRirPccPhthyaFRn3kNNHet86UxiJ10mz7w-YCTF-a2ByH0CNTFqcwv5JDh8F4oyqkmqBmDW3CIVJe2nuaeeC9zOBHnHCY1U_HwfSC4lwzWEspTfJNNYvsYMJc3i_kyfezIMr2G8=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'ワンドの8',
    //   imageUrl: 'https://lh3.googleusercontent.com/PALooiRYyQX5Zq_aR-nuKGgSh4gGu20X4Pevzqv5YYGaK-1GZ71pL--IUN-38mIY5JgezXP9Z1M_FzAKbNTYJUsnbq9z85Hzeg1TLrtoiPoGZ3Upg6I1qAlXUVIN5FEzu0toSgaXhtDETdOrErPsG2H_XxVE76dMcXCfYXkkthyIYaGE2NZoiRDbNsGjy4QbojnVGaOmHiABlztbLKQ9L81cOGOrCXuUmk5taMVDeHQF1o31A5sbcUyIGhaF6ywnGN9vqFknSWthSprbhSNe9zAmRb3kQLyJZ2bfopdF4N6xpfjhRL7Giei92kL1eiNwLH8mDGB7FEQV1IvpmgRvUoi_LcdCAtzduMCVNtRdVveBJirj-7XrZwfEXbI8tiIyQsLy4mhJY-bB08m20h6w5RU_AFTqz89AQ9Ey8z0-6QQdx5bPmUmZYV_UMZwbWHG7fwYP4PltPTCCtrpMo-4brR3ek63MlF5rRk1Ojj6_1DbshSB0qvyTKzf53Xa6zPe-vXKBPMZAUYRh5yAYHtG52k5jczUeX9UBgeOho7wScBOas7Mhwx6K08TL-o0iaR0odkOuLGvv4OVmuVMYtpZ77CZrunK25ex3JThEJ9WJaH6uWBDugoA1dlwJNwPSjkFm2K5DRL9bS0HezTugK4zHEjQqylgdpLLg4FJrN3bGZOAGTcH68uGCXIIuFVcSS8BJa-QhCcZk5KWJh4jkDtcZiId2oPEqqSIvxDR2Ybcx2UFsgc5wbi4yKVJPVRzapbAAr-q9Hay8blzwtA-Mlh7NF-ygJ7TjjxvWl6ovNz5Xzzf-TbS4rsbH_pc0Uu0iD4KZwWmRl5T6P3WuCbqcZaF4-YCBqYoS5Xu2mykBPH93buckElrq3tZKS4KUSTQxRI0rRrtMwfI9eHpbhnLyGjFpYi4UnNfEbphaf5V0ekYmREq-e5HNDYVOmtV7eTlKSq-rRjBkRDnndes1tEDcemcxxj11X7AEaUrccay2T8NTDJ-FzF9DS_lNNg3ZX1nilE0auujO6ge0T-Uy2sliR01ZwM1nSljiBriV3pmUEoyOtTRVLvo_YCYnhJ-Vyzbj4cBUIoUumMR_EIXgXpPbJ1c89AXv6heFl_LJbbkIGvXYQ_De-l20oCmDkIPPjyuWAhuGLxgaWqU=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: '塔',
    //   imageUrl: 'https://lh3.googleusercontent.com/BRmPaIV7hni211dNlGbu5YezhTfE2AZiNHfuQTVzw_nSL2hsDd58Oe1FNPLOtmxUAkL3l9j_xLY2Er84yin7Wn9htyi6fNsCnGOUXWAiHE9NbPjGoWJlBA_xeBXDF3InkrvCBLWT0JMaTioZoBnNz5SALoP7Nyfyx97oRRCIdrZONVSBy1ilRS_gdXEA-smVR48NYuOje1QO4ff1X-VE9MtsdFk4fXImm6sx99oPgmZP_8sgOvlmUD-HAMKbAJpq6gmTQGcvuQ_DMxrnKHwVxxxseLFoPmIY9qn1ltAAsYM0sQkjlsOhusYonBdOdCvc1JFXdOiMJIRRoPZHiERNPdPbaIIdKKcMXSjPqZyrTDnsdGHjNdCVpBbC-XM-7dM6HXvzlxOAzYd91U8_gtQNwiuOalIyzeQEt5v76M94OKUMWEmYlw5q-NqfDZwKZKUjXPf00rcbQ7u0jR0AOiDZC_kpRppZMnMJTIQUFpAHR9eQimZ43IoLhDzI_SQTFyNFCJYANANZNew2bbfL7rhTluSM-J_0JKT95iTGrBdkG_jyFcSgw8EP77gSz7iip2n-y5uO8tMeu23lBnogPHv4cMMNNqsTidisN-mwiPRm0T8kfK9hWqOO1JvSwlAt5nBiLtSodkf29zhzH0uisMi7fDQD-xRK0oAy_pZgNmkAOzAilei_laNpPDbuJmXAM8G5abKDmAVMZ26DxMVU7bczgelyKLRSH6-AiXqqJX8WpbHQmEwmq3pUO5RxEM-fiXGi_EMASu24nnttU6E30Bl5CArd4uYvHhnas3GUMur_e1Hy3njb6zH8d8yUYkMH-2AztWKhjEyMFXQXLdRKmdfZ9D2TmQr3zKbsFho3HLNqu2lmwKgEeJ67TXMY_WnydrYJHQcS3hXMWALZhzOfViqMTvNWTdkhLCJ4-QZETLW_v43a4eUpsjEjr5Ti6ytvd3VHJ50dGxQ_zMmzAfctBkTxzw6Q7Oc2Lfo1Va78XYT-A9Y96ZVQ8mf7HDX2o1A-oCG2uteNYVZ33lix9faPqQyvzDo-yp-WDVGr37Py2YgUFneMfIhrLQsEEy4LKo-gM2WKVaDE-i-wPalI6I0Nox-2a09WZOT77iqtfOt1_KVtZiLpmQaNM25vwvqQwNPro7SWaID2C9Q=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'ソードの10',
    //   imageUrl: 'https://lh3.googleusercontent.com/694cV51PcKf3LkIg2FqQr0TAwr3FuUo8_LXSCz4sMyO6Dj2Ymlyf8aJri2EBDeJ3GTK5dCLZ8f7a_NHrJ-k9K6uhQbeADC4rXXXeO13L9GlAlIJzGEsWZJ-5sKie1rle3DTJPqsNCT6czrajBRi2SZzhskCw_MxW5kK8_i-_t8vG74-br15_MstH1xtDAXlbIgEKj9hvqL36ey9uqm38x3Wj6Gg7VUkmBelhsu5unIASxSCYBDOvt-4gCDYBGPTdxFQobz7d16JFVRuYzMoefKn1aUlBoW58C3D0zgRM-PnY7S1FlWv9CBj8SLJMEZoXFQIuKKJiuKy7cjxHhb90INBTCLWmNPSAa2Bghp35qBiNbv6Bg-wAqCbzoBfQZ0hNTj44IAn2_uAsAUxHjWFDNlAwcFVFGGSMEm8NsWkgnXKv6-vrWyRyD6IXS8g66WDjPsWCz1GWB4IxwEwG4W2G38cmfQgtWmfXudr16gmnaXg-CKUNfuMcsvBzIv0TKSwL1ym4v2Af0RRdNiBUUXL6QQBDLlEyn03yAWuzO91aCRgMj3BeeVEmheneQkEa8YcMBqPgicsL3fgs1_TeDz_RZRi2mSrwU2aWLMFOr1C2aOiRydoLc8s5ERzsyfUAsB3Iold3dOntgx_f4YXP5yWDpXazaTVD5cASK1hN3pPXUxDdFF_lvfv4qn62hcPN7oo-rrqtJVbIzfuOXm-lEHuAyjW-pEF3R0_FXRSxn9zfcwVFE47b8WR7Y-L-QWPGMsFg7zioo_na5nV2IC82R7pTV9oQMPzQxP18c_h47d-dbrna0IK_KNOF5gzqmBwO1tDDQaOxkDgZW6MTvIVF01CBrBIHVy4bxi8hpgATCZ5e_MlvNX_zXmpAeGGxX_HgXzJu6w_WqOd8xTuTZKRsvKec9fQAJaDcoYkmOA_E6Q9d7T94F7IKc6Iit44ftJ_20JE0B3S_BD3EO9psDIk6Ca3W-rOf4zqhc3ktGRG3GcoAIHh5qD69cRbsfRsa3Mwydnw1JHem83H8bj0FRYSuNqRsdtNJH-Q-rJsynQrwu7Y4SzmrM5Fko5q7W72LDX27ah8_QBGLYSA69QBhIJgOVlgJSJqFnPgmANC_Ogd88xytuRPMZyq-LzvLSo8cgoGTVfzk31hpusA=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: 'ソードのページ',
    //   imageUrl: 'https://lh3.googleusercontent.com/C22y5ttXmzYxWz0d4w-zaWLDdXr0fhiJ6OXkvvfosbeQO4NXC4FkjRtt1AuKjmipBWsf3-fcBPdgJHJIzDJOkSPscS6ZMwdBhLSSs33rd4L8PjZz_jky5VsX-CE8juIS9_vfavMcSI8N0_LLPRCTYgJy4x7spjnBOlQeQugWhAESyEeYFbmHHjwCzA2zZAsb6ZNNwaiGfzhbqk313e8MBt9rA4jDgr93x5LTjTLL32DTtCoTs248_AOg1-2W7XrgxsQPwYJrLayj5KkmkSddBiTiHE2ua3L7mRcCmin3dzUFZICl3i28i7EnNidNl7SWPGGJ_N795nYIDIasV05EymhqPM_Q6zpIyOkRE1lhsPyc55qIXhmyQ-JfIeey5WitcNiexNU6dS6DCerkSqkA4wEwFaFfoBT0q9DOrSXzdhiALlKvWg6BBURB9vE1Li1fJDtYi_mwGuumNAMU796S4sHAc7_cz8TdcxrSlGElu79VsaXlOB-5YwvUcs9luMMwFf4PXd7In-C6wBcTy3nLMlWQmVF45DPPzxjccHhnd_eEttbftCU2CScGJGVs-iBBErqUDaqPLYW5qccmqMCojsNp-ueSCicKfpzH3S5EkDhQcnw9SCk13cyZd4H3tdt8VdcSdqDSthBgwOWDePMa_BxcHnopnXcYYXHUPU87h3zKVZDDwDzZA-VrMtUIQyrDYyEVuzcnNglAAHfwAXtF8POzf40F99mHrdTFGFxS2mu00lZbmNhfCkH2x5AM89Sc3qH7wIxHdJ94jNvP5Cu2YeU80I4v3f4HmoGhOQKMM3gdm-FT-nqY-CKf9ww2gMQN9P8zCmU-DRn81tuoMSZgwHIGmkaEq_5gCqwNnNmTJb2gSqViUVtF78a6kbyTh6PNMXwQthWjZ0koJG4Ubbd9OAq4391cXWNgwOoGCc63tW_kNQBIBYjMnLC1fox3VxXv4z3XejK4eEoYmgcHKLnGI_n0ejels7Wdfpf2Th_jTQfN6yE31OGsXtP8H06B4HiVqeBWXNJb2aDx8QE7-FRTFr4naSzTXjPZXKktgkfUW2IoL6Hv2pHxGa0oR6lmGPjHWBmH0u4K2jixJgIsIzng3sFlGBkYD8bodupxiPFiT2cSK93pWjizKsTrj_P55bcZi7vgGK8=w501-h857-s-no?authuser=0'
    // },
    // {
    //   name: '太陽',
    //   imageUrl: 'https://lh3.googleusercontent.com/3a_vD9lPHam_otS0otlAhkcuhKdDgrgozlPTSxZILaCjQYuS9ObCQmAwaC9ItqrQWtccpoJEqXo8B1E2hlKWFKHul8K_mW9ZHUEOPrEeFbYhk6AfUbgxtLKcnyTtJMIuvuwzXAF8sWT5tsxZN3UkOspM17I1qpfXfkka_wN8ztXq_VAw-lWk7mpmNl-1Hade7cFLQHYprVqQ_hASXblqKIVUiTuem7wrSAP_djEvgD65rpXXrBsmrUJA9dvClj-rZATiKN5S3Exi34MfDnrU1Ga4xrU-uyw_g-O5VhmXOxPMPQtQw3gNaGP9zWQMiJ55Lr5dUrXPYyQdxxBVdX2L6J2BNeknHZ2S5g4pIAKGLH0b7PaXvtjHXz2F9vI_BhRnuidT577t-Xj9rBqalm_M30PMTVQkFF-KCZatAmAy6kQKmS__UJkRi26r83Cgr1MhifNXrZKYE07SGJoV5XUKpuTgO20GgsmEKcNmSLlOguRFe3HomABaG7nkJQTf0zM8k0pQwWZtZZR9mDUOdhdyQrxrPBwfaLES7u9hbYei1rvRq8K0Kl1pPjhBcdaNNYA55ZtO0y93cLkKR-GGcdoy7Hxhk5bgXzXCORxkYXuIC3Eb56_rfmZKWsmhh4sCAKyrAIwFMY0CEzzk6KOXZoPCAEDZoNkJFTOyMtd8M74zosfN6GQHV_Lco5ikxXc8XS5NXGBsfIYMd7Yw74NiEZKwYkh7DjsofXgFloHyOSNp8l4VISzhocdH_mST-6tcWSqiqrn8_-YN2-OTSXi2gwmWFoKPLSvrhDGhdBtfYP6t5OhSgSThjA74_56lz4NVYjCOVsRMtAO3_K4OGXGDowsP34OT7pHeH9Ur5OxbKgKE9E2bUlle-0ehoMQ_0YdVhpTd6kup64EHQun32xQI-I8SGvaJYRtVVMv4wTTpQQ1vT6cfQqcXrqVO0FiSxc8Qy9Ri_opQTBjy6iFOhNUPx7wf6n8p-m1YnasZb8N98K8texzzOwaxZXG7SY4Z2aXfJ_bkxuO-LVxNtJ3IcflfCey9tbWmRWRa1F4-G612mGk6SDOHlvNH_Rubin7tCgmGy8PpZxaorBOM9yDFdXdbzmvkY1WrRD4f-wYqAOnvwGESjmF_Ht8DfeCHHhuuhww6Q_U4ipJNVjk=w410-h701-s-no?authuser=0'
    // },
    // {
    //   name: 'ワンドの9',
    //   imageUrl: 'https://lh3.googleusercontent.com/g5wvqEUgTIBm_uk1w46yqG0hAL0Rdne7WKYgmo5tU6zUSRF-xg4kQeDrgl_2_8CcKiG7_0Q-aPd7pDM9fFI9oXMPhhObV7U3LnJjeu6yHYLkqlOKp1rgMZO90r11MXfnrDiE4mYt22tTrbFk58uZNvIXTlHeflyjSpg6HCpasm1_OLw9Mzw5akfKP-rPxEonSby6NcTx7g__9DN83bcqfAd-NAnCTt56TTYnfyp2_KE14vikwOkCVV8h9K9Xq3LCA2YAISHgNe8va8Y97zXa2w8R7orSPuGogoXLrLTUU4IEldjjPJhirLCq3Yy_7X7Dcog8_7UFR2C2e2jsLkkkf5k_fBkwWwg6x0eUcWWwhSuzkyodXxUKp-xaFW0GnoqTgVdCjy41Swtppmqndvow0t8DHthli-NFlwjGdkNnmt8sAVGKq_R8Y_KMTKMvLHxvJn27ih_0vmEpXYCi67dtVbnC5BYqLQPx9YNSEOfMWVPQzh5D-qYiAuckQkgBwbVMWMniizBTfDQ0d57LzrzOjcEWOv4PcMkajgROkXUVlmU_wFv6e_4lJEjDbNsxrGrqndhE1Tt7-YaNDXWqfSXosQyX-k2kE9CoBC1IazHga1YWHtDYEUcBfl9Yij4gpp4QxvVECOQ8FQk7Xt1Q_bSFcuU0DZUwk-ZcC_PRI8XWUP7APNMz8iLLNw6R7rvHtjD4f4Slm7SntMSiPYc-jn9tBCsR_Z6U7f41XVboF-UaEMlVJRkg0vRDYYe5x1GFla5CAB2IF8qViIhbKWOWj5rEO-xhsq4agr5ShXtYeV830rlQunISFPUEUMjPyvVL3J_i1geRbPxPfX-5N7s7wNxbhBJKOPNtPcwFntRYhvXzmky6Wz-2C-TYffZjccKFoCMKbme2V4eCgHtdyJAF_o-0oGvg3oowHNMvaV3c6JiXYpQltgc7PI4Fe3YpRTwFXFx4M13thO-xA0W4w3YccFPYAlEpT44kToLB0pCDJMiEmNzAAUW7cMOOvH5Ib9oBMNl2b6p7XX4kZ7wvTqfbIUATqUzWCov9NkJIEqhGrLsRWNVQLyIsMi9zd08OUaHutbPgGWIOfsHOQ1RRavL6ACJ5zSDDlFqCCZ9PoH8TrkqA14JI4UAjHNZwwysTGZ-h6pkrJ_5LPXY=w410-h701-s-no?authuser=0'
    // },
    // {
    //   name: 'ソードの5',
    //   imageUrl: 'https://lh3.googleusercontent.com/S2V34mUR-Wr7KIigesz16dXtGbi8ItJiQg_2G0_ECkZ0yzngr3_bFTHNUA7YZ28_oIyoSKU89nmCLliMJltWfanSDD0K-daIdDW59IgZYBvQiyH62hnxbqfErQ9h4XoKLKnB8ZJ1M4UERWgeTioLovXqd6wjCX2L9vO0J-3vVLLTPz53gBFMNQAjjxBO5BuPdFaawD5o2eT7INdAB5h37JTUXPBY9n8vbazna5jgsr3XlC0nXjOHCPLMPwdumo0M0NdgCmZo0qLINrOkStSGsZzQvhA05QDe2DNQp9d7hCwXo294kjqOEy_GygNPdOa3iW3EZZACB6sGmQF6C6syRXJoFQHA91EYYdKzf_6PXKfgSpf1sE_aK9fAD3bIDA5lg9sup8joRAkF8d0oPkzEH4oPVOXEMyvRsxbGWxMBsonvFdH6wFJZv4CzRgF4AkwVkH955tNdh-keQOW2-pJCEh3ulA7WdeAQdErPjos1IOem4XpmXJzDCHJYH7muQ5w4DqWIUb7BQeTwmsOlbL7vrU0eH7Jh3_z59LaZ9jQZpplRNmzhu4fzkY-B3a7EbchR4JRkrSnfUyBzSV4PGtcuy2Daqqpu8chXz-3Dbtj_WFsbdmaUKoENByQ-cme8mAbE2i2UVCVeTeYP1-_aJpCHKX0sF4ntKTTRcxahEI6TvShPoN7Rv-snBztuwXcAXUwoKqBAlnlh67s2dDfKyFrrJwMZ0JtjYiIEHziwXgaUx0Bf69Wo3achKMtfeVCrEl2nkWa_Bs19ps_UEGWwpQ4fHYa1ASqPQF96rDhmlkZu8PV1Nbu1Iq_FG6-ZfMMYtbSLxD-QyApdWU8MmoeWg1yiA8e4A0W735WWu2j7tfYwlrgalV1gRE8xahxnczEOUEqT_zSfboBoaGhYyCkbbVpl5V9v1SOP-yK98Y9wkjfpCK9xG450aJYfv6dBAlU7SaaKY4UDpDqR8o-juwKqmS590iScV_kk7pzLKsW2S-C2217vREsGgZcF0b2OPI1Hg7ecyvMqBs3tO2vQK0QkvxbAED1nkTmgjJTWK_EioVSQ8rmah2WV4p2GvDAFGuK2rF4EFLIis9ENFEqPcyaOMDuYAS7xl8VK00qUPtAZI-Ax2hT3aEYUe4XMX6zDB4JMX4uuO4AZnVk=w410-h701-s-no?authuser=0'
    // },
    // {
    //   name: 'ペンタクルの8',
    //   imageUrl: 'https://lh3.googleusercontent.com/ZviVPqFA4OiiPdv-xVRiLJW76MjSJbf6OIt6eHNbxaMFO76pZne5fKOdb-OE2KoZOejFSewKQ7JPxH51BCXSgHZ2lklTQ0hX_2g45lXKtKmpEEvDH5OUXVPzjv7oNU_XANP4e3kHiIazH4BosTjuLaAg3IVGBG4l3feGlVejmt6OVSKP4LsgpsuvOlLVE7-XJ3PfIXNcoCF32GlxWNdmcCtDA-aJq1_CNJuz-xHK0QQwSg360JQQvtHRoi8dlx8FjQv8xqLPn2oUew0ZPmluk5oirpDzLKbnZ49huTqH_UBF7EpvO3SQNIvp9Cfvu_liNdfNDRDbSPOdk3TDKXTxvZ9c1sbn1YNqghvji-BgQf0Zb0rN15e0oZrHCghNvD0Xxadhs-rfUMpBVEuomd6uF7kkXQ9GwFZifUxMHe73H6YAyfsoL7v76ITm5kpfzYIMkdkGNFAe9qENJHaTTpbwVTZyCrdx2WAzpaoIeHx3iEATIzIG6Su90UHdKQZiB4IXkk7nFZoMwaggki_rXpNYQL7-YccFuWd0WByRktkaOYtUSHQ7Qtx1KnOlOZZ9LjbBo7OrWxtP3zMkNMH5x1ZZdSsne8WYB_vAR74QvyfnZwQNiX2Fg6m61eNVxPsmDYA7p1mgV7TmmdXSuqAYahV20NqpIxQzZktToRSex19GngCkBlgBcTLuWI6mq5bvAG8llcvXC8dwFz8IRY-oZEU-_arxij7qz_NT4WquQqf4Apbo1U2Jp9ujBwWfc2kMehC0beA2Nc-hal2GgaOeyjmumNN7vlic1_XUQVE5yehNZoLM1T8qstBs5qgtR1o4mO5JMtLm5LsteQK_Wo44yJrGnKH_6E48Rokl1DvNhpigl67JD2OHY3Xgn7du2zaGf2LN9NgHozzyx64I0dvBlt2zVxb75lxlE_1dg75lOre-l8JwKd1Dzz7NCOrJq-5S_70tJEJCR1eijI5pUWotK84x8E83qTdruIZEV6-LL3Ex3yXAqorpdAc_mi5Ocia9qZe74INa4G9_i5Om-9JUbLfUMO41-rl7wt8ajrde7AZHjfEAzefAIJwNHsd5epnaN6JKZ-ASU7BbWqnHH3UcqvtQ9fbVYXgkBVrnjZ6ChAaOkkRpy8wajAaSMOe_zgjkEqqCgEVDL5k=w410-h701-s-no?authuser=0'
    // },
    // {
    //   name: 'ソードのナイト',
    //   imageUrl: 'https://lh3.googleusercontent.com/a3DnSBeLuqn5fvS_DMaMJhEt3quBY3gqcTgB1jcy7lJye4HGKVbkU79d1h68lNTzn6HqD1LA2a8cKT-clPTJGZFLfOygE8-CqWECyGPri-k-QqfTEYmQs36YTu5FwVAOcJrtBJv0G8-DokI_RhhcamIptBJ_ma4qFqbGMH_5Bj1LrdQWh1SngtPqJ3rRPwmbRzURs4CfqoyupbRFAaejnBXNlFqXwV3jYnUeoseBPU-YGwdkmWtXNs3E9ILQYbTJ_M44fjVrZdozrSY7IeAn7O3luP61pUXf0Z2I7JgduzfFoZqB6bK5d-fpx7UD6tAyRfsy-eUrl0_ZjoGxzdjKRjPTkr8O2lHZX5Jit0-xmVy_oHQ2WYbUAfBFvbEKfy8Xh4U8j40Qasas8fyK53vuhiuJa_g2zXFza8A9IK5g5Rb0TWMJlgoVgQjR1rkoU3lb5JsRbe1RP3kf_z-hhTAqaNUygKQQC7arVTq1US5dseIBiVq0Mpynp1kuhmuA4xK05N5gkLb083xd3FgqX2qQ8kOsSWto7T8b6wFW4lGxaShWPqDz954iTk8hP15pW4xAy4Xz5GPdJGSUJhdYnqkGGb-Nuv7TdXXr7OBhkgc2B6kt8CV_brbrBha6akhrIqss0JijOs-2QePLlx9RBGg9dlGl6wojhbvDcMR1ysPN64XIrG_I5iZc0xmu15FYz8K3A9zl6q7sRO8rG4R3dsRd38IG1b8GPQSDKsg-TOhYFNh2DOlHW_lEfiKgDE3bVMedH0S3OHLeossrZyZ36zQBuXu_jWJd_zDVXWai6vFFpb-sODqe7SGbXR64YbLqU-M4GkksCHvpbe3p35_c8U-b2O2krM3_SKkA3mXDjriLkIDGs-poBNbtFKT2pfMJoXDSNO3F-tnr0-zDDiXSfOyQB2R7l6X-S6oNBD8aS_sitVnUNwiSDSOUHjAAF9jWgmN8kbHfcQZH7tjtQSmumlCCJ6b2jPR21E-lI4wVPQe4LAHnEp2CHsZOo_X8LYspVGmGvzo9qw6h5_xyJPqwZ0JJfKYTLPH6O5D3XrfgVXqgefsgpyrNdmuhLWCpJJL-GIXidOCmJgELiomxu3qgFUSSg0j4CKY6Hu7UNnJyetZUiyqhJe6ctpryNiJo4lWzCDFXDg4Xlrk=w410-h701-s-no?authuser=0'
    // },
    // {
    //   name: 'ペンタクルの4',
    //   imageUrl: 'https://lh3.googleusercontent.com/T8SB_9JKmLNYKjc7Dcxs8idYaxoQVPXc4pXO9Z6ks5Ve0SktbRCbh3AbrO2DAfE4IPOoz8q8n84oseFwl4VBkVmdXQ_R_UC1IhjlSGjBjmySxV74BV5NvPhnz5-_qorN_X2V0KEz-ZPtY5UVhBnW5RRoejoKqBcKe2efoTAO6EXeC3HJUehHeW3TH75DQlcVxUQclWsszyxNeVyDqWFTAR_SvGTq3vH7XpZWQCNUSM6iJYjEKOXS7YCY5PxAQwXmPjggijIVnDqXlbSTZbN7Clxp2AzqlQPBvbSPPaIOW0oGN2_CH62L_j653X9AEzNBng6UllNovfdyLImcr5Hvaq3_5_hQUIr7Ak92YQnnhowNHPH1KaXMvq8jVCgPYVJmcsqX9Pb7yJ-xitCR2eBb_NYcJmhG0dwR9fJHHYlglqhgXbOxcvZ2DEQITY5MnPv7EEFs6sJ-w0G8WdlTL4Wllu3OE0xv1aW6L-sCn6Et78H4p3N5q3-4_NkaF7YS77803pW2WzCUY4WQL-nJTeSzLUkttCVm0SxFhoUrRA4NmesJEviwNSEuK2a8iq-DFK1UuEsgyoZWwvcQgWk8M60QDxg9t55r5r8hnpggOIe8UGkBpMKzK9Q_112AMrcTUIzu6Dg3SqDPuUyhvFIkUOUft0yaKHJ3fT3v1sD6dSvirlKt92lJcTrJqBSoYqKrCTEwb-eyqDe3LkSXbZCHValmfGLNphLtoRVZgw0gl_SHWOXj6uLhPptYAkCjMrAhH-bAiHwBGW3BG695ieKu4qg1cOlKr7c8QXNo3Gqy0brOAc3GsuzbN3Qm4ewwy6gK5S6UkGroB2CPVuKTyJu6c7fKkx48MiMB3QZjWu4wzqhL0dPqL75j5YIhlNF03lVoYSw370UrsFbdjGiml2YHhQTgzTMaudx-X7w6i_a1sQxXpqISCif2X-tC5GFWdkoZu-Ke49wjRridZ3sE_T2FxX8G2B7mlS8hLF-B31p2_XWnJsdmiWgatpidr7ByK-NoCx4MRFrt1rXWFFchqkt4TYSkRNeUrssvrrr_BvoJznNRjB1Qf_-sC9i-O9n0fgM3y6cxha3qreB9N27iNUWrR94lWMSIdOpTD5BLjG8SRq0rEwCFL-XAG79gFk8tq41nTO9C0V7LGUQ=w410-h701-s-no?authuser=0'
    // },
    // {
    //   name: '世界',
    //   imageUrl: 'https://lh3.googleusercontent.com/rx89qKfHt0gY0y6CWLoTRCN9pqL0HXmAFVJa4THWoxFUiUXvZjxyfXihVo56ZugFsN4vgUBq9uwo2Z3arKp9GtDBTYszIXkSPzvLL3_AidwNEUXFxrCPh-4D3xoEfGqncN-k2WA19LrO8-rUd3bUc66EEFTaVuRDUY8w6-twKjH3gCNGHVl2c0v9zEACL1zwehiIAzipL_115O-3XE3wz7lhF8VXTdpdkbzCn-EgBNWFHWo9PIJ-ZMEM2L7uJqE-TOFUIGdEYYlzD4ivc1KKif8uc7HbuLrduoIHLhX92cqCFSvSV73NtE7PxfFVJoz-F8Z9zT3yt1bfhI8o8vvagkM0B0tPTLSPJRiusGZZWCKPxS4avPHE0Wt8RK8p7t55J31LQLdWYnzBtl-YTdMO5Vx0kMphdass5CWac5OLA-L28Beu5Jo8ifx5sZlojyaCmx5ySZ9agcHynK8JDXf5YUKsqcPkV29v9oEI3eRP8VHyiLPXjDju41JZ6pEHHjvcK2cP2mGOaibmyXLwr2jiZjumremfeefilaeVXV7yt1MTWrkAzJBn_VYlie2sqnWVJRICGhSUjdaifHrMhhZx1C_cSrOf5pGIM417-pILZCeRof1Gtt764xtv12u4HgsI0T9gwpiowWh-tPawPL1T1VtZvhvgOP7l-RUhPTBB0R5zArbtxRxAaehrJttt8pwsKz6tWfMCCl_7P-2wLyN6QU6OwysQBvkYmzEtIIybzuze1BzpDIpTQW2e4s8txtz-xy-TrBVpzQI21RqO51GoPVq1rQUecOOrMRah8nOy7JNzvIeobiuwKHZhya5lecTVwQmjKym_wOOWhKFQV5e8XkSUIjq3Aw_88M3UCkkD1EkzToR6sKK-5Wa5L8osGIdsrQ58amybP6pTHftyf7xYXAYwudKUCOQ49Tgp1v6vFUkVDzeeZ8ZBnu21OYC4VQG5akdHh0tBKLhdZvxs8HEtzNz4z3SsekkXrvT0kPyOzCqsnCfY0ZO_w9zyT9PgCAkNNEDcT4CJQWdxR2eqC7HTRzyBYZasRw2Uy_kBT_XNvUlX4XgA94WW17uTGN0QxIUhaDgtsSgZulg0LeQEC9pjEAuTsQuYePGTiG6Wqol2FHOEfDHkyIeTGazwvCAscIxPXqAy94o=w410-h701-s-no?authuser=0'
    // },
    // {
    //   name: 'ワンドの10',
    //   imageUrl: 'https://lh3.googleusercontent.com/_IniXnXQqB539EhlL_auSlxLHkGvjp8bmmAt-KknFGPODjKfNitNwYRzk42npC78SuwlcaBLF4-VoJe0lXH_PXp1hh6EYYRliKn23nRdcG8M0wvfwtSAFShB9ak2AeibV3AGPosJB0pnzjWann77CvWAhkZT1ODHNZ9A9QmL1IIqu00LsBKmv3KoG4zygNfp4NdPbTwUcj2JRidsjbONubdEnmZ5NQT2W-GEQe5NZhO3RibcOixUfHEan7b9XSwZtoyNb8ATM1WvB3zzS5oUpcddfyOAzKfJ0dqHBCHvgSBCvaYHOGk4_cfvijL87epDE4DsYYO6dmKIPNrN9ShVinTQWFlfGsmBbj-zg5XXXJLeP-9X1_OnTvI0xsIa1OrT9VKWEkOkTdm759NC4yLOulqYuhzqFzeOMuCjKRB1BmVAv3W9UbedrMRJV-NR9FJWuoyxe2Zgt2xmpjiXPyDh8Z0sx8BbCrW6quJQX0nZO4uP9wu6N6VlHXJXaQ_AKqgmmS2Fb8JqKkZ6dW6GWsONMu_n6QzJSRdKOECBGZG2kXj7khPGXbCLPZ63gTTZ0NKN4BQkLr0Qm9oFtUICeqzeadM1xHROmCpEbs-1kZG_Oy6SrJ5h8nt8GGuJyCm5OXg8mU8s7gSm8JJs961v93phr-ZMs8KAxHbwYi_BI457OmBc4gaTgLQAAY21CZf2JodapZArbmnfomjaCV8NWjahQqyaUAXbO3wdEvLJseiQs-Pdb1xk4o3bUe3SRM_dIoT19lg7WrVBgetiqrXRxYgwxJo8rjP87IojsmIGvEo-1kj5WjyRXm-_XzGliAHg1wWWB6V1xt8-ZJnuLurKmLGe1l5ZsTymPu32Rp32kE4FwjijYxZhwgaWqYDPESOkswWKQgu5TYkYHniJRGMr9oCqj27o_lrXmMTvIXdaFfpCg39LNUmI63R40Od0dSEjka87HaAioCQXfxyeZ5Bhj8N234bpK4i4SJ49QzxXXVRdGFfx1VJQ83vqBpBxn8HR06XDcetPe2_dYfyL7k4jAZEhTfkJQpgVnQrNxAKx_eXsWW9wIMAjMw0H_No6haH0M-35EhmB6Uf-cl0MCBtwEVBAjtU9NPNyckKxQamwlfcBUmrYQuafWoCAnEjcM_h2GaYz2uS-oAQ=w410-h701-s-no?authuser=0'
    // },
    // {
    //   name: '隠者',
    //   imageUrl: 'https://lh3.googleusercontent.com/WJqkPR_wDvCIt1O4Ytv0ltf_qh4TGzIJ1ghqQv02rJUqC2KA-5p3KY0pNhz45BqMcAq4cJQYjY7tdoM3wrP5cGKXmSXrCkH-qU4NJ2s9NfUAyBQA3Xqv73zJNnkEspDG8FB5fUdtRULWGJqVfsc2eEM-XEVQVaNy5BayspNOmPmgeTJ_wqnm4xFj9v-8EFIrSXNaKuskwf8ZZ1EICFoNcciQmMqfAPT7cyowHJyIx2y967Wb1kBB1xzllO__JAlapbLdLCBbmGkV0KUPfBuCDn7jtBcWiZSYZ0h5xJPX1GPw3JSJjVUvgC9M_dEG9zLz0BzEJN2EVzIMV8TdGEVaR2MV_OAfmh0cDZNWQ49PKpo6h_hgh4sN_PLzg4I1JV8zfez3Zm9JlEluwu0QUHPtZBnbBnN-B9brjNOhfBGE-B5OJDZF4ylvp3sAcu8fUqskfRXxNUcbR44pvfYbXlEdKkRzwZn3ha3chPR4Erh4TyBZNsWHr1yIS-92KZd1kUUcrwq96eKi5BRh3BIXXAK7Eb9yvMqfwsX6TXpWDW-26CF4pZakzAhVC_YvcCmvYLlZeKqqCkiPE9leunB106k70ycmIz0acr0P_PiPg2Uf5bWwH0TCbYq8S_8R-pEvRiBdOsrEof9MCmx7_Dt5eVLYzBYy9AoYlzcqq1YHMamGNlhwN2IGZUVV5IYw7HsvgFhnnZA9aOZkdiKapBoMWPrzybwunXHHw0ip6U8-aiBQv4Kkbs2fHUF9HeFaP_9oJWh2dE9xItB9pzmdKvOFyx-XWaRok8JsYrYYnUXIYUPBnbcPyWvgA1wBNqYo73Q5PAaJJ0HRoJikfWtORQOHjqfD_L8mRAGqGhOOGdRQsmxuuraUwcb5Eu3phdzKFDsk7Tlohw2e91PAs3wWRGuH6FNuqbGPo4sl0jItKvUXWSi87g8byDiOHPNRFTlFjZi447FKZceRCkEgCuW40OdideX0MjwZ0y2TLtpR1NrAhH_aiKw6unNIvSnEjN7m9LDle7hOW3vA9nZoHofIQAlLlqTlgZ5sLOlnXFqa1sgS3z1N4bLbqJ1pXi216Mrcb48Zt6Vgx5vfBBx-T5qFSaatXJzdHaMz34xwUlBpKbWMgvQlsFVO9nVJtEu9Xg7Hy4RIaTjSz4lJt8k=w410-h701-s-no?authuser=0'
    // },
    // {
    //   name: 'ペンタクルの6',
    //   imageUrl: 'https://lh3.googleusercontent.com/zP7Qp-Q6oljbyYhMjndrTXiEm3_ZsyoiXXju2Ob3WoLb0K5p0Ye_5WPHH8cW_aRbeR7YQASEZmacXXBd9cVmfNj1BGiKzQQabhpn0ArT-9x9HZ8gvxtY4hdK52_XiNHJPvpJCVfkIgcYfREDZht5N-4buj17uqJ94HA6-eTScSOaLY3wPTyPw-k6-xgfBtfbde-WLBrWx4hEfQfNm5KQcVxONY59zZZackEwBBW9lKb1IikiHBU_SV6iLnniQ6L9l7ZFVw8u76q13LTIi9moAStGu1dRQAso5KIzSft5wBORORXX3Xof8uybNT-XE2Pgcs0LSCrNsy8cOc1GtrUF5u_RodxkLmGNl5KUo3mfTWiiZ08w0KhduwsHBmHbpHwYRWc28muDBAUUddOEaZ3vOljis-uQ2BKg6HVbUkR30P_4nEkw0bM9qu2u2OgB8HEA0fauK6Il6vqHjXvq8bl0v9FMMZ8gpZuCSsIEJDArIHDtowyoAhaIBD1iyXR9Qnm4B5qD_0VUFVR_QgJ-BW8aH02iFsOM8drUTqG1UjZhauDeNSirP_ICulGgbxa0_VBJcLeuvbKOWI-eDIFSKIy7md7cRoHwuW1e1q5C_6_JctwVR8eW4m1S6VhjGHUhpYb2B3mpnIUr2zbhQjIrj-AmthqhDx8gPviqJyTy4WCLHoVtEd_prqRATd9HIVIuufbDcy18NECe2GvH9QFlO4NsZgSynQjvn-UzFSlmfhU1zzURozjFgBalJhbZ7BKg_ZU8M8BXxIU-Smn3I2NzpJK9SsaWViUSOX2-Ctz2hAghIjADXA6hWWLS50D3zwUun1gg5PNENpxpSkju-O0CjwSdvhTch-sDwBXC-9Gd5BUcs3011AbYkOuhSBZhp0SP8YiB-Kg-Qldt8tog1G_mYGV-8IeKxB8XpLWPhqSbwwqISQZlHPBjSUJ9H7bb0sSxWqYA14mf-xePGsSzjcQLOC97S95SagDgHhfQpSwJEpsne-yMbeZpK_wiZ4_SUh6h603zf_7ribeModDl9ZtGUQR3dkdTusKK6F_GZ2_z497tu1Ue72eZEBIACgvMfxl-0bT1VIUyEvIyutrvh9Wfz89OYs1tHHmWQlksl3TS_od_1Mso0PGkNeDCSMsoBKaHXshTNS6AUA0=w410-h701-s-no?authuser=0'
    // },
    // {
    //   name: 'ペンタクルの6',
    //   imageUrl: 'https://lh3.googleusercontent.com/zP7Qp-Q6oljbyYhMjndrTXiEm3_ZsyoiXXju2Ob3WoLb0K5p0Ye_5WPHH8cW_aRbeR7YQASEZmacXXBd9cVmfNj1BGiKzQQabhpn0ArT-9x9HZ8gvxtY4hdK52_XiNHJPvpJCVfkIgcYfREDZht5N-4buj17uqJ94HA6-eTScSOaLY3wPTyPw-k6-xgfBtfbde-WLBrWx4hEfQfNm5KQcVxONY59zZZackEwBBW9lKb1IikiHBU_SV6iLnniQ6L9l7ZFVw8u76q13LTIi9moAStGu1dRQAso5KIzSft5wBORORXX3Xof8uybNT-XE2Pgcs0LSCrNsy8cOc1GtrUF5u_RodxkLmGNl5KUo3mfTWiiZ08w0KhduwsHBmHbpHwYRWc28muDBAUUddOEaZ3vOljis-uQ2BKg6HVbUkR30P_4nEkw0bM9qu2u2OgB8HEA0fauK6Il6vqHjXvq8bl0v9FMMZ8gpZuCSsIEJDArIHDtowyoAhaIBD1iyXR9Qnm4B5qD_0VUFVR_QgJ-BW8aH02iFsOM8drUTqG1UjZhauDeNSirP_ICulGgbxa0_VBJcLeuvbKOWI-eDIFSKIy7md7cRoHwuW1e1q5C_6_JctwVR8eW4m1S6VhjGHUhpYb2B3mpnIUr2zbhQjIrj-AmthqhDx8gPviqJyTy4WCLHoVtEd_prqRATd9HIVIuufbDcy18NECe2GvH9QFlO4NsZgSynQjvn-UzFSlmfhU1zzURozjFgBalJhbZ7BKg_ZU8M8BXxIU-Smn3I2NzpJK9SsaWViUSOX2-Ctz2hAghIjADXA6hWWLS50D3zwUun1gg5PNENpxpSkju-O0CjwSdvhTch-sDwBXC-9Gd5BUcs3011AbYkOuhSBZhp0SP8YiB-Kg-Qldt8tog1G_mYGV-8IeKxB8XpLWPhqSbwwqISQZlHPBjSUJ9H7bb0sSxWqYA14mf-xePGsSzjcQLOC97S95SagDgHhfQpSwJEpsne-yMbeZpK_wiZ4_SUh6h603zf_7ribeModDl9ZtGUQR3dkdTusKK6F_GZ2_z497tu1Ue72eZEBIACgvMfxl-0bT1VIUyEvIyutrvh9Wfz89OYs1tHHmWQlksl3TS_od_1Mso0PGkNeDCSMsoBKaHXshTNS6AUA0=w410-h701-s-no?authuser=0'
    // },
    // 他のカードデータを追加
  ];
  const selected_card = cards[Math.floor(Math.random() * cards.length)];
  return selected_card;
}

// ChatGPTでタロットカードの解釈を生成
function getGptInterpretation(card_name) {
  // （略）GPTへのリクエスト処理（前述のコード）は省略します

  // LINEのメッセージをChatGPTに投げるメッセージにセットする
   const messages = [{ "role": "user", "content": 'あなたは占い師です。タロットカードで「' + card_name + '」のカードが出てきた時の、今日の運勢を占って下さい。日本語で180文字以内でお願いします。' }];
  
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
