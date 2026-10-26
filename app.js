const tools = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "从零开始头脑风暴、写作和解决问题。",
    categories: ["写作", "生产力"],
    tags: ["对话", "通用", "灵感"],
    logo: "✦",
    logoClass: "logo-dark",
    url: "https://chatgpt.com/",
  },
  {
    id: "claude",
    name: "Claude",
    description: "擅长长文理解与自然、清晰的表达。",
    categories: ["写作", "生产力"],
    tags: ["长文本", "分析", "写作"],
    logo: "✺",
    logoClass: "logo-orange",
    url: "https://claude.ai/",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "带来源的答案，让研究从搜索开始就更快。",
    categories: ["学习", "生产力"],
    tags: ["搜索", "研究", "引用"],
    logo: "P",
    logoClass: "logo-blue",
    url: "https://www.perplexity.ai/",
  },
  {
    id: "canva",
    name: "Canva",
    description: "不用从空白画布开始的视觉设计工具。",
    categories: ["设计"],
    tags: ["模板", "海报", "社媒"],
    logo: "C",
    logoClass: "logo-purple",
    url: "https://www.canva.com/",
  },
  {
    id: "notion",
    name: "Notion",
    description: "把笔记、项目和团队知识放在一个地方。",
    categories: ["生产力", "会议"],
    tags: ["笔记", "项目", "协作"],
    logo: "N",
    logoClass: "logo-yellow",
    url: "https://www.notion.so/",
  },
  {
    id: "gamma",
    name: "Gamma",
    description: "把一个想法快速变成漂亮的演示文稿。",
    categories: ["设计", "生产力"],
    tags: ["演示", "提案", "生成"],
    logo: "γ",
    logoClass: "logo-green",
    url: "https://gamma.app/",
  },
  {
    id: "agent-qa",
    name: "agent-qa",
    description: "vostride 的自然语言应用测试智能体，覆盖网页、Android 和 iOS，具备持久记忆与经过验证的自我改进能力。",
    categories: ["自动化", "生产力"],
    tags: ["应用测试", "CLI", "MCP"],
    logo: "🧪",
    logoClass: "logo-blue",
    url: "https://vostride.com",
  },
];

const toolGrid = document.querySelector("#toolGrid");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const favoritesCount = document.querySelector("#favoritesCount");
const favoritesFilter = document.querySelector("#favoritesFilter");
const toast = document.querySelector("#toast");
const newsletterForm = document.querySelector("#newsletterForm");
const themeToggle = document.querySelector("#themeToggle");

let activeFilter = "全部";
let showFavoritesOnly = false;

function readStorage(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 隐私模式或禁用存储时，页面仍保持可用。
  }
}

let favorites = new Set(JSON.parse(readStorage("flowly-favorites", "[]")));

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[char]));
}

function updateFavoritesCount() {
  favoritesCount.textContent = favorites.size;
}

function getVisibleTools() {
  const query = searchInput.value.trim().toLowerCase();
  return tools.filter((tool) => {
    const searchable = [tool.name, tool.description, ...tool.categories, ...tool.tags].join(" ").toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesFilter = activeFilter === "全部" || tool.categories.includes(activeFilter);
    const matchesFavorites = !showFavoritesOnly || favorites.has(tool.id);
    return matchesQuery && matchesFilter && matchesFavorites;
  });
}

function renderTools() {
  const visibleTools = getVisibleTools();
  toolGrid.innerHTML = visibleTools.map((tool) => `
    <article class="tool-card">
      <div class="tool-card-top">
        <span class="tool-logo ${tool.logoClass}" aria-hidden="true">${tool.logo}</span>
        <button class="favorite-button ${favorites.has(tool.id) ? "is-favorite" : ""}" type="button" data-favorite="${tool.id}" aria-label="${favorites.has(tool.id) ? "取消收藏" : "收藏"} ${escapeHtml(tool.name)}">${favorites.has(tool.id) ? "♥" : "♡"}</button>
      </div>
      <h3>${escapeHtml(tool.name)}</h3>
      <p>${escapeHtml(tool.description)}</p>
      <div class="tool-tags">${tool.tags.map((tag) => `<span class="tool-tag">${escapeHtml(tag)}</span>`).join("")}</div>
      <a class="tool-open" href="${tool.url}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${escapeHtml(tool.name)}">↗</a>
    </article>
  `).join("");
  emptyState.hidden = visibleTools.length > 0;
  updateFavoritesCount();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

document.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    const id = favoriteButton.dataset.favorite;
    if (favorites.has(id)) {
      favorites.delete(id);
      showToast("已从你的收藏中移除");
    } else {
      favorites.add(id);
      showToast("已加入你的收藏");
    }
    writeStorage("flowly-favorites", JSON.stringify([...favorites]));
    renderTools();
    return;
  }

  const filterTab = event.target.closest("[data-filter]");
  if (filterTab) {
    activeFilter = filterTab.dataset.filter;
    showFavoritesOnly = false;
    favoritesFilter.classList.remove("is-active");
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      const isActive = tab === filterTab;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    renderTools();
    return;
  }

  const quickSearch = event.target.closest("[data-quick-search]");
  if (quickSearch) {
    searchInput.value = quickSearch.dataset.quickSearch;
    activeFilter = "全部";
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      const isActive = tab.dataset.filter === "全部";
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    renderTools();
    document.querySelector("#discover").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const scene = event.target.closest("[data-scene]");
  if (scene) {
    searchInput.value = scene.dataset.scene;
    activeFilter = "全部";
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      const isActive = tab.dataset.filter === "全部";
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    renderTools();
    document.querySelector(".tool-section").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

searchInput.addEventListener("input", renderTools);

favoritesFilter.addEventListener("click", () => {
  showFavoritesOnly = !showFavoritesOnly;
  favoritesFilter.classList.toggle("is-active", showFavoritesOnly);
  if (showFavoritesOnly) {
    showToast(favorites.size ? `正在查看 ${favorites.size} 个收藏` : "先收藏几个工具吧");
  }
  renderTools();
});

document.querySelector("#clearFilters").addEventListener("click", () => {
  searchInput.value = "";
  activeFilter = "全部";
  showFavoritesOnly = false;
  favoritesFilter.classList.remove("is-active");
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    const isActive = tab.dataset.filter === "全部";
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  renderTools();
});

newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const emailInput = document.querySelector("#emailInput");
  if (!emailInput.value.trim()) return;
  showToast("订阅成功，下周见 ✦");
  newsletterForm.reset();
});

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  writeStorage("flowly-theme", isDark ? "dark" : "light");
  themeToggle.setAttribute("aria-label", isDark ? "切换到浅色主题" : "切换到深色主题");
});

if (readStorage("flowly-theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.setAttribute("aria-label", "切换到浅色主题");
}

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && document.activeElement === searchInput) {
    searchInput.value = "";
    renderTools();
    searchInput.blur();
  }
});

renderTools();
