const Blacklist = readConfig("Blacklist", "an.app.placeholder.name").toString().toLowerCase().split(",");
const Whitelist = readConfig("Whitelist", "an.app.placeholder.name").toString().toLowerCase().split(",");
const WhiteMode = readConfig("White", false);
var lastActiveTime = 0;

function log(message) {
    console.info(`[Auto Active] ${message}`);
}

function callback(window) {
    const now = Date.now();
    if (now - lastActiveTime < 5000) {
        log(`active too frequent`);
        return;
    }
    if (window.demandsAttention && !window.active) {
        workspace.activeWindow = window;
        window.demandsAttention = false;
        lastActiveTime = now;
        log(`active app caption: ${window.caption}, resourceClass: ${window.resourceClass}`);
    }
}

function isSkipped(window) {
    const resourceClass = window.resourceClass.toString().toLowerCase() || "";
    if (WhiteMode) {
        return !Whitelist.includes(resourceClass);
    }
    const isBlacked = resourceClass && Blacklist.includes(resourceClass.toString().toLowerCase());
    return !window.normalWindow || isBlacked;
}

function addWindowCallback(window) {
    if (isSkipped(window)) {
        return;
    }
    log(`add callback for: ${window.caption} (${window.resourceClass})`);
    window.demandsAttentionChanged.connect(() => callback(window));
}

// 监听窗口添加事件
workspace.windowAdded.connect(addWindowCallback);

// 初始化时检查一次
log(`running, WhiteMode: ${WhiteMode}, Whitelist: ${Whitelist}, Blacklist: ${Blacklist}`);
for (let w of workspace.windowList()) {
    if (!isSkipped(w)) {
        callback(w);
    }
    addWindowCallback(w);
}
