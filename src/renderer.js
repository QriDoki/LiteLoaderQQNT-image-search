// 运行在 Electron 渲染进程 下的页面脚本
// const { ipcRenderer } = require('electron');

const searchImageMenuItemTemplate = document.createElement("div");
searchImageMenuItemTemplate.innerHTML = `
<a 
 id="qrcode"
 class="q-context-menu-item q-context-menu-item--normal" 
 aria-disabled="false" 
 role="menuitem" 
 tabindex="-1">
  <div class="q-context-menu-item__icon q-context-menu-item__head">
    <i class="q-icon" data-v-717ec976="" style="--b4589f60: inherit; --6ef2e80d: 16px;">🔍</i>
  </div>
  <span class="q-context-menu-item__text">搜图</span>
</a>
`

async function addSearchImageMenu(qContextMenu, message_element) {
    const {classList} = message_element

    if (classList?.[0] && ["image-content", "main-area__image"].indexOf(classList?.[0]) >= 0) {
        const searchImageMenuItem = searchImageMenuItemTemplate.cloneNode(true);
        searchImageMenuItem.addEventListener('click', async () => {
            ipcBridge.searchImg({imgSrc: message_element.src})
            qContextMenu.remove()
        })
        qContextMenu.insertBefore(searchImageMenuItem, qContextMenu.firstChild);
    }
}

// 页面加载完成时触发
function onLoad() {
    LLAPI.add_qmenu(addSearchImageMenu)
}


// 打开设置界面时触发
function onConfigView(view) {

}


// 这两个函数都是可选的
export {
    onLoad,
    onConfigView
}
