import postApi from './api/postApi';
import { setTextContent, truncateText } from './uilts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import debounce from 'lodash.debounce';

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
  if (!Array.isArray(postList)) return;

  const ulElement = document.getElementById('postList');
  if (!ulElement) return;

  // clear old post list before render new post list
  ulElement.textContent = '';

  postList.forEach((post) => {
    const liElement = createPostElement(post);
    ulElement.appendChild(liElement);
  });
}

function handlePrevLinkClick(e) {
  e.preventDefault();

  const ulPagination = document.getElementById('pagination');
  if (!ulPagination) return;

  const page = Number.parseInt(ulPagination.dataset.page) || 1;
  if (page <= 1) return;

  handleFilterChange('_page', page - 1);
}
function handleNextLinkClick(e) {
  e.preventDefault();

  const ulPagination = document.getElementById('pagination');
  if (!ulPagination) return;

  const page = Number.parseInt(ulPagination.dataset.page) || 1;
  const totalPage = Number.parseInt(ulPagination.dataset.totalPage);
  if (page >= totalPage) return;

  handleFilterChange('_page', page + 1);
}

function initPagination() {
  const ulPagination = document.getElementById('pagination');
  if (!ulPagination) return;

  // add event click for prev link
  const prevLink = ulPagination.firstElementChild?.firstElementChild;
  if (prevLink) {
    prevLink.addEventListener('click', handlePrevLinkClick);
  }

  // add event click for prev link
  const nextLink = ulPagination.lastElementChild?.firstElementChild;
  if (nextLink) {
    nextLink.addEventListener('click', handleNextLinkClick);
  }
}

function initURL() {
  const url = new URL(window.location);
  if (!url.searchParams.get('_page')) url.searchParams.set('_page', 1);
  if (!url.searchParams.get('_limit')) url.searchParams.set('_limit', 6);

  history.pushState({}, '', url);
}

function renderPagination(pagination) {
  const ulPagination = document.getElementById('pagination');
  if (!pagination || !ulPagination) return;

  const { _page, _limit, _totalRows } = pagination;
  console.log({ _page, _limit, _totalRows });
  // calc total page
  const totalPage = Math.ceil(_totalRows / _limit);

  // save total page and current page to ul pagination
  ulPagination.dataset.page = _page;
  ulPagination.dataset.totalPage = totalPage;

  // handle disable prev and next link
  if (_page <= 1) ulPagination.firstElementChild?.classList.add('disabled');
  else ulPagination.firstElementChild?.classList.remove('disabled');

  if (_page >= totalPage)
    ulPagination.lastElementChild?.classList.add('disabled');
  else ulPagination.lastElementChild?.classList.remove('disabled');
}

async function handleFilterChange(filterName, filterValue) {
  try {
    //update query params
    const url = new URL(window.location);
    url.searchParams.set(filterName, filterValue);
    if (filterName === 'title_like') url.searchParams.set('_page', 1);

    history.pushState({}, '', url);

    // fetch api
    // re-render api post list
    const { data, pagination } = await postApi.getAll(url.searchParams);
    renderPostList(data);
    renderPagination(pagination);
  } catch (error) {
    console.log('fetch post list fail', error);
  }
}

const debounceSearch = debounce((event) => {
  handleFilterChange('title_like', event.target.value);
}, 500);

function initSearch() {
  const searchInput = document.getElementById('inputSearch');
  if (!searchInput) return;

  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.get('title_like'))
    searchInput.value = queryParams.get('title_like');

  searchInput.addEventListener('input', debounceSearch);
}

(async () => {
  try {
    // binding event click for prev/next link
    initPagination();

    // binding search event
    initSearch();

    // set default params(_page, _limit) on url
    initURL();

    // fectch post list based on search params
    const queryParams = new URLSearchParams(window.location.search);
    const { data, pagination } = await postApi.getAll(queryParams);
    renderPostList(data);
    renderPagination(pagination);
  } catch (error) {
    console.log('get all fail', error);
  }
})();
