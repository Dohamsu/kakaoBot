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

const FUNC_LIST = [ "/날씨", "/카운트다운","/마법의소라고동님", "/선택", "/방탈리스트", "/방탈상세","/방탈예약", "/맛집"];
const MANGER_FUNC_LIST = [ "/DB생성", "" ];
const ROOM_STORE_LIST = [{"storeName" : "비밀의화원 혜화점", "site" : "secretGarden_Hyewha"}, {"storeName" : "비밀의화원 리버타운점", "site" : "secretGarden_RiverTown"},
 {"storeName" : "비밀의화원 시네마틱혜화", "site" : "secretGarden_CenematicHyewha"},{"storeName" : "포인트나인 강남1호점", "site" : "pointNine_Gangnam1"},
 {"storeName" : "포인트나인 강남2호점", "site" : "pointNine_Gangnam2"}];
const ROOM_CROLLING_URL = "http://110.35.170.102:8808/croll/";
const MATJIP_URL = "http://110.35.170.102:8808/croll/matjip/";

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  var fullMsg = msg;
  var method = msg.split(" ")[0];

  //명령어 반응
  switch(method){
    case "/날씨" :  getWeather(msg,replier);
      break;
    case "/명령어" :  getOrderList(replier);
      break;
    case "/카운트다운" : countDown(msg,replier);
      break;
    case "/마법의소라고동님" : magicSora(msg,replier);
      break;
    case "/선택" : chooseOne(msg,replier);
      break;
    case "/방탈리스트" : searchRoomList(msg,replier);
      break;
    case "/방탈상세" : searchRoomDetail(msg,replier);
      break;
    case "/방탈예약" : checkReserableTime(msg, replier);
      break;
    case "/맛집" : getMatjip(msg, replier);
      break;
  }

  if(sender == "김진원" ||sender == "김진원/도함수의활용" ){
    switch(method){
      case "/맛집" : getMatjip(msg, replier);
        break;
      }
  }

  //구어에 반응
  switch(fullMsg){   
    case "집에 가고싶다" :
    case "집에 가고싶어" :
    case "퇴근 마렵다" :
    case "퇴근마렵다" : 
    case "퇴근할래" : 
    case "집갈래" : 

      calculRemainTime(msg,replier, 18);
      break;
   }

  //메시지 읽음 처리
  replier.markAsRead();
}


