const leftNavBarMap = [
  { name: "Subscriptions", id: "lockintube-lft-subscriptions", children: [] },
  {
    name: "You",
    id: "lockintube-lft-you",
    children: [
      { name: "History", id: "history" },
      { name: "Playlists", id: "playlists" },
      { name: "Watch later", id: "watch-later" },
      { name: "Liked videos", id: "liked-videos" },
      { name: "Your videos", id: "your-videos" },
      { name: "Downloads", id: "downloads" },
      { name: "Playables", id: "playables" },
    ],
  },
  {
    name: "Explore",
    id: "lockintube-lft-explore",
    children: [
      { name: "Shopping", id: "shopping" },
      {
        name: "Music",
        id: "music",
      },
      { name: "Movies & TV", id: "movies-tv" },
      { name: "Live", id: "live" },
      { name: "Gaming", id: "gaming" },
      { name: "News", id: "news" },
      { name: "Sports", id: "sports" },
      { name: "Learning", id: "learning" },
      { name: "Courses", id: "courses" },
      {
        name: "Fashion & Beauty",
        id: "fashion-beauty",
      },
      { name: "Podcasts", id: "podcasts" },
      { name: "Playables", id: "playables" },
    ],
  },
  {
    name: "More from YouTube",
    id: "lockintube-lft-mfyt",
    children: [
      { name: "YouTube Premium", id: "premium" },
      { name: "YouTube Studio", id: "studio" },
      { name: "YouTube TV", id: "tv" },
      { name: "YouTube Music", id: "music" },
      { name: "YouTube Kids", id: "kids" },
    ],
  },
];

// -------------------------------------

const checklist = document.getElementById("checklist");

const lftNavState = {};

var lftCheckBoxes = [];
var lftCheckboxIds = [];

function createChecklistItem() {
  checklist.innerHTML =
    "<ul>" +
    leftNavBarMap
      .map((item) => {
        const childrenHtml = item.children
          .map((child) => {
            return `
        <li>
            <div class="check-item">
                <input type="checkbox" id="${item.id}-${child.id}" />
                <label>
                ${child.name}
                </label>
            </div>
        </li>
      `;
          })
          .join("");

        return `
    <li>
      <div class="check-item">
        <input type="checkbox" id="${item.id}"  />
        <label>
          ${item.name}
        </label>
      </div>
      ${childrenHtml ? `<ul>${childrenHtml}</ul>` : ""}
    </li>
  `;
      })
      .join("") +
    "</ul>";
}

// -------------------------------------

async function getStoredData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(lftCheckboxIds, function (result) {
      lftCheckBoxes.forEach((checkbox) => {
        checkbox.checked = result[checkbox.id] === undefined ? true : !!result[checkbox.id];
        lftNavState[checkbox.id] = checkbox.checked;
        if (result[checkbox.id] === undefined) chrome.storage.local.set({ [checkbox.id]: true });
      });
      resolve();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  createChecklistItem(); // init checklist items before getting stored data to ensure checkboxes are in the DOM
  lftCheckBoxes = document.querySelectorAll('input[type="checkbox"]');
  lftCheckBoxes.forEach((checkbox) => lftCheckboxIds.push(checkbox.id));

  await getStoredData();
  // createChecklistItem(); // re-create checklist to reflect any changes in parent-child relationships (e.g. if parent is unchecked, children should be disabled)

  lftCheckBoxes.forEach((checkbox) => {
    checkbox.addEventListener("change", async (event) => {
      const isChecked = event.target.checked;

      lftNavState[event.target.id] = isChecked;
      chrome.storage.local.set({ [event.target.id]: isChecked });

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      //createChecklistItem(); // re-create checklist to reflect any changes in parent-child relationships (e.g. if parent is unchecked, children should be disabled)

      chrome.tabs.sendMessage(tab.id, { action: "runLftNav" }, () => {});
    });
  });
});
