const http = require('http');

class WordAPI {
  static async fetchData(word) {
    const axios = require('axios');

    const API_KEY = 'dict.1.1.20230628T123745Z.91aea0b6dc5f3dc5.07743ddf36fb62b79b37508779f667b387d46dca';
    const BASE_URL = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup';
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          key: API_KEY,
          lang: 'ru-ru',
          text: word,
        },
      });

      console.log(JSON.stringify(response.data));

      const def = response.data.def[0];
      const partOfSpeech = def.pos;

      return partOfSpeech == 'noun';
    } catch (error) {
      console.error('Error retrieving part of speech:', error);
      throw error;
    }
  }
}

module.exports = WordAPI;