var iframe = $('#oneStopFrame');
var disableColor = "#DDD";
var refreshTimer, findTimer;

async function sortSeatList() {
    // 좌석 객체
    function getRectsAsync() {
        return new Promise((resolve) => {
            var rects = iframe[0].contentWindow.document.querySelectorAll('#ez_canvas rect');
            var rectsArray = Array.prototype.slice.call(rects);
            resolve(rectsArray);
        });
    }

    // 좌석 정렬 ( Y축 맨위, X축 중앙 )
    function sortRectsAsync(rectsArray) {
        return new Promise((resolve) => {
            rectsArray.sort(function (a, b) {
                var aX = a.getAttribute('x');
                var aY = a.getAttribute('y');
                var bX = b.getAttribute('x');
                var bY = b.getAttribute('y');
                if (aY == bY) {
                    return aX - bX;
                }
                return aY - bY;
            });
            resolve(rectsArray);
        });
    }

    // 정렬된 좌석 HTML에 다시 정렬
    function appendRectsAsync(sortedRects) {
        return new Promise((resolve) => {
            var svg = iframe[0].contentWindow.document.querySelector('#ez_canvas svg');
            sortedRects.forEach(function (rect) {
                svg.appendChild(rect);
            });
            resolve();
        });
    }

    // 좌석 정렬 실행
    var rectsArray = await getRectsAsync();
    var sortedRects = await sortRectsAsync(rectsArray);
    await appendRectsAsync(sortedRects);
}



function playSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // 음파 유형과 주파수 설정 (윈도우 효과음과 유사한 톤)
    oscillator.type = 'sine'; // 사인파 (기본 음색)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz

    // 볼륨 조절
    gainNode.gain.setValueAtTime(50, audioContext.currentTime); // 낮은 볼륨

    // 연결 및 재생
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();

    // 200ms 후 소리를 멈춤
    setTimeout(() => {
        oscillator.stop();
        audioContext.close();
    }, 200);
}


function simulateClick(ele) {
    let event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window
    });
   
    ele.dispatchEvent(event);
}
function startRefresh() {
    refreshTimer = setInterval(() => {
        if(iframe[0].contentWindow.lastZone == null){
            init();
            $('#gd'+iframe[0].contentWindow.lastGrade).click();
        }else{
            iframe[0].contentWindow.init_suv();
            parent.data.selectedSeatCount = 0;
            iframe[0].contentWindow.setSelectSeatCount(true);
            iframe[0].contentWindow.getBlockSeatList();
        }
    }, 800);
}

function findRect() {
    findTimer = setInterval(() => {
        var rect = $(`#ez_canvas rect:not([fill*='${disableColor}']):not([fill*='none'])`, iframe.contents());
        if (rect.length > 0) {
            simulateClick(rect[0]);
            playSound(); // 티켓을 찾았을 때 소리 재생
            clearInterval(refreshTimer);
            clearInterval(findTimer);
        }

        if (parent.data.selectedSeatCount > 0) {
            iframe[0].contentWindow.goTicketType();
        }
    }, 10);
}

function start() {
    sortSeatList().then(() => {
        startRefresh();
        findRect();
    });
}

function stop() {
	clearInterval(refreshTimer);
	clearInterval(findTimer);
}

start();
