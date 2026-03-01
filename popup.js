const checkBoxes = document.querySelectorAll('input[type="checkbox"]');

var checkboxIds = [];
checkBoxes.forEach((checkbox) => checkboxIds.push(checkbox.id));

async function getStoredData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(checkboxIds, function (result) {
      checkBoxes.forEach((checkbox) => {
        console.log(result[checkbox.id]);
        checkbox.checked = !!result[checkbox.id];
      });
      resolve();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await getStoredData();
  checkBoxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      chrome.storage.local.set({ [event.target.id]: isChecked });
    });
  });
});
