const Blacklist = readConfig("Blacklist", "an.app.placeholder.name").toString().toLowerCase().split(",");
const Whitelist = readConfig("Whitelist", "an.app.placeholder.name").toString().toLowerCase().split(",");
const WhiteMode = readConfig("White", false);
const BlackMode = readConfig("Black", false);
const OnlyRaise = readConfig("OnlyRaise", false);

function log(message) {
    console.info(`[Auto Active] ${message}`);
}

function callback(window) {
    const now = Date.now();
    // 使用窗口对象本身的属性来记录时间，实现针对每个窗口的去抖动
    if (window._lastActiveTime && (now - window._lastActiveTime < 5000)) {
        log(`active too frequent for ${window.caption}`);
        return;
    }

    if (window.demandsAttention && !window.active) {
        // 如果窗口最小化了或收起了（Shaded），必须先还原才能看到或激活
        if (window.minimized) {
            window.minimized = false;
        }
        if (window.shaded) {
            window.shaded = false;
        }

        if (OnlyRaise) {
            workspace.raiseWindow(window);
            log(`raised app caption: ${window.caption}, resourceClass: ${window.resourceClass}`);
        } else {
            workspace.activeWindow = window;
            log(`active app caption: ${window.caption}, resourceClass: ${window.resourceClass}`);
        }

        // 使用 Timer 延迟清除 demandsAttention，防止 KWin 或应用状态竞争导致清除失败
        // 特别是在 OnlyRaise 模式下，如果不激活窗口，KWin 可能会维持该标志
        const timer = new QTimer();
        timer.interval = 200;
        timer.singleShot = true;
        timer.timeout.connect(function() {
            if (window.demandsAttention) {
                window.demandsAttention = false;
                log(`demandsAttention cleared for: ${window.caption}`);
            }
        });
        timer.start();

        window._lastActiveTime = now;
    }
}

function isSkipped(window) {
    const resourceClass = window.resourceClass.toString().toLowerCase() || "";
    if (WhiteMode) {
        return !Whitelist.includes(resourceClass);
    }
    const isBlacked = resourceClass && BlackMode && Blacklist.includes(resourceClass.toString().toLowerCase());
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
log(`running, WhiteMode: ${WhiteMode}, Whitelist: ${Whitelist}, BlackMode: ${BlackMode}, Blacklist: ${Blacklist}, OnlyRaise: ${OnlyRaise}`);
for (let w of workspace.windowList()) {
    if (!isSkipped(w)) {
        callback(w);
    }
    addWindowCallback(w);
}
