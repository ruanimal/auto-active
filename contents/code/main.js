const Ignorelist = readConfig("Ignorelist", "an.app.placeholder.name").toString().toLowerCase().split(",");
var lastActiveTime = 0;

function log(message) {
    print(`[Auto Active] ${message}`);
}

function bindArg(fn, ...args) {
    return function (...innerArgs) {
        return fn.apply(this, [...args, ...innerArgs]);
    };
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
        log(`active app caption: ${window.caption}, layer: ${window.layer},` +
            ` desktopFileName: ${window.desktopFileName}, resourceClass: ${window.resourceClass}`);
    }
}

function isSkipped(window) {
    const resourceClass = window.desktopFileName || window.resourceClass || "";
    const isIgnored = resourceClass && Ignorelist.includes(resourceClass.toString().toLowerCase());
    return !window.normalWindow || !window.caption || isIgnored;
}

function addWindowCallback(window) {
    if (isSkipped(window)) {
        return;
    }
    log(`add callback for: ${window.caption} (${window.desktopFileName} | ${window.resourceClass})`);
    window.demandsAttentionChanged.connect(bindArg(callback, window));
}

// 监听窗口添加事件
workspace.windowAdded.connect(addWindowCallback);

// 初始化时检查一次
log(`running, Ignorelist: ${Ignorelist}`);
for (let w of workspace.windowList()) {
    if (!isSkipped(w)) {
        callback(w);
    }
    addWindowCallback(w);
}
