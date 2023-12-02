const {app, BrowserWindow, ipcMain} = require('electron');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

let fakeSauceNaoOrigin = path.join(path.dirname(__dirname), 'fakesaucenao'); // fakes 文件夹的路径

// 运行在 Electron 主进程 下的插件入口
let open;
import('open').then(it => {
    open = it
})

// 加载插件时触发
function onLoad(plugin) {
}

// 创建窗口时触发
function onBrowserWindowCreated(window, plugin) {
}

const findImgUrlRegex = /https:\/\/saucenao\.com\/userdata\/[^"]+/g;

ipcMain.handle("LiteLoader.imagesearch.searchImg", async (event, eventData) => {
    const imgSrc = eventData.imgSrc
    const imgSrc2Fs = imgSrc.slice(9).replaceAll("\\\\", "/").replaceAll("%20", " ")

    const stream = fs.createReadStream(imgSrc2Fs)
    let formData = new FormData();
    formData.append('file', stream);
    formData.append('url', 'Paste Image Url');
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://saucenao.com/search.php',
        headers: {
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryCQZWJNuxCvglRxQS',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            ...formData.getHeaders()
        },
        data: formData
    };
    const res = (await axios.request(config)).data
    const imgUrl = res.match(findImgUrlRegex)[0]
    const openUrl = `https://saucenao.com/search.php?db=999&url=${encodeURIComponent(imgUrl)}`
    open.default(openUrl, {app: {name: open.apps.browser}})
})

// 这两个函数都是可选的
module.exports = {
    onLoad,
    onBrowserWindowCreated
}
