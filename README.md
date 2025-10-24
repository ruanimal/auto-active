# Auto Active

A KWin script that automatically activates a window when its taskbar icon is highlighted but the window itself is not active.
Supports both blacklist and whitelist modes, with whitelist mode taking priority.

## Installation

**System Settings → Window Management → KWin Scripts → Install from File** (or **Get New Scripts**)

You can configure windows to be ignored (blacklist) or windows for which the script should take effect (whitelist).

Use a comma-separated list of application `resourceClass` names.
You can check these values via `journalctl`.

After editing the configuration, disable and re-enable the plugin for changes to take effect.

Recommended whitelist apps: `sublime_text,org.kde.dolphin`

## Checking an application's `resourceClass`

There are two ways:

1. **Using interactive debugging:**
   Run the following code and check the logs (see debugging section below):

   ```javascript
   for (let w of workspace.windowList()) {
       if (w.normalWindow) {
           print(w.resourceClass)
       }
   }
   ```

2. **Using Window Rules:**
   Go to **System Settings → Window Management → Window Rules → Add New → Detect Window Properties**

## Packaging

```bash
./pack.sh
```

## Debugging

The JavaScript script runs in an event-listening mode and does not return a value when executed directly.
You can check standard output and error output via `journalctl`.
If no events are registered, the script runs only once and must be reloaded to execute again.

* View logs:

  ```bash
  journalctl --user-unit=plasma-kwin_wayland -f -n100 | grep kwin_wayland
  ```
* Load script:

  ```bash
  qdbus6 org.kde.KWin /Scripting loadScript <absolute_script_path>
  ```

  (Outputs the script ID)
* Run script:

  ```bash
  qdbus6 org.kde.KWin /Scripting/Script<script_id> run
  ```
* Unload script:

  ```bash
  qdbus6 org.kde.KWin /Scripting unloadScript <absolute_script_path>
  ```
* Restart KWin (to reload and clear previous scripts):

  ```bash
  kwin_wayland --replace &
  ```
* Interactive debugging console:

  ```bash
  plasma-interactiveconsole --kwin
  ```

  You can execute JS code directly here; output still appears in `journalctl`.

## References

### Documentation

* [https://develop.kde.org/docs/plasma/kwin/](https://develop.kde.org/docs/plasma/kwin/)
* [https://develop.kde.org/docs/plasma/kwin/api/](https://develop.kde.org/docs/plasma/kwin/api/)