//DB생성 함수
function checkExistDB(msg, replier){
  switch(msg){
    case "/DB 생성": 
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

//DB저장하기
function saveDB(fileName, data){
  let isDB       = DataBase.getDataBase(fileName);
  let insertData = JSON.stringify(data);
  //DB존재시 이어쓰기
  if(isDB){
    DataBase.appendDataBase(fileName, insertData);
  }else{
    //DB 미존재 시 생성 및 데이터 저장
    DataBase.setDataBase(fileName, insertData);
  }
}

//DB 불러오기
function getDB(fileName){
  let dbString = DataBase.getDataBase(fileName);
  if(dbString){
    let dbObject = JSON.parse(dbString);
    Log.d("db로드 완료 ");
    return dbObject;
  }else{
    replier.reply("요청한 DB가 존재하지 않습니다.");
  }
}

//방탈출 리스트 검색
function searchRoomList(msg, replier){
  makeFunction(msg,"/방탈리스트",function(){
    replier.reply("지역별 방탈출 목록을 검색합니다 .\n\n" +
    "예시) /방탈리스트 대지역 소지역 결과갯수 \n /방탈리스트 서울 강남 10");
  },function(){
    let inputTxt     = msg.replace("/방탈리스트 ", "");
    let inputDist1   = inputTxt.split(" ")[0];
    let inputDist2   = inputTxt.split(" ")[1];
    let resultLimit  = inputTxt.split(" ")[2] || 10; //결과 목록 수 
    let listArray    = getDB("roomExList");
    let resultStr    = ""; 
    let tryNumber    = 0;

    listArray.forEach(element => {
      if(element.dist1.includes(inputDist1) || element.dist2.includes(inputDist1) || element.dist2.includes(inputDist2) ){
        if(tryNumber == resultLimit){
          return;
        }        
        resultStr += "\n " + element.theme;
        tryNumber++;
      }
    });
    replier.reply(resultStr);
  });

}

//방탈출 상세 검색
function searchRoomDetail(msg, replier){
  makeFunction(msg,"/방탈상세",function(){
    replier.reply("방탈출에 대한 상세 정보를 검색합니다 .\n\n" +
    "예시) /방탈상세 테마명  지점 평점 난이도 공포도 활동성 \n /방탈상세 퀘스천마크 평점 난이도");
  },function(){
    let inputTxt        = msg.replace("/방탈상세 ", "");
    let inputTheme      = inputTxt.split(" ")[0];
    let listArray       = getDB("roomExList");
    let tempTxt         = ""; 
    let selectAll       = inputTxt.includes("전체");
    let selectStore     = inputTxt.includes("지점") || selectAll; 
    let selectScore     = inputTxt.includes("평점") || selectAll; 
    let selectDificulty = inputTxt.includes("난이도") || selectAll; 
    let selectHorror    = inputTxt.includes("공포도") || selectAll; 
    let selectActivity  = inputTxt.includes("활동성") || selectAll; 
    let resultArray     = [];
    listArray.forEach(element => {
      if(element.theme.replace(" ", "").includes(inputTheme)){
        tempTxt = "\n " + element.theme;
        tempTxt = selectStore == true ? tempTxt + " \n 지점 : " + element.storeName : tempTxt; 
        tempTxt = selectScore == true ? tempTxt + " \n 평점 : " + element.score : tempTxt; 
        tempTxt = selectDificulty == true ? tempTxt + " \n 난이도 : " + element.dificulty: tempTxt; 
        tempTxt = selectHorror == true ? tempTxt + "\n 공포도 : " + element.horror: tempTxt; 
        tempTxt = selectActivity == true ? tempTxt + "\n 활동성 : " + element.activity: tempTxt; 
        resultArray.push(tempTxt);
      }
    });
    replier.reply(resultArray.slice(0,10));
  });
}

//남은시간 계산기 
function calculRemainTime(msg, replier, time){
  let nowTime  = new Date();
  let nowYear  = nowTime.getFullYear();
  let nowMonth = nowTime.getMonth();
  let nowDay   = nowTime.getDate();
  let nowHour  = nowTime.getHours();
  let nowMin   = nowTime.getMinutes();
  let targetTime = new Date(nowYear, nowMonth, nowDay, time);
  let term = targetTime - nowTime;
  // let hour    = time.
  
  let termHour = Math.floor(term/1000/60/60);
  let termMin  = Math.ceil((term/1000/60)%60);

  if(termHour > 8 || termHour < 0){
    // replier.reply("");
  }else{
    let hourText = termHour < 1 ?   "" : termHour + "시간 ";
    
    replier.reply("퇴근까지 " + hourText + termMin+ "분 남았습니다.");

  }
}

//선택지 고르는 함수
function chooseOne(msg, replier){
  makeFunction(msg, "/선택",
  function(){
    replier.reply("여러 선택지중 하나를 선택합니다.\n\n" +
    "\"예시) /선택 물냉면,비빔냉면");
  }, function(){
    msg           = msg.replace("/선택 ", "");
    let list      = msg.split(",");  
  
    if(list.length < 2){
      replier.reply("형식에 맞지 않습니다. ,로 단어를 연결해주세요" );
    }else{
      let randomNum = Math.floor(Math.random()*list.length);
      let resultTxt = list[randomNum];
      replier.reply(resultTxt);

      let obj = {};
      obj.keywordList  = msg;
    }
  }); 
}

//마법의 소라고동 
function magicSora(msg,replier){
  makeFunction(msg, "/마법의소라고동님",
  function(){
    replier.reply("마법의 소라고동님에게 질문합니다.\n\n" +
    "\"예시) /마법의소라고동님 내일 비가 올까요?");
  }, function(){
    
    var randomNum = Math.floor(Math.random()*10);
    var resultTxt = "";
    
    switch(randomNum){
      case 1 : resultTxt = "안 돼";
        break;
      case 2 : resultTxt = "응 돼";
        break;
      case 3 : resultTxt = "그러렴";
        break;
      case 4 : resultTxt = "다시 한 번 말해봐";
        break;
      case 5 : resultTxt = "아니";
        break;
      case 6 : resultTxt = "그럼";
        break;
      case 7 : resultTxt = "다 안돼";
        break;
      case 8 : resultTxt = "가만히 있어";
        break;
      case 9 : resultTxt = "언젠가는";
        break;

    }
    replier.reply(resultTxt);
  });
}

//숫자 카운트 다운
function countDown(msg,replier){ 
  makeFunction(msg, "/카운트다운", 
  function(){
    replier.reply("숫자를 카운트다운합니다.\n\n" +
    "\"예시) /카운트다운 5");
  }, function(){
    var regex  = /[^0-9]/g;				// 숫자가 아닌 문자열을 매칭하는 정규식
    var number = msg.replace("/카운트다운 ", "");
    number     = number.replace(regex, "");	// 원래 문자열에서 숫자가 아닌 모든 문자열을 빈 문자로 변경
    
    if(number > 10 || number < 1){
      replier.reply("1~10 사이 숫자만 가능합니다.");
      return;
    }
    
    var countdown = setInterval(
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
  let resultTxt = "";
  FUNC_LIST.forEach(element => {
    resultTxt += "\n" +element;
  });
    replier.reply(resultTxt);
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

//방탈 예약가능 시간 확인
function checkReserableTime(msg,replier){
  if (msg == "/방탈예약") {
    replier.reply("방탈 예약가능 시간을 검색합니다.\n\n" +
        "\"예시) /방탈예약 05/05/비밀의화원 리버타운점\"\n\n예약가능 매장"
        +getSearchableRoomStoreList());
  } else if (msg.startsWith("/방탈예약 ")) {
    
      //지점을 구별  URL 인자로 변환
      function changeToSite(storeName){
        let siteParam = "";
        ROOM_STORE_LIST.forEach(element =>{
          if(element.storeName.replace(/(\s*)/g,"") == storeName.replace(/(\s*)/g,"")){
            siteParam = element.site;
          }            
        });
        return siteParam;
      }

      let inputText  = msg.replace("/방탈예약 ", "");
      let month      = inputText.split("/")[0];
      let day        = inputText.split("/")[1];
      let inputTheme = inputText.split("/")[2];
      if(!inputTheme){
        showCautionMsg(replier);
        return;
      }
      let siteUrl    = changeToSite(inputTheme);
      let searchUrl  = ROOM_CROLLING_URL + siteUrl + "/month=" + month +"&day=" +day;

      if(!siteUrl){
        replier.reply("해당 지점은 검색할 수 없습니다.");
        return;
      }

      //jsoup의 경우 파싱과 xml response 만 가능하여 xml 형식으로 받음
      var data        = org.jsoup.Jsoup.connect(searchUrl).get();      
      let resultArray = JSON.parse(data); //tojson
      let returnText  = "";
      let directUrl   = "";

      //결과 메시지 가공
      resultArray.forEach(element => {
        let title          = element.title;
        let summary        = element.summary;
        let reservableTime = element.reservableTime == "" ||  element.reservableTime == undefined ? " 마감" : element.reservableTime ;
        let tempText       = "";
        reservableTime    = refineTimeArray(reservableTime.replace(/(\s*)/g,""));
        directUrl         = element.siteUrl;

          tempText = "\n "+ title+ 
           "\n" + reservableTime + "\n";
          returnText +=tempText;

        //예약 가능시간 array 가공
        function refineTimeArray(str){
          let timeArray = [];
          let strLength = str.length;
          if(strLength > 5){
              let objectCycle = Math.floor(strLength/5);
              for(let cycle = 0 ; cycle < objectCycle; cycle++){
                  timeArray.push(" "+str.substr(cycle*5,5));
              }
              return timeArray;
          }else{
              return str;
          }
        }
      });


      if(returnText.length <10){
        replier.reply("결과가 존재하지 않습니다.");
      }else{
        returnText = returnText + "\n 예약 바로가기 : " + directUrl;
        replier.reply(returnText);
      }
  }
}

//예약 검색 가능한 방탈 리스트 출력
function getSearchableRoomStoreList(){
  let returnText = "";
  ROOM_STORE_LIST.forEach(element => {
      returnText +="\n" + element.storeName ;
  });
  return returnText;
}

//맛집 검색
function getMatjip(msg,replier){
  if (msg == "/맛집") {
    replier.reply("맛집을 검색합니다.\n\n" +
        "\"예시) /맛집 강남역");
  } else if (msg.startsWith("/맛집 ")) {
      let inputText  = msg.replace("/맛집 ", "");

      if(!inputText){
        showCautionMsg(replier);
        return;
      }
      let searchUrl  = MATJIP_URL + "keyword="+ inputText;

      //jsoup의 경우 파싱과 xml response 만 가능하여 xml 형식으로 받음
      var data        = org.jsoup.Jsoup.connect(searchUrl).get();      
      let resultArray = JSON.parse(data); //tojson
      let returnText  = "";
      
      //결과 메시지 가공
      resultArray.forEach(element => {
        let title      = element.title;
        let tempText   = "";
        tempText = "\n "+ title
        returnText +=tempText;        
      });


      if(returnText.length <10){
        replier.reply("결과가 존재하지 않습니다.");
      }else{
        replier.reply(returnText);
      }
  }

}

//양식 경고 메시지 출력
function showCautionMsg(replier){
  replier.reply("양식에 맞춰 작성해주세요.");
}

/**
 * 작동함수 생성 함수 (도움말 부분과 실작동 함수) 
 * @param {String} msg  input문장
 * @param {String} word 검사단어
 * @param {Function} helpFunction 도움말 함수 
 * @param {Function} realFunction 작동 함수
 */
function makeFunction(msg, word, helpFunction, realFunction){
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