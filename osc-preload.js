const request = require("request")
const fs = require("fs")
const base64Img = require("base64-img")
const path = require("path")

/* 解决 jquery 无法加载问题.
必须要 使用 getter 方法,来进行懒加载,因为 jquery 依赖于dom结构,
但是代码执行到此时,是没有任何dom结构的.
*/
Object.defineProperties(window,{
    "$":{
            get: function () {
                return require("jquery")
            },
            configurable : true
        },
      "jQuery":{
              get: function () {
                  return require("jquery");
              },
              configurable : true
          }
    });

/* 获取cookie. */
window._autoChangeOSCAvatar = () => {
    const {
        session
    } = require('electron').remote

    session.defaultSession.cookies.get({
        url: window.location.href
    }, (error, cookies) => {
        const cookieStr = cookies.reduce((str, cookie) => {
            const {
                name,
                value
            } = cookie
            str += `${name}=${value};`
            return str
        }, "")

        /* 我们有足够丰富的方式来获取或计算图片的路径,此处默认采用的方式就是:
        当前目录下的 test.jpeg 图片.
        另外,此处文件注意使用 jpeg 后缀.这要是 OSC 本身的限制.*/
        const imgPath = path.resolve(__dirname,"./test.jpeg")
        console.log(imgPath)

        /* 此处,将文件转换为 base64,只是因为 osc 的头像变更接口,设计如此!! */
        const imgData = base64Img.base64Sync(imgPath)

        const userCode = $("val[data-name=user_code]").data("value")

        request({
            url: `https://my.oschina.net/action/user/save_portrait_new`,
            method: "POST",
            formData: {
                img: imgData,
                user_code: userCode
            },
            headers: {
                "cookie": cookieStr
            }
        }, function(err, response, body) {
          console.log(err, response, body)

          const {error} = JSON.parse(body)
          if ( ! error) {
            window.location.reload()
          }
        })
    })
}

setTimeout(()=>{
  const user_code = $("val[data-name=user_code]").data("value")
  if ( ! user_code) {
    alert("登录并跳转至个人信息相关页面,即可体验头像自动变换功能!")
  }else{
    if (confirm("想要(继续)体验自动换头像???")) {
      window._autoChangeOSCAvatar()
    }else{
      console.log("或许,是个遗憾!!!")
    }
  }
}, 1000)
