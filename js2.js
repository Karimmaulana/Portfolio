
// 1️⃣ Load Library TensorFlow & MediaPipe
const script1 = document.createElement("script");
script1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands";
document.body.appendChild(script1);

const script2 = document.createElement("script");
script2.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core";
document.body.appendChild(script2);

const script3 = document.createElement("script");
script3.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter";
document.body.appendChild(script3);

const script4 = document.createElement("script");
script4.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl";
document.body.appendChild(script4);

const script5 = document.createElement("script");
script5.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/handpose";
document.body.appendChild(script5);

// 2️⃣ Akses Kamera Laptop
async function startCamera() {
    const video = document.getElementById("video");
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error("Gagal mengakses kamera:", error);
    }
}

startCamera();

// 3️⃣ Load Model AI untuk Deteksi Tangan
async function detectHands() {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const model = await handpose.load();

    async function processFrame() {
        const predictions = await model.estimateHands(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        predictions.forEach(prediction => {
            prediction.landmarks.forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            });
        });

        recognizeGesture(predictions);
        controlMusic(predictions);

        requestAnimationFrame(processFrame);
    }

    processFrame();
}

detectHands();

// 4️⃣ Mengenali Gerakan Tangan
function recognizeGesture(predictions) {
    if (predictions.length > 0) {
        const hand = predictions[0].landmarks;
        const thumbTip = hand[4];
        const indexTip = hand[8];
        const middleTip = hand[12];

        if (thumbTip[1] < indexTip[1] && thumbTip[1] < middleTip[1]) {
            console.log("👍 Jempol ke atas terdeteksi!");
        }
    }
}

// 5️⃣ Kontrol Musik dengan Gesture
const audio = document.getElementById("audioPlayer");
const playlist = ["lagu1.mp3", "lagu2.mp3", "lagu3.mp3"];
let currentSong = 0;

function controlMusic(predictions) {
    if (predictions.length > 0) {
        const hand = predictions[0].landmarks;
        const thumbTip = hand[4];
        const indexTip = hand[8];
        const middleTip = hand[12];
        const ringTip = hand[16];
        const pinkyTip = hand[20];

        // ▶️ Pause/Play
        if (indexTip[1] < middleTip[1] && middleTip[1] < ringTip[1] && ringTip[1] < pinkyTip[1]) {
            if (audio.paused) {
                audio.play();
                console.log("▶️ Play Musik");
            } else {
                audio.pause();
                console.log("⏸ Pause Musik");
            }
        }

        // ⏭ Ganti Lagu (Swipe kanan)
        if (indexTip[0] > pinkyTip[0] + 50) {
            nextSong();
            console.log("⏭ Ganti Lagu");
        }

        // ⏮ Lagu Sebelumnya (Swipe kiri)
        if (indexTip[0] < pinkyTip[0] - 50) {
            prevSong();
            console.log("⏮ Kembali ke Lagu Sebelumnya");
        }

        // 🔊 Volume Naik (Jempol ke atas)
        if (thumbTip[1] < indexTip[1]) {
            audio.volume = Math.min(1, audio.volume + 0.05);
            console.log("🔊 Volume Naik");
        }

        // 🔉 Volume Turun (Jempol ke bawah)
        if (thumbTip[1] > indexTip[1]) {
            audio.volume = Math.max(0, audio.volume - 0.05);
            console.log("🔉 Volume Turun");
        }
    }
}

// 6️⃣ Fungsi Ganti Lagu
function nextSong() {
    currentSong = (currentSong + 1) % playlist.length;
    audio.src = playlist[currentSong];
    audio.play();
}

function prevSong() {
    currentSong = (currentSong - 1 + playlist.length) % playlist.length;
    audio.src = playlist[currentSong];
    audio.play();
}
