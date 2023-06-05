const http = require('http');

class WordAPI {
  fetchData(word) {
    return new Promise(async (resolve, reject) => {
      try {
        word = word.toLowerCase();

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
          }).on('error', (error) => {
            reject(new Error('Произошла ошибка при выполнении запроса:', error.message));
          });
        });

        const jsonObj = JSON.parse(data);

        for (const key in jsonObj.response) {
          const item = jsonObj.response[key];
          if (item.original === item.lemma && item.pos === "NOUN" && Object.keys(jsonObj).length != 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      } catch (error) {
        reject(new Error('Произошла ошибка при обработке данных:', error.message));
      }
    });
  }
}

const myObject = new WordAPI();

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Введите слово: ', async (word) => {
  try {
    const result = await myObject.fetchData(word);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
  rl.close();
});
