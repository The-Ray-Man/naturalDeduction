import { UUID } from "crypto";
import { Node } from "../api";
import { NodeType } from "../components/exercise/node";

type localStorage = {
  feedback_items: UUID[];
  favorite_items: UUID[];
  completed: UUID[];
  welcome_collapsed: boolean;
};

function readLocalStorage(): localStorage {
  let data = localStorage.getItem("data");
  if (data == null) {
    return {
      feedback_items: [],
      favorite_items: [],
      completed: [],
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

function isFavorite(fav: UUID) {
  return readLocalStorage().favorite_items.includes(fav);
}

function toggleFavorite(fav: UUID) {
  let data = readLocalStorage();
  if (data.favorite_items.includes(fav)) {
    data.favorite_items = data.favorite_items.filter((item) => item != fav);
  } else {
    data.favorite_items.push(fav);
  }
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

function isCompleted(exercise: UUID): boolean {
  return readLocalStorage().completed.includes(exercise);
}

function addCompleted(exercise: UUID) {
  let data = readLocalStorage();
  if (data.completed.includes(exercise)) {
    return;
  }
  data.completed.push(exercise);
  saveLocalStorage(data);
}

function allCompleted(): UUID[] {
  return readLocalStorage().completed;
}

function saveTree(root : UUID, nodes: NodeType[]) {
  localStorage.setItem("rootId", root);
  localStorage.setItem("nodes", JSON.stringify(nodes));
}

function loadTree(): {root: UUID | undefined, nodes: Node[]} {
  let root = localStorage.getItem("rootId");
  let nodes = localStorage.getItem("nodes");
  if (root == null || nodes == null) {
    return {root: undefined, nodes: []};
  }
  return {root: root as UUID, nodes: JSON.parse(nodes)};
}

export default {
  addFavorite,
  removeFavorite,
  isFavorite,
  allFavorites,
  toggleFavorite,
  addFeedback,
  existsFeedback,
  isWelcomeCollapsed,
  setWelcomeCollapsed,
  isCompleted,
  addCompleted,
  allCompleted,
  saveTree,
  loadTree,
};
