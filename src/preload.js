// Electron 主进程 与 渲染进程 交互的桥梁
const { contextBridge, ipcRenderer } = require("electron");


// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("ipcBridge", {
    searchImg: (data) => ipcRenderer.invoke(
        "LiteLoader.imagesearch.searchImg",
        data
    )
});
