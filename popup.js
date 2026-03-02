const checkBoxes = document.querySelectorAll('input[type="checkbox"]');

var checkboxIds = [];
checkBoxes.forEach((checkbox) => checkboxIds.push(checkbox.id));

async function getStoredData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(checkboxIds, function (result) {
      checkBoxes.forEach((checkbox) => {
        // console.log(result[checkbox.id]);
        checkbox.checked = !!result[checkbox.id];
        if (result[checkbox.id] === undefined) chrome.storage.local.set({ [checkbox.id]: false });
      });
      resolve();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await getStoredData();
  checkBoxes.forEach((checkbox) => {
    checkbox.addEventListener("change", async (event) => {
      const isChecked = event.target.checked;
      chrome.storage.local.set({ [event.target.id]: isChecked });

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      chrome.tabs.sendMessage(tab.id, { action: "runMain" }, () => {});
    });
  });
});
