const scriptName = "taltal";
/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */

 const ZoneID = {
  "서울": 1159068000,
  "부산": 2611053000,
  "춘천": 4211070500,
  "강릉": 4215052000,
  "인천": 2811058500,
  "수원": 4111356000,
  "청주": 4311374100,
  "홍성": 4480025600,
  "대전": 3017063000,
  "안동": 4514053000,
  "포항": 4711155000,
  "울산": 3111058500,
  "대구": 2714059000,
  "전주": 4511357000,
  "목포": 4611055400,
  "광주": 2917060200,
  "여수": 4613057000,
  "창원": 4812552000,
  "제주": 5011059000
};

const FUNC_LIST = [ "/날씨", "/카운트다운" ];
const MANGER_FUNC_LIST = [ "/DB생성", "" ];


function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {


  var method = msg.split(" ")[0];

  switch(method){
    case "/날씨" :  getWeather(msg,replier);
      break;
    case "/명령어" :  getOrderList(msg,replier);
      break;
    case "/카운트다운" : countDown(msg,replier);
      break;
  }


  if(sender == "김진원"){
    checkExistDB(msg,replier);
  }
}


//DB생성 함수
function checkExistDB(msg, replier){
  switch(msg){
    case "/DB생성": 
      if(  DataBase.getDataBase("normalDB")  ){
        replier.reply("이미 생성된 DB가 있습니다.");
      }else{
        DataBase.setDataBase("normalDB", "normalDB");
        replier.reply("DB생성 완료");
      }
      break;
    case "/DB 확인":
      if(  DataBase.getDataBase("normalDB")  ){
        replier.reply("이미 생성된 DB가 있습니다.");
      }else{
        replier.reply("생성된 db가 없습니다.");
      }
    break;
  }
}

function getSender(msg,replier,sender){
  // replier.reply(sender);

}

function chooseOne(){
  var list ="";  
}

function countDown(msg,replier){ 
  makeFunction(msg, "/카운트다운", 
  function(){
    replier.reply("숫자를 카운트다운합니다.\n\n" +
    "\"예시) /카운트다운 5");
  }, function(){
    var regex  = /[^0-9]/g;				// 숫자가 아닌 문자열을 매칭하는 정규식
    var number = msg.replace("/카운트다운 ", "");
    number     = number.replace(regex, "");	// 원래 문자열에서 숫자가 아닌 모든 문자열을 빈 문자로 변경
    
    if(number>10|| number<1){
      replier.reply("1~10 사이 숫자만 가능합니다.");
      return;
    }
    
    var countdown = 
      setInterval(
        function(){
          replier.reply(number);
          number--;
          
          if(number<1){
            clearInterval(countdown);
          }
        }
        , 1000);
  });
}

//명령어 리스트 출력 함수
function getOrderList(replier){
    replier.reply(FUNC_LIST);
}

//날씨 함수
function getWeather(msg,replier) {
  if (msg == "/날씨") {
    replier.reply("날씨는 이렇게 물어보세요.\n\n" +
        "\"예시) /날씨 서울\"\n\n" +
        "위치 리스트\n" +
        "서울,부산,춘천,강릉,인천,수원,청주,홍성,대전,안동,포항,울산,대구,전주,목포,광주,여수,창원,제주");
  } else if (msg.startsWith("/날씨 ")) {
      var name = msg.replace("/날씨 ", "");
      if (!ZoneID.hasOwnProperty(name)) {
          replier.reply("해당 위치를 찾을 수 없어요");
          return;
      }
      var data = org.jsoup.Jsoup.connect("http://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=" + ZoneID[name])
          .get();
      var time = data.select("pubDate").text();
      time = time.substring(time.indexOf(" ") + 1);
      data = data.select("data").get(0);
      var status = data.select("wfKor").text();
      var tmp = data.select("temp").text();
      var hum = data.select("reh").text();

      var result = "현재날씨 \"" + status + "\"\n\n";
      result += "기온 - " + tmp + "도\n";
      result += "습도 - " + hum + "%";
      replier.reply(result);
  }
}
/**
 * 작동함수 생성 함수 (설명부분과 실작동 함수) 
 * @param {String} msg  input문장
 * @param {String} word 검사단어
 * @param {Function} helpFunction 도움말 함수 
 * @param {Function} realFunction 작동 함수
 */
function makeFunction(msg,word,helpFunction,realFunction){
  if (msg == word) {
    helpFunction();
  } else if(msg.startsWith(word)){
    realFunction();
  }
}


//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("Hello, World!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}



function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}