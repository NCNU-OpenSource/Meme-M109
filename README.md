# Meme M109
## A CICD pipeline to deploy this artillery to GKE

### 我們希望每次 push code 的時候 CICD 幫我們做的事
1. 把專案包成 docker image 並上傳到 dockerhub
1. 生成 k8s deployment yaml，並在裡面選用 (１) 包好的 image
1. 用 kubectl apply (２) 生成的 deployment 文件，完成 deploy
### 專案準備 ( 可以用滑鼠點的部分 )
- 開好 Gitlab repo
- 開好 GCP project ( 並記下 project_id )
- Enable GKE API ( 點進 project 的 Kubernetes Engine 標籤就會自動 enable 了 )
### 事前作業
1. 安裝 gcloud CLI 在自己電腦上
[Google Cloud SDK 安裝方法](https://cloud.google.com/sdk/docs?hl=zh-tw#install_the_latest_cloud_tools_version_cloudsdk_current_version)

    install 完之後如果```gcloud```指令不能用要 reload shell 設定 ( .bashrc, .zshrc, etc. )
    ```
     source ~/.bashrc //也不一定是 .bashrc，總之就是 terminal rc file
    ```

1. 這個指令可以讓你用互動式的方式，初始化你的 gcloud sdk
	```
	gcloud init
	```
:::info
等同於以下三個指令
```
gcloud auth login
gcloud config set project [project-id]
gcloud config set compute/zone [compute-zone]
```
:::

1. 開一個cluster
    ```
    gcloud container clusters create [cluster-名稱] --num-nodes=[node 數量] ```
1. 讓 gcloud 自動幫你做 kubectl 設定，連接到 cluster
    ```
    gcloud container clusters get-credentials [cluster-名稱]
    ```
1. 在 GCP 開一個服務帳戶 (sa-name: 6~30個字,小寫）
	```
	gcloud iam service-accounts create [sa-name] --description="[sa-description]" --display-name="[sa-display-name]"
	```
1. 給他 deploy 到 k8s 的權限 (這個指令會讓剛才設好的服務帳戶成為 kubernetes developer)
	```
	gcloud projects add-iam-policy-binding [project-id] --member="serviceAccount:[sa-name]@[project-id].iam.gserviceaccount.com" --role='roles/container.developer'
	```
1. 生成一組剛才的 service account 的 key，存成 service-account.json
    ```
    gcloud iam service-accounts keys create --iam-account "[sa-name]@[project-id].iam.gserviceaccount.com" service-account.json
    ```
1. CICD 環境變數設定
### 環境變數設定
進入 gitlab repo > settings > CICD > Variables
type|key|value
--|--|--
Variable|DOCKER_HUB_USERNAME|dockerhub 帳號
Variable|DOCKER_HUB_PASSWORD|dockerhub 密碼
Variable|DOCKER_HUB_REGISTRY|https://index.docker.io/v1/
Variable|DOCKER_HUB_REPO|dockerhub repo
File|serviceAccountKey|前面生成的 json key
![](https://i.imgur.com/MBExpcM.png)
### 正式開始
#### 先在自己電腦上把 service 跟 ingress 架設好（一次性的不需要用到 CICD）
```
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```
#### 生成 kubeconfig 供 CICD 使用
1. 把取得 cluster 的資訊用的 command 存成變數，以便接下來的工作
``` GET_CMD="gcloud container clusters describe [cluster 名稱] --zone=[cluster 地區]" ```
2. 以下指令會以現在用的 cluster 資訊生成一個 kubeconfig.yaml 的設定檔
``` bash=
cat > kubeconfig.yaml <<EOF
apiVersion: v1
kind: Config
current-context: my-cluster
contexts: [{name: my-cluster, context: {cluster: cluster-1, user: user-1}}]
users: [{name: user-1, user: {auth-provider: {name: gcp}}}]
clusters:
- name: cluster-1
  cluster:
    server: "https://$(eval "$GET_CMD --format='value(endpoint)'")"
    certificate-authority-data: "$(eval "$GET_CMD --format='value(masterAuth.clusterCaCertificate)'")"
EOF
```
:::info
這個檔案裡面的資訊只是用來把 kubectl 指向 cluster，光是這樣還不能夠用 kubectl 來操作你的 GKE cluster，所以可以放心把它放在 repo 裡。
我有過這個疑慮，所以把他 decode 出來，確定是 public key。
![](https://i.imgur.com/NoYXGHd.png)
:::
### gitlab-ci.yaml
#### 這個檔案分兩個階段
1. 包成 docker image push 到 dockerhub
2. 把 docker image deploy 到 GKE
### docker-hub
- before script：用設定裡的環境變數登入 dockerhub
- script：build & push
### k8s-deploy
- before script：安裝 kubectl, 把 service account key 跟 kubeconfig 呼叫出來
- script：生成 deploy.yaml 然後 apply

這樣就可以自動 deploy 到 GKE 了。


## Cucumber BDD

### BDD & TDD ?

#### TDD (Test-Driven Development)
先寫測試，當通過所有測試即開發完成。

#### BDD (Behaviour-Driven Development)
先設定用戶行為的場景，以滿足用戶行為撰寫測試，當滿足所有用戶行為即開發完成。

### Cucumber 是什麼？

#### cucumber .feature檔範例 (支援中文)
```
#language: zh-TW

功能: 根據輸入文字查找圖片路徑

  場景大綱: 使用者輸入文字
    當 使用者輸入 "<文字>"
    那麼 查找對應的圖片 "<路徑>"

  例子:
    | 文字 | 路徑 |
    | 王金平 | 王金平.png |
    | 賴清德 | 賴清德.jpg |
    | 習近平 | 習近平.jpg |
    | 韓冰 | 韓冰.jpg |
    | 馬英九 | 馬英九.jpg |

  場景: 圖庫中 有 對應的迷因
    假如 資料庫中有對應的路徑
    那麼 根據路徑產生圖片

  場景: 圖庫中 沒有 對應的迷因
    假如 資料庫中 沒有 對應的路徑
    那麼 告訴使用者沒有資料
```
:::success
以淺顯易懂的語言撰寫須滿足的用戶行為場景，有利於與非資訊人員的溝通（PM 或客戶等等）。
並且.feature檔是可執行的測試檔案，當通過所有的用戶行為測試，專案中的功能即開發完成。
:::

#### cucumber 常用中英文關鍵字對照

| 英文關鍵字       | 中文關鍵字 |
| ---------------- | ---------- |
| feature          | Text       |
| scenario         | 場景       |
| scenario_outline | 場景大綱   |
| examples         | 例子       |
| given            | * , 假如   |
| when             | * , 當     |
| then             | * , 那麼   |
| and              | * , 而且   |
| but              | * , 但是   |

:::info
有 * 部份代表使用關鍵字只是為了增加可閱讀性，也可以都寫 * 。
:::



### 使用 Cucumber 實做 BDD

#### 確認 Node.js 已安裝
```
node -v
npm -v
```
#### 進入當前專案目錄
```
mkdir meme
cd meme
```
#### npm 初始設定
```
// --yes 使用 deafult 設定
npm init --yes
```
#### 安裝 cucumber
```
sudo npm install cucumber --save -dev
```
#### 將 package.json 中的 "test" 更改為 "cucumber-js"
```json=
{
  "name": "hellocucumber",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "cucumber-js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "cucumber": "^5.0.3"
  }
}
```
#### 準備文件結構
```
mkdir -p features/step_definitions
```
#### 在專案根目錄中新增 ```cucumber.js```，寫入以下內容
```javascript=
module.exports = {
  default: `--format-options '{"snippetInterface": "synchronous"}'`
}
```
#### 新增 ```features/step_definitions/stepdefs.js```文件，寫入以下內容
```javascript=
const assert = require('assert'); // js 用來報錯的模組
const { Given, When, Then } = require('cucumber');
```
#### 目前文件結構
![](https://i.imgur.com/OuxUqK8.png)
:::info
資料夾名稱根據 cucumber 的預設，檔名自定義。
這樣我們就有了一個最簡單的cucumber 專案。
:::
#### 驗證各元件是否運作正常
```
// 在專案根目錄中執行
npm test
```
![](https://i.imgur.com/cZML0VQ.png)
> Cucumber 告訴我們它沒有發現能運行的場景。

#### 開始撰寫用戶行為的場景（```.feature```）
以我們的範例來說，當用戶輸入文字，必須產生相對應的圖片。

#### 新增 ```features/meme.feature``` 空文件，預備用來撰寫場景
```gherkin=
#language: zh-TW

功能: 根據輸入文字查找圖片路徑
  場景: 使用者輸入文字
    當 使用者輸入 "文字"
    那麼 查找對應的圖片 "路徑"
```
:::info
功能（Feature）的部份，代表我們目前需要滿足的用戶行為。
場景（Scenario）的部份，代表我們目前假設的操作。
當（When）以及 那麼（Then），則是我們目前要測試的步驟（Step）。
" " 雙引號中的內容為變數，前面要空格。
:::

#### 再執行一次測試 ```npm test```
會得到以下結果
![](https://i.imgur.com/RqN7RXo.png)

cucumber 告訴我們目前的兩個 Step 皆為 Undefined 的狀態，並提示我們該如何撰寫。
:::success
複製提示的程式碼片段，在```features/step_definitions/stepdefs.js``` 中貼上。
:::
![](https://i.imgur.com/wvgveUW.png)

#### 我們再執行一次```npm test``` 看看有什麼不同
![](https://i.imgur.com/ggzBEMl.png)

前次的 ```UU``` 變為 ```P-```，表示 cucumber 找到我們定義的 step 並執行，第一個 step 是 pending 的狀態，而第二個則是被跳過。
#### 下個步驟為撰寫 step 的內容
```javasript=
const assert = require('assert'); // js 用來報錯的模組
const { Given, When, Then } = require('cucumber');

// 建立圖片路徑資料庫
let imgData = new Map();
imgData.set("王金平", "王金平.png")
imgData.set("賴清德", "賴清德.jpg")
imgData.set("習近平", "習近平.jpg")
imgData.set("韓冰", "韓冰.jpg")
imgData.set("馬英九", "馬英九.jpg")

// 根據輸入文字查找檔案名稱
function findImg(text) {
  return imgData.get(text);
}

// scenario #1
Given('使用者輸入 {string}', function (inputText) {
  this.text = inputText;
});

Then('查找對應的圖片 {string}', function (expectedPath)  {
  // 實際上我們的程式找到的檔名
  this.actualPath = findImg(this.text);
  // 如果與預期不相符則報錯
  assert.equal(this.actualPath, expectedPath);
});
```
#### 在執行一次測試 ```npm test```
![](https://i.imgur.com/5FU3xyI.png)

兩個 step 目前是無法連動的，可以看到 ```undefined == '路徑'```， step2 沒有正確拿到 step1 中的 "文字"，而且 cucumber 還不知道什麼應該是預期的 output。

#### 加入 input 與 output 對應的表格
```gherkin=
#language: zh-TW

功能: 根據輸入文字查找圖片路徑
  場景大綱: 使用者輸入文字
    當 使用者輸入 "<文字>"
    那麼 查找對應的圖片 "<路徑>"

  例子:
    | 文字 | 路徑 |
    | 王金平 | 王金平.png |
    | 賴清德 | 賴清德.jpg |
    | 習近平 | 習近平.jpg |
    | 韓冰  | 韓冰.jpg   |
    | 馬英九 | 馬英九.jpg |

```
:::warning
"場景"改為"場景大綱"，兩個 step 才會連動。
變數的部份加上<>，才能對應到表格。
:::

#### 再測試 ```npm test```
![](https://i.imgur.com/W48seZv.png)

一個 scenario，兩個 step，測試五組資料都通過。

## 實做產品 html，加入通過測試的程式碼
```htmlmixed=
<!DOCTYPE html>
<html>
<head>
  <script type="text/javascript" src="imgData.js"></script>
  <script src="https://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"></script>
  <script src=" ../index.bundle.js "></script>
</head>

<body style="background-color:pink">

<div style="text-align: center; padding-top: 64px;">
  <input id="text" type="text" value="" size="15" placeholder="輸入文字" style="font-size: 48px;">
  <button onclick="generateImg()">出來吧</button>

  <div>
    <img id="img" src="https://i.imgur.com/f5cWWxT.png" style="max-height: 600px; max-width: 800px; padding-top: 32px;">
  </div>
</div>

<script>
function generateImg() {
  // get input text
  text = document.getElementById("text").value;
  // then find the meme's path in imgData
  path = imgData.get(text);
  console.log(path);
  // generate image in html
  document.getElementById("img").src = path;
}

</script>

</body>
</html>
```

### ```git push``` 後自動 Test, Build 以及 Deploy
![](https://i.imgur.com/uUfSmnp.png)
![](https://i.imgur.com/IIf6Vbq.png)

:::success
大功告成，往後更新時，都將會自動的測試以及發布。
:::
