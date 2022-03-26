import postApi from './api/postApi';
import { setTextContent, truncateText } from './uilts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// handle dayjs.fromNow
dayjs.extend(relativeTime);

function createPostElement(post) {
  if (!post) return;

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

  setTextContent(liElement, '[data-id="title"]', post.title);
  setTextContent(
    liElement,
    '[data-id="description"]',
    truncateText(post.description, 100)
  );
  setTextContent(liElement, '[data-id="author"]', post.author);
  setTextContent(
    liElement,
    '[data-id="timeSpan"]',
    `- ${dayjs(post.updateAt).fromNow()}`
  );

  const thumnailElement = liElement.querySelector('[data-id="thumbnail"]');
  if (thumnailElement) {
    thumnailElement.src = post.imageUrl;
    // set default thumbnail when thumnail is error
    thumnailElement.addEventListener('error', () => {
      thumnailElement.src =
        'https://via.placeholder.com/1368x400?text=thumnail';
    });
  }

  // attach event

  return liElement;
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
    console.log('get all fail', error);
  }
})();
