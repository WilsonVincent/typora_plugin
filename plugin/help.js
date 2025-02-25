class helpPlugin extends BasePlugin {
    beforeProcess = async () => {
        const filepath = this.utils.joinPath("./plugin/updater/version.json");
        try {
            const versionMsg = await this.utils.Package.FsExtra.readJson(filepath);
            this.version = versionMsg.tag_name;
        } catch (err) {
        }
    }

    process = () => {
        this.callArgs = [
            {arg_name: "修改配置", arg_value: "open_setting_folder"},
            {arg_name: "我要写插件", arg_value: "new_custom_plugin"},
            {arg_name: "github图床", arg_value: "github_picture_bed"},
            {arg_name: "反馈 - github", arg_value: "new_issue"},
            {arg_name: "反馈 - email", arg_value: "send_email"},
            {arg_name: "关于", arg_value: "about"},
        ]

        this.utils.addEventListener(this.utils.eventType.allPluginsHadInjected, () => {
            this.updater = this.utils.getCustomPlugin("pluginUpdater");
            if (!this.updater) return;
            const arg_name = "升级插件" + (this.version ? `（当前版本：${this.version}）` : "");
            this.callArgs.unshift({arg_name: arg_name, arg_value: "update_plugin"});
        })
    }

    call = type => {
        const map = {
            about: () => this.utils.openUrl("https://github.com/obgnail/typora_plugin"),
            new_issue: () => this.utils.openUrl("https://github.com/obgnail/typora_plugin/issues/new"),
            github_picture_bed: () => this.utils.openUrl("https://github.com/obgnail/typora_image_uploader"),
            open_setting_folder: this.openSettingFolder,
            update_plugin: () => this.updater.callback(),
            send_email: () => this.utils.sendEmail("he1251698542@gmail.com", "插件反馈"),
            new_custom_plugin: () => this.utils.openFile(this.utils.joinPath("./plugin/custom/请读我.md")),
        }
        const func = map[type];
        func && func();
    }

    openSettingFolder = async () => {
        const homeDir = this.utils.Package.OS.homedir() || File.option.userPath;
        const homeSetting = this.utils.Package.Path.join(homeDir, ".config", "typora_plugin", "settings.user.toml");
        const exist = await this.utils.existPath(homeSetting);
        const targetPath = exist ? homeSetting : this.utils.joinPath("./plugin/global/settings/settings.user.toml");
        this.utils.showInFinder(targetPath);
    }
}

module.exports = {
    plugin: helpPlugin,
};