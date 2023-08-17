(() => {
    const isBetaVersion = parseInt(window._options.appVersion.split(".")[0]) === 0;

    const tempFolder = File.option.tempPath;

    const insertStyle = (id, css) => {
        const style = document.createElement('style');
        style.id = id;
        style.type = 'text/css';
        style.innerHTML = css;
        document.getElementsByTagName("head")[0].appendChild(style);
    }

    const insertStyleFile = (id, filepath) => {
        const link = document.createElement('link');
        link.type = 'text/css'
        link.rel = 'stylesheet'
        link.href = filepath;
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    const getPlugin = fixed_name => {
        const idx = global._plugins.findIndex(plugin => plugin.enable && plugin.fixed_name === fixed_name)
        if (idx !== -1) {
            return global._plugins[idx];
        }
    }

    const metaKeyPressed = ev => File.isMac ? ev.metaKey : ev.ctrlKey;
    const shiftKeyPressed = ev => !!ev.shiftKey;
    const altKeyPressed = ev => !!ev.altKey;

    const getPluginSetting = fixed_name => global._pluginSettings[fixed_name];
    const getDirname = () => global.dirname || global.__dirname;
    const getFilePath = () => File.filePath || File.bundle && File.bundle.filePath;
    const joinPath = (...paths) => Package.Path.join(getDirname(), ...paths);

    const requireFile = (...paths) => {
        const filepath = joinPath(...paths);
        return reqnode(filepath)
    }

    const Package = {
        Path: reqnode("path"),
        Fs: reqnode("fs"),
        ChildProcess: reqnode('child_process'),
    };

    const stopCallError = new Error("stopCall");

    const detectorContainer = {}

    const decorate = (until, obj, func, before, after, changeResult = false) => {
        const start = new Date().getTime();
        const uuid = Math.random();
        detectorContainer[uuid] = setInterval(() => {
            if (new Date().getTime() - start > 10000) {
                console.log("decorate timeout!", until, obj, func, before, after, changeResult);
                clearInterval(detectorContainer[uuid]);
                delete detectorContainer[uuid];
                return;
            }

            if (!until()) return;
            clearInterval(detectorContainer[uuid]);
            const decorator = (original, before, after) => {
                return function () {
                    if (before) {
                        const error = before.call(this, ...arguments);
                        if (error === stopCallError) return;
                    }

                    let result = original.apply(this, arguments);

                    if (after) {
                        const afterResult = after.call(this, result, ...arguments);
                        if (changeResult) {
                            result = afterResult;
                        }
                    }
                    return result;
                };
            }
            obj[func] = decorator(obj[func], before, after);
            delete detectorContainer[uuid];
        }, 20);
    }

    const decorateOpenFile = (before, after) => {
        decorate(() => (File && File.editor && File.editor.library && File.editor.library.openFile), File.editor.library, "openFile", before, after)
    }

    const decorateAddCodeBlock = (before, after) => {
        decorate(() => (File && File.editor && File.editor.fences && File.editor.fences.addCodeBlock), File.editor.fences, "addCodeBlock", before, after)
    }

    const loopDetector = (until, after, detectInterval = 20) => {
        const uuid = Math.random();
        detectorContainer[uuid] = setInterval(() => {
            if (until()) {
                clearInterval(detectorContainer[uuid]);
                after && after();
                delete detectorContainer[uuid];
            }
        }, detectInterval);
    }

    const toHotkeyFunc = hotkeyString => {
        const keyList = hotkeyString.toLowerCase().split("+").map(k => k.trim());
        const ctrl = keyList.indexOf("ctrl") !== -1;
        const shift = keyList.indexOf("shift") !== -1;
        const alt = keyList.indexOf("alt") !== -1;
        const key = keyList.filter(key => key !== "ctrl" && key !== "shift" && key !== "alt")[0];

        return ev => global._pluginUtils.metaKeyPressed(ev) === ctrl
            && global._pluginUtils.shiftKeyPressed(ev) === shift
            && global._pluginUtils.altKeyPressed(ev) === alt
            && ev.key.toLowerCase() === key
    }

    const hotkeyList = []
    const registerWindowHotkey = (hotkey, call) => {
        if (typeof hotkey === "string") {
            hotkey = toHotkeyFunc(hotkey);
            hotkeyList.push({hotkey, call});
        } else if (hotkey instanceof Array) {
            for (const h of hotkey) {
                registerWindowHotkey(h, call);
            }
        }
    };
    window.addEventListener("keydown", ev => {
        for (let hotkey of hotkeyList) {
            if (hotkey.hotkey(ev)) {
                hotkey.call();
                ev.preventDefault();
                ev.stopPropagation();
                return
            }
        }
    }, true)

    const dragFixedModal = (handleElement, moveElement, withMetaKey = true) => {
        handleElement.addEventListener("mousedown", ev => {
            if (withMetaKey && !metaKeyPressed(ev) || ev.button !== 0) return;
            ev.stopPropagation();
            const rect = moveElement.getBoundingClientRect();
            const shiftX = ev.clientX - rect.left;
            const shiftY = ev.clientY - rect.top;

            const onMouseMove = ev => {
                if (withMetaKey && !metaKeyPressed(ev) || ev.button !== 0) return;
                ev.stopPropagation();
                ev.preventDefault();
                requestAnimationFrame(() => {
                    moveElement.style.left = ev.clientX - shiftX + 'px';
                    moveElement.style.top = ev.clientY - shiftY + 'px';
                });
            }

            document.addEventListener("mouseup", ev => {
                    if (withMetaKey && !metaKeyPressed(ev) || ev.button !== 0) return;
                    ev.stopPropagation();
                    ev.preventDefault();
                    document.removeEventListener('mousemove', onMouseMove);
                    moveElement.onmouseup = null;
                }
            )

            document.addEventListener('mousemove', onMouseMove);
        })
        handleElement.ondragstart = () => false
    }

    module.exports = {
        isBetaVersion,
        tempFolder,
        insertStyle,
        insertStyleFile,
        getPlugin,
        getPluginSetting,
        metaKeyPressed,
        shiftKeyPressed,
        altKeyPressed,
        getDirname,
        getFilePath,
        joinPath,
        requireFile,
        Package,
        stopCallError,
        decorate,
        decorateOpenFile,
        decorateAddCodeBlock,
        loopDetector,
        toHotkeyFunc,
        registerWindowHotkey,
        dragFixedModal,
    };
})()