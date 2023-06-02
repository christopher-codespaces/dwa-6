import {
    BOOKS_PER_PAGE,
    authors,
    genres,
    books,
    html,
  } from "./data.js";
  import {
    populateDropdownMenu,
    setThemeColors,
    createPreviewFragment,
    displayBooks,
  } from "./function.js";

  // Data

  /**
   * The variable will be used to store matches of
   * current filter settings from the books object.
   * @type {Array}
   */
  let matches = books;

  /**
   * This variable will be used to as the current page of
   * books being display and will increment by 1.
   * @type {number}
   */
  let page = 1;

  let startIndex = (page - 1) * BOOKS_PER_PAGE;
  let endIndex = BOOKS_PER_PAGE;

  /**
   * range variable will be used to extract a certain number of books that
   * will be displayed on webpage using array slice method
   */
  let range = [startIndex, endIndex];

  // Error Checking
  if (!books && !Array.isArray(books)) {
    throw new Error("Source required");
  }

  if (!range && range.length < 2) {
    throw new Error("Range must be an array with two numbers");
  }

  /**
   * This function is used to popultae the drop down lists of
   * genres and authors.
   * @type {function }
   */
  populateDropdownMenu(genres, "Genres", html.search.genre);
  populateDropdownMenu(authors, "Authors", html.search.author);

  /**
   * This will check for a preference of dark in the css .
   * If there is then the theme settings will updated using the {@link setThemeColors} function
   * */
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    html.settings.theme.value = "night";
    setThemeColors("night");
  } else {
    html.settings.theme.value = "day";
    setThemeColors("day");
  }

  // EVENT HANDLERS

  /**
   * This event handler will fire when the user changes value of dropdown in settings and clicks on the "Save" button.
   * It can toggle between a light mode and dark mode so that a user can use the app comfortably at night.
   * @param {Event} event
   */

  const toggleLightAndDarkModeHandler = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    if (theme === "night") {
      document.documentElement.style.setProperty("--color-dark", "255, 255, 255");
      document.documentElement.style.setProperty("--color-light", "10, 10, 20");
    } else {
      document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
      document.documentElement.style.setProperty("--color-light", "255, 255, 255");
    }

    html.settings.overlay.open = false;
  };

  /**
   * This function will fire when book previews are added to the web page.
   *  This will add event listeners so they will be able to be clicked on
   *  and view the open active Preview with the {@link showBookPreviewHandler}
   */
  const addBookPreviewHandler = () => {
    const previewsArray = Array.from(document.querySelectorAll("[preview]"));

    for (const preview of previewsArray) {
      preview.addEventListener("click", showBookPreviewHandler);
    }
  };
  html.list.item.appendChild(createPreviewFragment(matches, range));
  displayBooks(matches, page);

  /**
   * This handler will fire when a user clicks on the "Show More" button.
   * The page number will increase by 1 and new book items will be appended to the webpage.
   * The new book items will now be able to be clicked on to view the book overlay
   * and the "show more" button showing the number of items left will be updated
   */
  const showMoreBooksHandler = () => {
    page = page + 1;
    range = [(page - 1) * BOOKS_PER_PAGE, page * BOOKS_PER_PAGE];

    html.list.item.appendChild(createPreviewFragment(matches, range));
    addBookPreviewHandler();

    displayBooks(matches, page);
  };

  /**
   * This event handler will fire when a user clicks on the "search button".
   * The form overlay will appear allowing user to filter books by genre, author or title
   */
  const openSearchOverlayHandler = () => {
    html.search.overlay.style.display = "block";
    html.search.title.focus();
  };
  /**
   * This event handler will fire when a user clicks on the "cancel" button in the search overlay
   */
  const closeSearchOverlayHandler = () => {
    html.search.overlay.style.display = "none";
  };

  /**
   * This event handler will fire when a user clicks on the "settings" button.
   * The form overlay will appear allowing the user to toggle between the dark and light mode
   */
  const openSettingsOverlayHandler = () => {
    html.settings.overlay.style.display = "block";
  };

  /**
   * This event handler will fire when a user clicks on the "cancel" button in the settings overlay
   */
  const closeSettingsOverlayHandler = () => {
    html.settings.overlay.style.display = "none";
  };

  /**
   * This handler will fire when the book Preview overlay is closed. The overlay will be closed
   */
  const closeBookPreviewHandler = () => {
    html.preview.active.style.display = "none";
  };

  /**
   * This handler will fire when a user clicks on submit button of the search overlay.
   * When the user manipulates the input fields of Title, genre or author so that it can
   * be filtered to the books they desire, the filtered books will then be shown on the webpage
   * @param {Event} event
   */

  const filterBooksHandler = (event) => {
    html.search.overlay.style.display = "none";
    event.preventDefault();

    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const selectedGenre = filters.genre;
    const selectedAuthor = filters.author;
    const selectedTitle = filters.title;
    let results = [];

    if (
      selectedTitle === "" &&
      selectedGenre === "any" &&
      selectedAuthor === "any"
    ) {
      results = books;
    } else {
      for (const book of books) {
        const macthesTitle =
          selectedTitle.trim() === "" ||
          book.title.toLowerCase().includes(selectedTitle.toLowerCase());

        const matchesAuthor =
          selectedAuthor === "any" || book.author === selectedAuthor;

        let matchesGenre = false;

        for (const genre of book.genres) {
          if (selectedGenre === "any") {
            matchesGenre = true;
          } else if (genre === selectedGenre) {
            matchesGenre = true;
          }
        }

        if (macthesTitle && matchesAuthor && matchesGenre) {
          results.push(book);
        }
      }
    }

    matches = results;

    if (matches.length === 0) {
      html.list.message.style.display = "block";
    } else {
      html.list.message.style.display = "none";
    }

    page = 1;
    range = [(page - 1) * BOOKS_PER_PAGE, page * BOOKS_PER_PAGE];
    html.list.button.disabled = false;

    html.list.item.innerHTML = "";
    html.list.item.appendChild(createPreviewFragment(results, range));
    addBookPreviewHandler();

    displayBooks(matches, page);
    html.search.form.reset();
  };

  /**
   * This handler will fire when a user clicks on any book displayed.
   *  In order to determine which book the user is currently clicking on the
   * entire event buble path is checked with event.path or event.composedPath().
   * The bubbling path is looped over until an element with a preview ID is found.
   *  Once found the book preview overlay will appear and the Image, title containing,
   * subtitle containing the author's name and the year the book was publised as well a short description of the book
   * @param {Event} event
   *
   */
  const showBookPreviewHandler = (event) => {
    let pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
      const previewId = node.dataset.preview;
      if (active) break;

      for (const singleBook of books) {
        if (singleBook.id === previewId) {
          active = singleBook;
        }
      }
    }

    if (!active) {
      return;
    }

    html.preview.active.style.display = "block";
    html.preview.blur.src = active.image;
    html.preview.image.src = active.image;
    html.preview.title.innerText = active.title;
    html.preview.subtitle.innerText = `${authors[active.author]} (${new Date(
      active.published
    ).getFullYear()})`;
    html.preview.description.innerText = active.description;
  };

  addBookPreviewHandler();

  // EVENT LISTENERS

  html.search.cancel.addEventListener("click", openSearchOverlayHandler);

  html.other.search.addEventListener("click", closeSearchOverlayHandler);

  html.other.settings.addEventListener("click", openSettingsOverlayHandler);

  html.settings.cancel.addEventListener("click", closeSettingsOverlayHandler);

  html.settings.form.addEventListener("submit", toggleLightAndDarkModeHandler);

  html.list.button.addEventListener("click", showMoreBooksHandler);

  html.preview.close.addEventListener("click", closeBookPreviewHandler);

  html.list.item.addEventListener("click", showBookPreviewHandler);

  html.search.form.addEventListener("submit", filterBooksHandler);