(() => {
    const config = {
        // 启用脚本,若为false,以下配置全部失效
        ENABLE: true,
        HOTKEY: ev => metaKeyPressed(ev) && ev.shiftKey && ev.key === "K",

        DEBUG: false,
    }

    if (!config.ENABLE) {
        return
    }

    const Package = {
        Path: reqnode("path"),
        Fs: reqnode("fs"),
        File: global.File,
        ClientCommand: global.ClientCommand,
    }

    const metaKeyPressed = ev => Package.File.isMac ? ev.metaKey : ev.ctrlKey;
    const getFilePath = () => Package.File.filePath;
    const read = filepath => Package.Fs.readFileSync(filepath, 'utf-8');
    const write = (filepath, content) => Package.Fs.writeFileSync(filepath, content);
    const save = () => Package.ClientCommand.save();
    const getFormatter = () => {
        const dirname = global.dirname || global.__dirname;
        const filepath = Package.Path.join(dirname, "plugin", "md_padding", "md-padding");
        const {padMarkdown} = reqnode(filepath);
        return padMarkdown;
    }

    const format = content => {
        const formatter = getFormatter();
        return formatter(content);
    }

    window.addEventListener("keydown", ev => {
        if (config.HOTKEY(ev)) {
            console.log("format markdown file")
            const filepath = getFilePath();
            const content = read(filepath);
            const formatterContent = format(content);
            write(filepath, formatterContent);
            ev.preventDefault();
            ev.stopPropagation();
        }
    }, true)

    if (config.DEBUG) {
        JSBridge.invoke("window.toggleDevTools");
    }

    console.log("padding.js had been injected");
})()