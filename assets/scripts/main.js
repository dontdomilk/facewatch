const vid = document.getElementById('video');

const expressDiv = document.getElementById('expression');
const ageDiv = document.getElementById('age');

const expressionMap = {
    neutral: 'regular ass',
    angry: 'pissed off',
    happy: 'naive and silly',
    disgusted: 'disgusted',
    surprised: 'surprised'
}

let ages = [];

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('assets/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('assets/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('assets/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('assets/models'),
    faceapi.nets.ageGenderNet.loadFromUri('assets/models')
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        {video: {}},
        stream => (vid.srcObject = stream),
        err => alert(err)
        )
}

vid.addEventListener('playing', () => {
    const canvas = faceapi.createCanvasFromMedia(vid);
    document.querySelector('div.video').append(canvas);

    const displaySize = {height: vid.height, width: vid.width}

    faceapi.matchDimensions(canvas, displaySize)

    setInterval( async () => {
        const detections = await faceapi
            .detectAllFaces(vid, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const resizedObj = resizedDetections[0];
        const expression = Object.keys(resizedObj.expressions).reduce((a, b) => resizedObj.expressions[a] > resizedObj.expressions[b] ? a : b)

        const age = averageAge(resizedObj.age);
        console.log(age)

        expressDiv.innerText = expressionMap[expression];
        ageDiv.innerText = parseInt(age,10).toString();

        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height)

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100)
})

function averageAge(age) {
    ages = [age].concat(ages).slice(0, 30);
    const avgPredictedAge =
        ages.reduce((total, a) => total + a) / ages.length;
    return avgPredictedAge;
}