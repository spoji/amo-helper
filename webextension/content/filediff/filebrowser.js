/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function createCommand(id, text, key, func) {
  let backToReview = document.querySelector("#commands tr:last-child");
  let tr = backToReview.parentNode.insertBefore(document.createElement("tr"), backToReview);
  tr.id = id;

  let th = tr.appendChild(document.createElement("th"));
  let td = tr.appendChild(document.createElement("td"));

  if (key) {
    let code = document.createElement("code");
    code.textContent = key;
    code.setAttribute("title", text);
    th.appendChild(code);
  } else {
    tr.className = "amoqueue-no-key";
  }

  let anchor = document.createElement("a");
  anchor.className = "command";
  anchor.setAttribute("href", "#");
  anchor.textContent = text;
  td.appendChild(anchor);

  anchor.addEventListener("click", (event) => {
    func(event);
    event.preventDefault();
    event.stopPropagation();
  });

  if (key) {
    window.addEventListener("keypress", (event) => {
      if (event.key == key) {
        func(event);
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }
}

createCommand("amoqueue-hide-delete", "Toggle deleted lines", "+", () => {
  document.body.classList.toggle("amoqueue-hide-delete");
});

createCommand("amoqueue-copy-slug", "Copy Slug", null, () => {
  let slug = document.querySelector("a.command[href*='editors/review']").getAttribute("href").split("/")[4];

  let textarea = document.createElement("textarea");
  textarea.value = decodeURIComponent(slug);

  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
});

// TODO move this to downloads when there is a simple import mechanism
createCommand("amoqueue-download", "Download", null, async () => {
  let version = document.getElementById("metadata").getAttribute("data-version");
  let slug = document.getElementById("metadata").getAttribute("data-slug");

  let prefs = await browser.runtime.sendMessage({ action: "infostorage", op: "get", storage: "slug", keys: ["slugInfo." + slug] });
  let id = prefs["slugInfo." + slug];

  chrome.runtime.sendMessage({ action: "download", addonid: id, version: version });
});

// TODO move this to filewindow when there is a simple import mechanism
Promise.all([
  browser.storage.local.get({ "filewindow-enabled": false }),
  browser.runtime.sendMessage({ action: "filewindow-isfilewindow" })
]).then(([prefs, isfilewindow]) => {
  if (!prefs["filewindow-enabled"] || !isfilewindow) {
    return;
  }

  createCommand("amoqueue-filewindow-savepos", "Save Window Position", null, () => {
    chrome.runtime.sendMessage({ action: "filewindow-position" });
  });
});
