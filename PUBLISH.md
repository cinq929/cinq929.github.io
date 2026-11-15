# 公开发布

网站可直接部署到 GitHub Pages，无需后端和第三方依赖。

## 当前阻塞

GitHub 插件创建仓库返回 `403 Resource not accessible by integration`，尚未上传或上线。
需要先在 GitHub 创建公开空仓库 `sjtu-dorm-co-create`，并让当前 GitHub 连接具有该仓库的写入权限。

## 已准备

- `.github/workflows/pages.yml`：检查脚本、还原图片、打包并发布 GitHub Pages。
- `assets-base64.json`：图片的 base64 清单，方便仅支持文本提交的 GitHub 插件上传素材。
- `scripts/restore-assets.mjs`：从清单还原图片，已在本地运行验证。

上传范围：根目录 HTML/CSS/JS、package.json、server.mjs、README.md、assets 下 SVG、图片清单、还原脚本和发布工作流。不要上传本地截图、地图参考图和浏览器数据。

仓库 Settings → Pages → Build and deployment 选择 GitHub Actions。工作流会尝试自动启用 Pages；如果权限不允许，需要仓库所有者手动选择。成功部署后应验证工作流输出的网址，不能把预期网址当作已上线网址。

线上记录仍只保存在当前访问者浏览器，不提供跨用户同步。
