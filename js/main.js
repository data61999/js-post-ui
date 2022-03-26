import postApi from './api/postApi';

async function main() {
  try {
    const queryParams = {
      _page: 1,
      _limit: 5,
    };
    const response = await postApi.getAll(queryParams);
    console.log(response);
  } catch (error) {}
}

main();
