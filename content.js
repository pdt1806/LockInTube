const displayNoneStylesMap = {
  "lockintube-hide-recommendations": [
    {
      condition: () => {
        return !window.location.pathname.includes("@");
      },
      selector: ["ytd-rich-grid-renderer"],
    },
  ],
  "lockintube-hide-comments": [
    {
      selector: ["ytd-comments"],
    },
  ],
  "lockintube-hide-sidebar": [
    {
      condition: () => {
        return window.location.pathname.includes("/watch");
      },
      selector: ["#secondary"],
    },
  ],
  "lockintube-hide-end-screen": [
    {
      selector: ["div.ytp-fullscreen-grid-main-content"],
    },
  ],
  "lockintube-hide-shorts": [
    {
      selector: [
        "ytd-mini-guide-entry-renderer:nth-child(2)",
        "ytd-search-filter-renderer:nth-child(4)",
        "ytd-guide-section-renderer:nth-child(1) #items ytd-guide-entry-renderer:nth-child(2)", // left nav bar shorts entry
        "#dismissible.ytd-rich-shelf-renderer",
        "ytd-reel-shelf-renderer",
        "#tabsContent yt-tab-group-shape div.tabGroupShapeTabs yt-tab-shape:nth-child(3)", // for channel shorts tab
      ],
    },
    {
      condition: () => {
        return window.location.pathname.includes("/results"); // only hide shorts in search results, not in channel pages
      },
      selector: ["yt-chip-cloud-chip-renderer:nth-child(2)", "#contents grid-shelf-view-model"],
    },
  ],
  "lockintube-hide-talk-to-recs": [
    {
      selector: ["yt-talk-to-recs-view-model"],
    },
  ],
};

// parent wrapper selector: ytd-guide-section-renderer (:nth-child(2))
const lftNavBarMap = {
  "lockintube-lft-subscriptions": [],
  "lockintube-lft-you": [
    { id: "history", selector: `#section-items ytd-guide-entry-renderer:has(a[href="/feed/history"])` }, //
    { id: "playlists", selector: `#section-items ytd-guide-entry-renderer:has(a[href="/feed/playlists"])` },
    { id: "watch-later", selector: "#section-items ytd-guide-entry-renderer:nth-child(3)" },
    { id: "liked-videos", selector: "#section-items ytd-guide-entry-renderer:nth-child(4)" },
    { id: "your-videos", selector: "#section-items ytd-guide-entry-renderer:nth-child(5)" },
    { id: "downloads", selector: "#section-items ytd-guide-downloads-entry-renderer" },
    { id: "playables", selector: "#expandable-items ytd-guide-entry-renderer" },
  ],
  "lockintube-lft-explore": [
    { id: "shopping", selector: `#items ytd-guide-entry-renderer:has(a[title="Shopping"])` },
    { id: "music", selector: `#items ytd-guide-entry-renderer:has(a[title="Music"])` },
    { id: "movies-tv", selector: `#items ytd-guide-entry-renderer:has(a[title="Movies & TV"])` },
    { id: "live", selector: "#expandable-items ytd-guide-entry-renderer:nth-child(1)" },
    { id: "gaming", selector: "#expandable-items ytd-guide-entry-renderer:nth-child(2)" },
    { id: "news", selector: "#expandable-items ytd-guide-entry-renderer:nth-child(3)" },
    { id: "sports", selector: "#expandable-items ytd-guide-entry-renderer:nth-child(4)" },
    { id: "learning", selector: "#expandable-items ytd-guide-entry-renderer:nth-child(5)" },
    { id: "courses", selector: "#expandable-items ytd-guide-entry-renderer:nth-child(6)" },
    { id: "fashion-beauty", selector: "#expandable-items ytd-guide-entry-renderer:nth-child(7)" },
    { id: "podcasts", selector: "#expandable-items ytd-guide-entry-renderer:nth-child(8)" },
    { id: "playables", selector: "#expandable-items ytd-guide-entry-renderer:nth-child(9)" },
  ],
  "lockintube-lft-mfyt": [
    { id: "premium", selector: "#items ytd-guide-entry-renderer:nth-child(1)" },
    { id: "studio", selector: "#items ytd-guide-entry-renderer:nth-child(2)" },
    { id: "tv", selector: "#items ytd-guide-entry-renderer:nth-child(3)" },
    { id: "music", selector: "#items ytd-guide-entry-renderer:nth-child(4)" },
    { id: "kids", selector: "#items ytd-guide-entry-renderer:nth-child(5)" },
  ],
};

// -------------------------------------

