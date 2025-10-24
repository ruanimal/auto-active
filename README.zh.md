# Auto Active
Kwin 脚本，如果窗口任务栏图标高亮且窗口未激活，则激活窗口
支持黑名单和白名单模式，白名单模式优先

## 安装
设置 -> 窗口管理 -> kwin 脚本 -> 从文件安装（或者获取新脚本）

可以设置需要忽略的窗口（黑名单）或者仅生效的窗口（白名单），使用逗号分隔的应用程序的 resourceClass 列表。
字段信息可从 journalctl 查看，修改配置后需要禁用再启用插件才能生效。

白名单模式建议的应用：`sublime_text,org.kde.dolphin`

## 查看程序的 resourceClass
有两种方法

1. 使用交互式调试，运行以下代码，然后查看日志（参考调试说明）

```javascript
for (let w of workspace.windowList()) {
    if (w.normalWindow) {
        print(w.resourceClass)
    }
}
```

2. 设置 -> 窗口管理 -> 窗口规则 -> 新增 -> 检测窗口属性

## 打包
./pack.sh

## 调试
js 脚本是基于监听事件模式运行的，运行脚本时无法获得返回值
可以 journalctl 查看标准输出和错误输出
如果没有注册事件，则脚本就只是单次执行，再次运行得重新加载

- 查看日志：`journalctl --user-unit=plasma-kwin_wayland -f -n100 |grep kwin_wayland `
- 加载脚本：`qdbus6 org.kde.KWin /Scripting loadScript <脚本绝对路径>`, 输出为脚本id
- 运行脚本：`qdbus6 org.kde.KWin /Scripting/Script<脚本id> run`
- 卸载脚本：`qdbus6 org.kde.KWin /Scripting unloadScript <脚本绝对路径>`
- 重启kwin：`kwin_wayland --replace &`，用于重新加载 kwin，可以清理历史脚本
- 交互式调试：`plasma-interactiveconsole --kwin `，可以直接执行 js 代码，输出还是在 journalctl

## 参考
### 文档
- https://develop.kde.org/docs/plasma/kwin/
- https://develop.kde.org/docs/plasma/kwin/api/

