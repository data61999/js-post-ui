import postApi from './api/postApi';
import { setTextContent } from './uilts';

function createPostElement(post) {
  if (!post) return;

  try {
    // get and clone template
    const templateElement = document.getElementById('postTemplate');

    const liElement = templateElement.content.firstElementChild.cloneNode(true);

    // update DOM title, description, author, thumnail
    // const titleElement = liElement.querySelector('[data-id="title"]');
    // titleElement.textContent = post.title;

    // const descriptionElement = liElement.querySelector(
    //   '[data-id="description"]'
    // );
    // descriptionElement.textContent = post.description;

    // const authorElement = liElement.querySelector('[data-id="author"]');
    // authorElement.textContent = post.author;

    setTextContent(liElement, 'title', post.title);
    setTextContent(liElement, 'description', post.description);
    setTextContent(liElement, 'author', post.author);

    const thumnailElement = liElement.querySelector('[data-id="thumbnail"]');
    thumnailElement.src = post.imageUrl;

    // attach event

    return liElement;
  } catch (error) {
    console.log('fail to create post', error);
  }
}

function renderPostList(postList) {
  if (!Array.isArray(postList) || postList.length === 0) return;

  const ulElement = document.getElementById('postList');
  if (!ulElement) return;

  postList.forEach((post) => {
    const liElement = createPostElement(post);
    ulElement.appendChild(liElement);
  });
}

(async () => {
  try {
    const queryParams = {
      _page: 1,
      _limit: 6,
    };
    const { data, pagination } = await postApi.getAll(queryParams);
    renderPostList(data);
  } catch (error) {
    console.log(error);
  }
})();
