import './App.css'
import VideoPlayer from './components/VideoPlayer'
import { useRef } from 'react'
import './tailwind';  // Path to the CSS file where you included Tailwind's directives

function App() {
    const playerRef = useRef(null)
    const videoLink = 'http://localhost:9000/uploads/courses/sonic@1234/master.m3u8'; // Replace with actual URL

    const videoPlayerOptions = {
        controls: true,
        responsive: true,
        fluid: true,
        sources: [
            {
                src: videoLink,
                type: "application/x-mpegURL"
            }
        ]
    }
    const handlePlayerReady = (player) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on("waiting", () => {
            console.log("player is waiting");
        });

        player.on("dispose", () => {
            console.log("player will dispose");
        });
    };
    return (
        <>
            <div>
                <h1>Video player</h1>
            </div>
            <VideoPlayer
                options={videoPlayerOptions}
                onReady={handlePlayerReady}
            />
        </>
    )
}

export default App
