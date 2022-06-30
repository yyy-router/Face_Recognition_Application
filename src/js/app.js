const video = document.getElementById("video");
const warning = document.querySelector(" .info p:nth-child(2)");
const secure = document.querySelector(".info p:nth-child(1)");
/* 获取摄像头权限，把视频内容展现在网页上 */
const startVideo = () => {
    navigator.getUserMedia(
        { video: {} },
        (stream) => { video.srcObject = stream },
        (err) => { console.log(err) }
    )
}
/* 引入faceapi资源 */
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
    faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo());
/* 监听人物动作 */
video.addEventListener("play", () => {
    /* 添加canvas绘图 */
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = {
        /*   width: video.width,
          height: video.height, */
        width: 600,
        height: 400,
    };
    faceapi.matchDimensions(canvas, displaySize);
    /* 把数据填入canvas当中 */
    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
        // console.log(detections)
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        // draw detections into the canvas
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        // console.log('resizedDetections',resizedDetections.length)
        // console.log('warning',warning)
        secure.style.display = 'block';
        if(resizedDetections.length){
           secure.style.display = 'block';
           warning.style.display = 'none'
        }else{
           warning.style.display = 'block';
           secure.style.display = 'none'
        }
    }, 100);
})