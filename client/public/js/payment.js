// ---------------------------
// 1. elementsインスタンスを用意する
// ---------------------------
var stripe = Stripe("pk_test_51HY4LDIyqWtt9vDnFYFURjLaFiRigfVkXZvjFppEm9o7AxJISd5CwTfs9xomJQy3GrnCvlO38IKEoBvQUOlt23om00n5KNIohe");
var elements = stripe.elements();

// 注文情報
var order = {
    items : [
        {
            name : "scrab",
            amount : 2000,
            quantity : 2
        },
        {
            name : "soap",
            amount : 1500,
            quantity : 1
        }
    ],
    currency : "jpy",
    paymentMethodId : null
}

// ---------------------------
// 2. htmlロードにelementインスタンスを生成、マウント
// ---------------------------
var style = {
  base: {
    color: "#32325d",
  }
};

var card = elements.create("card", { style: style });
card.mount("#card-element"); // formタグ内のdivにマウント

// ---------------------------
// 3. cardインスタンスの状態変更をハンドリング
// ---------------------------
card.on('change', ({error}) => {
    const displayError = document.getElementById('card-errors');
    // エラーがあればcard-errorsのdivにエラーメッセージを生成
    if (error) {
      displayError.textContent = error.message;
    } else {
      displayError.textContent = '';
    }
});

// ---------------------------
// 4. ボタンが押下された際に決済リクエストの送信、ハンドリング
// ---------------------------

const submitButton = document.getElementById("payment-form-submit");

// ボタンがクリックされたら、アクションを実行
submitButton.addEventListener("click", function(event) {

    // スピナーを表示する
    displaySpinner();

    // iframe経由でカード情報を送信し、サーバサイドに決済処理を移譲する
    stripe
        .createPaymentMethod("card", card)
        .then(function(result){
            if(result.error) {
                onError();
            } else {
                // 支払メソッドIDをリクエストデータに詰める
                order.paymentMethodId = result.paymentMethod.id;

                // サーバサイドへ決済情報を渡して結果をハンドリングする
                fetch("http://localhost:3000/v1/order/payment", {method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(order)})
                .then(function(result){
                    return result.json();
                })
                .then(function(response){
                    onComplete(response);
                });
            }
        })
        .catch(function(){
            onError();
        });
});

// ---------------------------
// 5. 戻るボタンでリセット
// ---------------------------

// ボタンの要素を取得
let returnButtonNormal = document.getElementById("return-button-normal");
let returnButtonError = document.getElementById("return-button-error");
let returnButtonNotYet = document.getElementById("return-button-not-yet");
let returnButtonDefault = document.getElementById("return-button-default");

returnButtonNormal.addEventListener("click", reset);
returnButtonError.addEventListener("click", reset);
returnButtonNotYet.addEventListener("click", reset);
returnButtonDefault.addEventListener("click", reset);

/**
 * イベントハンドラ。リセットする。
 * @param {*} event 
 */
function reset(event) {
    hideError();
    hideMessage();
    hideNotYetMessage();
    displayButton();

    card.mount("#card-element");
}


/**
 * 決済を終了します。
 */
function onComplete(response){

    shutdown();

    hideSpinner();

    if(response.error) {
        onError();
    } else if (response.paymentIntentStatus === "succeeded") {
        displayMessage();
    } else {
        displayNotYetMessage();
    }
}

/**
 * エラー発生時のDOMハンドリング
 */
function onError() {

    shutdown();

    if(!document.querySelector(".spinner-border").classList.contains("collapse")) {
        hideSpinner();
    }
    displayError();
    
}

function shutdown() {
    card.unmount();
    hideButton();
}

// ---------------------------
// x. 表示関連のスニペット
// ---------------------------

function hideSpinner() {
    document.querySelector(".spinner-border").classList.add("collapse")
}

function displaySpinner() {
    document.querySelector(".spinner-border").classList.remove("collapse");
}

function hideError() {
    document.querySelector(".contents-payment-error").classList.add("collapse");
}

function displayError() {
    document.querySelector(".contents-payment-error").classList.remove("collapse");
}

function displayMessage() {
    document.querySelector(".contents-payment-result").classList.remove("collapse");
}

function hideMessage() {
    document.querySelector(".contents-payment-result").classList.add("collapse");
}

function displayNotYetMessage() {
    document.querySelector(".contents-payment-not-yet").classList.remove("collapse");
}

function hideNotYetMessage() {
    document.querySelector(".contents-payment-not-yet").classList.add("collapse");
}

function hideButton() {
    document.querySelector("#payment-form-submit").classList.add("collapse");
}

function displayButton() {
    document.querySelector("#payment-form-submit").classList.remove("collapse");
}