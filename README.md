
# jsDelivr简介及使用

jsDelivr 是一个免费、开源的公共 CDN，专为开发者设计，它最大的特点是可以直接加速分发 GitHub 仓库中的任意文件，无需额外配置或发布流程
注意点：仅支持公开仓库、最大 50 MB、所有文件类型均可，但建议仅用于静态资源、强制HTTPS请求

```text
(https)://cdn.jsdelivr.net/gh/{用户名}/{仓库名}@{版本号}/{文件路径}

{用户名}：GitHub 用户名或组织名
{仓库名}：仓库名称
{版本号}：Git tag / branch
{文件路径}：仓库内的文件相对路径

在文件路径后增加 .min.js 或 .min.css 后缀可获得自动压缩版本


示例

<!-- 指定 tag 版本） -->
<script src="https://cdn.jsdelivr.net/gh/userName/jquery@3.6.0/dist/jquery.min.js"></script>

<!-- 指定分支（缓存 12h，适合开发环境） -->
<script src="https://cdn.jsdelivr.net/gh/lodash/lodash@main/lodash.min.js"></script>

<!-- 省略版本号（始终最新，缓存 12h，不推荐生产环境使用） -->
<script src="https://cdn.jsdelivr.net/gh/jquery/jquery/dist/jquery.min.js"></script>
```


## 高级功能
- 自动压缩

  在文件名后添加 .min 后缀，jsDelivr 自动提供压缩版本
```text
- 源文件
https://cdn.jsdelivr.net/gh/user/repo@1.0/src/app.js

# 自动压缩（无需仓库中存在 .min.js 文件）
https://cdn.jsdelivr.net/gh/user/repo@1.0/src/app.min.js

```

- 合并多个文件

  使用 combine 端点将多个文件合并为一个请求
```text
 示例
 https://cdn.jsdelivr.net/combine/gh/user/repo1@1.0/a.min.js,
 gh/user/repo2@2.0/b.min.js

HTML引用

<script src="https://cdn.jsdelivr.net/combine/gh/user/repo1@1.0/a.min.js,
gh/user/repo2@2.0/b.min.js">
</script>

```
 
- 目录列表

  查看仓库中某个目录下的所有文件
```text
返回 JSON 格式的文件列表
https://data.jsdelivr.com/v1/packages/gh/{用户名}/{仓库名}@{版本号}
```


- 缓存刷新
- 带精确版本号/不带版本号的写法，缓存获取的逻辑不同
    - 带精确版本号的文件：永久缓存，不会自动刷新
    - 不带版本号/分支名：12 小时后自动获取最新
      如果你更新了仓库文件但 CDN 仍返回旧版本，可手动刷新：
```text
手动清除单个文件缓存(浏览器中输入)
https://purge.jsdelivr.net/gh/{用户名}/{仓库名}@{版本号}/{文件}

```

- 可能遇到的问题
1. 新 tag 推送后 CDN 无法访问：等待 10-15 分钟让 jsDelivr 同步
2. 文件内容未更新：检查是否使用了精确版本号（永久缓存），如需更新请打新 tag
3. 404 错误：确认仓库是公开的、路径正确、tag 存在
4. 中国大陆访问：jsDelivr 在国内有备案和节点，但偶尔可能被干扰，建议配合 fallback


# 项目说明
  1、eipJsCodeIndex.js

基于JS工具类打包而成的index文件，直接引入即可，由于jsdelivr必须限制仓库为public，故在node打包时，设置混淆/压缩元素

后续可设置访问短码，保护代码安全
