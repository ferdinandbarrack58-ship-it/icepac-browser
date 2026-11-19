
const tabsContainer = document.getElementById("tabs");
const browserPage = document.getElementById("browserPage");
const homePage = document.getElementById("homePage");
const addressBar = document.getElementById("addressBar");

let tabs = [];
let activeTabId = null;
let nextTabId = 1;

function createTab() {
    const id = nextTabId++;

    const webview = document.createElement("webview");
    webview.setAttribute("partition", "persist:ice");
    webview.setAttribute("src", "about:blank");

    webview.style.width = "100%";
    webview.style.height = "100%";
    webview.style.display = "none";

    browserPage.appendChild(webview);

    const tab = {
        id,
        title: "New Tab",
        url: "about:blank",
        webview
    };

    tabs.push(tab);

    webview.addEventListener("page-title-updated", (event) => {
        tab.title = event.title || "New Tab";
        renderTabs();
    });

    webview.addEventListener("did-navigate", (event) => {
        tab.url = event.url;
        if (activeTabId === id) {
            addressBar.value = event.url;
        }
    });

    webview.addEventListener("did-navigate-in-page", (event) => {
        tab.url = event.url;
        if (activeTabId === id) {
            addressBar.value = event.url;
        }
    });

    switchTab(id);
}

function switchTab(id) {
    activeTabId = id;

    tabs.forEach(tab => {
        tab.webview.style.display =
            tab.id === id ? "flex" : "none";
    });

    const activeTab = getActiveTab();

    if (!activeTab) return;

    renderTabs();

    const isHome = activeTab.url === "about:blank";

    homePage.style.display = isHome ? "flex" : "none";
    browserPage.style.display = isHome ? "none" : "block";

    addressBar.value = isHome ? "" : activeTab.url;
}

function renderTabs() {
    tabsContainer.innerHTML = "";

    tabs.forEach(tab => {
        const button = document.createElement("div");
        button.className =
            "tab" + (tab.id === activeTabId ? " active" : "");

        const title = document.createElement("span");
        title.className = "tab-title";
        title.textContent = tab.title;

        const close = document.createElement("button");
        close.className = "close-tab";
        close.textContent = "×";
        close.title = "Close tab";

        close.addEventListener("click", (event) => {
            event.stopPropagation();
            closeTab(tab.id);
        });

        button.addEventListener("click", () => {
            switchTab(tab.id);
        });

        button.appendChild(title);
        button.appendChild(close);
        tabsContainer.appendChild(button);
    });
}

function getActiveTab() {
    return tabs.find(tab => tab.id === activeTabId);
}

function navigate(input) {
    const tab = getActiveTab();
    if (!tab || !input.trim()) return;

    let url;

    try {
        const parsed = new URL(input);

        if (["http:", "https:"].includes(parsed.protocol)) {
            url = parsed.href;
        } else {
            url = "https://www.google.com/search?q=" +
                encodeURIComponent(input);
        }
    } catch {
        if (input.includes(" ") || !input.includes(".")) {
            url = "https://www.google.com/search?q=" +
                encodeURIComponent(input);
        } else {
            url = "https://" + input;
        }
    }

    tab.url = url;
    tab.title = "Loading...";
    renderTabs();

    homePage.style.display = "none";
    browserPage.style.display = "block";

    addressBar.value = url;
    tab.webview.loadURL(url);
}

function closeTab(id) {
    const index = tabs.findIndex(tab => tab.id === id);
    if (index === -1) return;

    const wasActive = activeTabId === id;

    tabs[index].webview.remove();
    tabs.splice(index, 1);

    if (tabs.length === 0) {
        createTab();
        return;
    }

    if (wasActive) {
        const newIndex = Math.min(index, tabs.length - 1);
        switchTab(tabs[newIndex].id);
    } else {
        renderTabs();
    }
}

// Navigation controls

document.getElementById("newTabBtn").addEventListener("click", createTab);

document.getElementById("addressForm").addEventListener("submit", event => {
    event.preventDefault();
    navigate(addressBar.value);
});

document.getElementById("homeSearchForm").addEventListener("submit", event => {
    event.preventDefault();
    navigate(document.getElementById("homeSearch").value);
});

document.getElementById("backBtn").addEventListener("click", () => {
    const tab = getActiveTab();
    if (tab && tab.webview.canGoBack()) tab.webview.goBack();
});

document.getElementById("forwardBtn").addEventListener("click", () => {
    const tab = getActiveTab();
    if (tab && tab.webview.canGoForward()) tab.webview.goForward();
});

document.getElementById("reloadBtn").addEventListener("click", () => {
    const tab = getActiveTab();
    if (tab) tab.webview.reload();
});

document.getElementById("homeBtn").addEventListener("click", () => {
    const tab = getActiveTab();
    if (!tab) return;

    tab.url = "about:blank";
    tab.title = "New Tab";
    tab.webview.loadURL("about:blank");

    switchTab(tab.id);
});

document.querySelectorAll(".quick-links a").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        navigate(link.href);
    });
});

// Start browser with one tab
createTab();
