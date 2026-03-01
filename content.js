const stylesMap = {
  "lockintube-hide-recommendations": {
    condition: () => {
      return !window.location.pathname.includes("@");
    },
    style: `
      ytd-rich-grid-renderer {
        display: none !important;
      }
    `,
  },
  "lockintube-hide-comments": {
    style: `
      ytd-comments {
        display: none !important;
      }
    `,
  },
  "lockintube-hide-sidebar": {
    condition: () => {
      return window.location.pathname.includes("/watch");
    },
    style: `
      #secondary {
        display: none !important;
      }
    `,
  },
  "lockintube-hide-end-screen": {
    style: `
      div.ytp-fullscreen-grid-main-content {
        display: none !important;
      }
    `,
  },
  "lockintube-hide-shorts": {
    style: `
      grid-shelf-view-model {
        display: none !important;
      }
      yt-chip-cloud-chip-renderer:nth-child(2) {
        display: none !important;
      }
      ytd-search-filter-renderer:nth-child(4) {
        display: none !important;
      }
      ytd-guide-entry-renderer:nth-child(2) {
        display: none !important;
      }
      #dismissible.ytd-rich-shelf-renderer {
        display: none !important;
      }
      ytd-reel-shelf-renderer {
        display: none !important;
      }
        `,
  },
  "lockintube-hide-talk-to-recs": {
    style: `
      yt-talk-to-recs-view-model {
        display: none !important;
      }
    `,
  },
};

// -------------------------------------

const allFeaturesState = {};

// -------------------------------------

async function getLocalValues() {
  console.log("Checking active styles...");
  return new Promise((resolve) => {
    chrome.storage.local.get([...Object.keys(stylesMap), "lockintube-disable-shorts"], function (result) {
      Object.keys(result).map((key) => {
        allFeaturesState[key] = result[key];
      });
      console.log(allFeaturesState);
      resolve();
    });
  });
}

// -------------------------------------

function applyStyles() {
  console.log("Applying styles...");
  const style = document.createElement("style");
  style.textContent = Object.keys(stylesMap)
    .map((key) =>
      allFeaturesState[key] && (stylesMap[key].condition ? stylesMap[key].condition() : true)
        ? stylesMap[key].style
        : "",
    )
    .join("\n");
  console.log(style.textContent);
  document.head.appendChild(style);
}

function getAwayFromShorts() {
  if (window.location.pathname.includes("/shorts") && allFeaturesState["lockintube-disable-shorts"])
    window.location.href = "https://www.youtube.com/";
}

// -------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  await getLocalValues();
  applyStyles();
  getAwayFromShorts();
});

// -------------------------------------

let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("URL changed to: ", lastUrl);
    applyStyles();
    getAwayFromShorts();
  }
}).observe(document, { subtree: true, childList: true });

console.log("Content script loaded");
