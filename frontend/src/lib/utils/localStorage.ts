import { UUID } from "crypto";

type localStorage = {
  feedback_items: UUID[];
  favorite_items: UUID[];
  welcome_collapsed: boolean;
};

function readLocalStorage(): localStorage {
  let data = localStorage.getItem("data");
  if (data == null) {
    return {
      feedback_items: [],
      favorite_items: [],
      welcome_collapsed: false,
    };
  }
  return JSON.parse(data);
}

function saveLocalStorage(data: localStorage) {
  localStorage.setItem("data", JSON.stringify(data));
}

function setWelcomeCollapsed(collapsed: boolean) {
  let data = readLocalStorage();
  data.welcome_collapsed = collapsed;
  saveLocalStorage(data);
}

function isWelcomeCollapsed(): boolean {
  return readLocalStorage().welcome_collapsed;
}

function addFavorite(fav: UUID) {
  let data = readLocalStorage();
  if (data.favorite_items.includes(fav)) {
    return;
  }
  data.favorite_items.push(fav);
  saveLocalStorage(data);
}

function removeFavorite(fav: UUID) {
  let data = readLocalStorage();
  data.favorite_items = data.favorite_items.filter((item) => item != fav);
  saveLocalStorage(data);
}

function allFavorites(): UUID[] {
  return readLocalStorage().favorite_items;
}

function addFeedback(feedback: UUID) {
  let data = readLocalStorage();
  if (data.feedback_items.includes(feedback)) {
    return;
  }
  data.feedback_items.push(feedback);
  saveLocalStorage(data);
}

function existsFeedback(feedback: UUID): boolean {
  return readLocalStorage().feedback_items.includes(feedback);
}

export default {
  addFavorite,
  removeFavorite,
  allFavorites,
  addFeedback,
  existsFeedback,
  isWelcomeCollapsed,
  setWelcomeCollapsed,
};
