const http = require('http');

class WordAPI {

  static async fetchData(word){
    return await this.checkNounLingvo(word) || await this.checkNounYandex(word) || await this.checkNounParaphaser(word) 
          || await this.checkNounWiktionary(word); 
  }

  async checkNounYandex(word) {
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

      const def = response.data.def[0];
      const partOfSpeech = def.pos;

      return partOfSpeech == 'noun';
    } catch (error) {
      return false;
    }
  }

  async getAuthTokenLingvo() {
    const axios = require('axios');

    const URL_AUTH = 'https://developers.lingvolive.com/api/v1.1/authenticate';
    const KEY = 'M2M0NDc0MmMtOWI0My00YzkzLWEzMjAtZjE3NjY4MmFjYzFkOjIyZGIxNmE5ZDA1MzQ4MjhiYjA3MjA1NzcxOTJmYzdl';

    try {
      const headersAuth = { 'Authorization': 'Basic ' + KEY };
      const response = await axios.post(URL_AUTH, null, { headers: headersAuth });
      if (response.status === 200) {
        const token = response.data;
        return token;
      } else {
        console.error('Error - ' + response.status);
        return '';
      }
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async checkNounLingvo(word) {

    const axios = require('axios');
    const token = await this.getAuthTokenLingvo();

    const URL_WORD_FORMS = 'https://developers.lingvolive.com/api/v1/WordForms';

    try {
      const headersWord = {
        'Authorization': 'Bearer ' + token
      };
      const params = {
        'text': word,
        'lang': 1049
      };
      const response = await axios.get(URL_WORD_FORMS, { headers: headersWord, params: params });
      if (response.status === 200) {
        const wordData = response.data;
        return wordData[0]['PartOfSpeech'] == 'существительное' &&  wordData[0]['Lexem'] == word;
      } 
      return false;
    } catch (error) {
      return false;
    }
  }

  async checkNounParaphaser(word) {
    try {
      const url = `http://paraphraser.ru/api?token=d6a965641880dd890cf5d9d1b821b96594dd0e1d&c=vector&query=${word}&top=1&lang=ru&format=json&forms=1&scores=0`;
  
      const data = await new Promise((resolve, reject) => {
        http.get(url, (response) => {
          let data = '';
  
          response.on('data', (chunk) => {
            data += chunk;
          });
  
          response.on('end', () => {
            resolve(data);
          });
  
          response.on('error', (error) => {
            return false;
          });
        });
      });
  
      const jsonObj = JSON.parse(data);
  
      for (const key in jsonObj.response) {
        const item = jsonObj.response[key];
        if (item.original === item.lemma && item.pos === "NOUN" && Object.keys(jsonObj).length !== 0) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async checkNounWiktionary(word) {
    const axios = require('axios');
    try {
      const url = `https://ru.wiktionary.org/wiki/${encodeURIComponent(word)}`;
      const response = await axios.get(url);
      const data = response.data;

      const wordToFind = 'noun';
      
      const regex = new RegExp(wordToFind);
      
      if (data.match(regex)) {
        return true;
      } 
      return false;
    } catch (error) {
      return false;
    }
  }

}

module.exports = WordAPI;