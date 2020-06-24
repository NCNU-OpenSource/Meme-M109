let imgData = new Map();
beforePath = "img/";

imgData.set("王金平", beforePath + "王金平.png")
imgData.set("賴清德", beforePath + "賴清德.jpg")
imgData.set("習近平", beforePath + "習近平.jpg")
imgData.set("韓冰", beforePath + "韓冰.jpg")
imgData.set("馬英九", beforePath + "馬英九.jpg")


// var imgData = require('./imgData.json');


// function findImg(text, imgData) {
    // data.forEach(function(text, imgData) {
    //     if(imgData.data.name == text){
    //         console.log(imgData.data.file);
    //         return beforePath + imgData.data.file;
    //     }
    // })
    // var imgData = require('./imgData.json');
    // var beforePath = "img/";
    // for(var i = 0; i < imgData.data.length; i++) {
    //     if(imgData.data[i].name == text){
    //         console.log(imgData.data[i].file);
    //         return beforePath + imgData.data[i].file;
    //     }
    // }
// }


// const fs = require('fs');
// var newImg = {
//     "name" : "aaa",
//     "file" : "aaa.jpg"
// }
// //寫入以上 json 文件選項
// function writeJSON(newImg) {
//     //先將原本的 json 檔讀出來
//     fs.readFile('./meme/imgData.json', function (err, imgData) {
//         if (err) {
//             return console.error(err);
//         }
//     //將二進制數據轉換為字串符
//         var img = imgData.toString();
//     //將字符串轉換為 JSON 對象
//         img = JSON.parse(img);
//     //將傳來的資訊推送到數組對象中
//         img.data.push(newImg);
//         img.total = img.data.length;
//         console.log(img.data);

//     //因為寫入文件（json）只認識字符串或二進制數，所以需要將json對象轉換成字符串
//         var str = JSON.stringify(img);
//     //將字串符傳入您的 json 文件中
//         fs.writeFile('./imgData.json', str, function (err) {
//             if (err) {
//                 console.error(err);
//             }
//             console.log('Add new img to imgData...')
//         })
//     })
// }

// writeJSON(newImg);
// // findImg("賴清德");

// // console.log(imgData);
