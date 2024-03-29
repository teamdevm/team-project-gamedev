const http = require('http');
const WordAPI = require('./WordAPI');

describe('WordAPI', () => {
  test('Fetch data for word "дом"', async () => {
    const word = 'дом';
    const result = await WordAPI.fetchData(word);
    expect(result).toBeTruthy();
  });

  test('Fetch data for word "олавфыа"', async () => {
    const word = 'олавфыа';
    const result = await WordAPI.fetchData(word);
    expect(result).toBeFalsy();
  });

  test('Fetch data for word "собака"', async () => {
    const word = 'собака';
    const result = await WordAPI.fetchData(word);
    expect(result).toBeTruthy();
  });

  test('Fetch data for word "ножницы"', async () => {
    const word = 'ножницы';
    const result = await WordAPI.fetchData(word);
    expect(result).toBeTruthy();
  });

  test('Fetch data for word "бегать"', async () => {
    const word = 'бегать';
    const result = await WordAPI.fetchData(word);
    expect(result).toBeFalsy();
  });

  test('Fetch data for word "красивый"', async () => {
    const word = 'красивый';
    const result = await WordAPI.fetchData(word);
    expect(result).toBeFalsy();
  });

  test('Fetch data for word "стул"', async () => {
    const word = 'стул';
    const result = await WordAPI.fetchData(word);
    expect(result).toBeTruthy();
  });

  test('Fetch data for word "зима"', async () => {
    const word = 'зима';
    const result = await WordAPI.fetchData(word);
    expect(result).toBeTruthy();
  });
});