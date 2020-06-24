const assert = require('assert');
const { Given, When, Then } = require('cucumber');
let imgData = new Map();

imgData.set("王金平", "王金平.png")
imgData.set("賴清德", "賴清德.jpg")
imgData.set("習近平", "習近平.jpg")
imgData.set("韓冰", "韓冰.jpg")
imgData.set("馬英九", "馬英九.jpg")

function findImg(text) {
  return imgData.get(text);
}

// scenario #1
Given('使用者輸入 {string}', function (inputText) {
  // assert(textInput !== null, "has no input");
  this.text = inputText;
  // console.log(imgData);
});

Then('查找對應的圖片 {string}', function (expectedPath)  {
  this.actualPath = findImg(this.text);
  assert.equal(this.actualPath, expectedPath);
});


// scenario #2
Given('資料庫中有對應的路徑', function () {
  assert(this.path !== null, "找不到圖片");
});

Then('根據路徑產生圖片', function () {
  // document.getElementById("img").src = path;
  // 在 html 中實做
});

// scenario #3
Given('資料庫中 沒有 對應的路徑', function () {
  assert(this.path == null, "等等，明明有這張圖")
});

Then('告訴使用者沒有資料', function () {
  return("圖庫中尚未擁有這筆資料，待新增。");
});