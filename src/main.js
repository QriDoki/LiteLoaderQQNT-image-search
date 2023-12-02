const {app, BrowserWindow, ipcMain} = require('electron');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const crypto = require("crypto")

let fakeSauceNaoOrigin = path.join(path.dirname(__dirname), 'fakesaucenao'); // fakes 文件夹的路径

// 运行在 Electron 主进程 下的插件入口
let open;
import('open').then(it => {
    open = it
})

// 加载插件时触发
function onLoad(plugin) {
}

let pluginDataPath;
let wrapperHtmlPath;
let resultsPath;

// 创建窗口时触发
function onBrowserWindowCreated(window, plugin) {
    pluginDataPath = plugin.path.data;

    const fakeSauceNaoTarget = path.join(pluginDataPath, "fakesaucenao")
    resultsPath = path.join(path.join(fakeSauceNaoTarget, "wrapper"), "results")
    wrapperHtmlPath = path.join(path.join(fakeSauceNaoTarget, "wrapper"), "searching.html")
    if (!fs.existsSync(fakeSauceNaoTarget)) {
        // 如果不存在，那么复制源文件夹到目标文件夹
        fse.copySync(fakeSauceNaoOrigin, fakeSauceNaoTarget);
        console.log(`Folder copied from ${fakeSauceNaoOrigin} to ${fakeSauceNaoTarget}`);
    } else {
        console.log('Target folder already exists');
    }
}

// ipcMain.on("trigger-open", (event, arg) => {
//     console.log('Message from renderer:', arg);
//     console.log(fetch)
// })

const findImgUrlRegex = /https:\/\/saucenao\.com\/userdata\/[^"]+/g;

ipcMain.handle("LiteLoader.imagesearch.searchImg", async (event, eventData) => {
    const imgSrc = eventData.imgSrc
    console.log("data", eventData)
    // 格式是: /D:/path/to/image
    const imgSrc2Fs = imgSrc.slice(9).replaceAll("\\\\", "/").replaceAll("%20", " ")
    console.log("imgSrc2Fs", imgSrc2Fs)
    const stream = fs.createReadStream(imgSrc2Fs)
    console.log("stream")
    let formData = new FormData();
    formData.append('file', stream);
    formData.append('url', 'Paste Image Url');
    console.log("formData")
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
    const hash = crypto.createHash('sha256').update(imgSrc2Fs).digest('hex')
    console.log({hash})
    console.log("open.apps", open.apps)
    const searchingFilePath = `file:///${wrapperHtmlPath}?q=${hash}`
    console.log({searchingFilePath})
    try {
        const res = (await axios.request(config)).data
        const imgUrl = res.match(findImgUrlRegex)[0]
        const openUrl = `https://saucenao.com/search.php?db=999&url=${encodeURIComponent(imgUrl)}`
        open.default(openUrl, {app: {name: open.apps.browser}})
        // const saveLocation = path.join(resultsPath, `${hash}.html`).normalize()
        //
        // const resPreHandled = preHandleRes(res)
        // fs.writeFile(saveLocation, resPreHandled, (err) => {
        //     if (err) {
        //         console.error(`Failed to write file: ${err}`);
        //     } else {
        //         open.default(searchingFilePath, {app: {name: open.apps.browser}})
        //         console.log('File written successfully');
        //     }
        // });
    } catch (e) {
        console.log(e)
    }


})

// function preHandleRes(t) {
//     let res = t.replaceAll("'/images", "'images")
//     res = res.replace('src="//saucenao', 'src="https://saucenao')
//     res = res.replace("</body>",
//         `</body><script defer>
//     const a = document.querySelector("#yourimage > a");
//     a.href = "https://saucenao.com/" + a.href;
//     const img = document.querySelector("#yourimage > a > img");
//     console.log("img",img)
//     const imgFileName = img.src.split("userdata/")[1]
//     document.querySelector("#yourimage > a").href = "https://saucenao.com/edit.php?f=1&image=" + imgFileName.slice(0, -4)
//     const imgSrc = "https://saucenao.com/userdata/" + imgFileName;
//     img.src = imgSrc;
//     document.querySelector("#yourimagetext > img").src = imgSrc
//     setInterval(() => {
//         document.querySelector("#yourimageretrylinks > div > a:nth-child(2) > img").src = 'images/static/patreon_a.gif'
//     }, 500)
// </script>`)
//     return res
// }

// 这两个函数都是可选的
module.exports = {
    onLoad,
    onBrowserWindowCreated
}