function log(message) {
  console.log(`[LockInTube] ${message}`);
}

const allLftFeatureIds = Object.keys(lftNavBarMap).reduce((ids, parentKey) => {
  ids.push(parentKey);
  lftNavBarMap[parentKey].forEach((child) => ids.push(`${parentKey}-${child.id}`));
  return ids;
}, []);

const allFeaturesIds = [...Object.keys(displayNoneStylesMap), "lockintube-normalize-shorts", ...allLftFeatureIds];
const allFeaturesState = {};

// -------------------------------------

async function getLocalValues() {
  // log("Checking active styles...");
  return new Promise((resolve) => {
    chrome.storage.local.get(allFeaturesIds, function (result) {
      // log("Retrieved local values: ", result);
      Object.keys(result).map((key) => {
        allFeaturesState[key] = result[key];
        // log(`Feature ${key} is ${result[key] ? "enabled" : "disabled"}`);
      });
      // log(JSON.stringify(allFeaturesState, null, 2));
      resolve();
    });
  });
}

// -------------------------------------

var appliedStylesText;
var appliedStyleId;
function applyDisplayNoneStyles() {
  // log("Applying styles...");
  // log(window.location.pathname);
  const style = document.createElement("style");
  style.textContent = Object.keys(displayNoneStylesMap)
    .map((key) => {
      if (!allFeaturesState[key]) return "";
      return displayNoneStylesMap[key]
        .filter((styleObj) => (styleObj.condition ? styleObj.condition() : true))
        .map((styleObj) => styleObj.selector.map((selector) => `${selector} { display: none !important; }`).join("\n"))
        .join("\n");
    })
    .join("\n");
  if (style.textContent === appliedStylesText) return; // no need to re-apply the same styles

  if (appliedStyleId) {
    const oldStyle = document.getElementById(appliedStyleId);
    oldStyle && oldStyle.remove();
  }
  appliedStyleId = `lockintube-styles-${Date.now()}`;
  appliedStylesText = style.textContent;
  style.id = appliedStyleId;
  document.head.appendChild(style);
}

var appliedLftNavBarStyleText;
var appliedLftNavBarStyleId;
function applyLftNavBarStyles() {
  const style = document.createElement("style");
  style.textContent = Object.keys(lftNavBarMap)
    .map((key, outer_index) => {
      const parentSelector = `ytd-guide-section-renderer:nth-child(${outer_index + 2})`;
      if (!!!allFeaturesState[key]) return `${parentSelector} { display: none !important; } `;

      return lftNavBarMap[key]
        .map((child) => {
          const childKey = `${key}-${child.id}`;
          if (!allFeaturesState[childKey]) {
            return `${parentSelector} ${child.selector} { display: none !important; } `;
          }
          return "";
        })
        .join("\n");
      return "";
    })
    .join("\n");
  if (style.textContent === appliedLftNavBarStyleText) return; // no need to re-apply the same styles

  if (appliedLftNavBarStyleId) {
    const oldStyle = document.getElementById(appliedLftNavBarStyleId);
    oldStyle && oldStyle.remove();
  }
  appliedLftNavBarStyleId = `lockintube-lft-styles-${Date.now()}`;
  appliedLftNavBarStyleText = style.textContent;
  style.id = appliedLftNavBarStyleId;
  document.head.appendChild(style);
}

function normalizeShorts() {
  if (!window.location.pathname.includes("/shorts")) return;
  if (window.location.pathname.includes("@")) return;
  if (!allFeaturesState["lockintube-normalize-shorts"]) return;

  videoId = window.location.pathname.split("/shorts/")[1];
  log("Normalizing shorts video with id: ", videoId);
  window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
}

// -------------------------------------

async function main() {
  await getLocalValues();
  applyDisplayNoneStyles();
  normalizeShorts();
  // log("Applied styles and normalized shorts if needed");
}

async function lftNav() {
  await getLocalValues();
  applyLftNavBarStyles();
}

document.addEventListener("DOMContentLoaded", async () => {
  await main();
  await lftNav();
});

// -------------------------------------

let lastUrl = location.href;
new MutationObserver(async () => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    log("URL changed to: ", lastUrl);
    await main();
    await lftNav();
  }
}).observe(document, { subtree: true, childList: true });

log("Content script loaded");

// -------------------------------------
// Listen for messages from popup.js

chrome.runtime.onMessage.addListener((message, _, __) => {
  if (message.action === "runMain") {
    main();
    return true; // keeps sendResponse alive (async)
  }
  if (message.action === "runLftNav") {
    lftNav();
    return true; // keeps sendResponse alive (async)
  }
});
