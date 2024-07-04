import { useEffect, useState } from "react";

export const Receiver = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const [video, setVideo] = useState<HTMLVideoElement | null>(null);

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:8080');
        newSocket.onopen = () => {
            newSocket.send(JSON.stringify({
                type: 'receiver'
            }));
        };
        setSocket(newSocket);

        const newPc = new RTCPeerConnection();
        setPc(newPc);

        const newVideo = document.createElement('video');
        document.body.appendChild(newVideo);
        setVideo(newVideo);

        newPc.ontrack = (event) => {
            console.log(event);
            newVideo.srcObject = new MediaStream([event.track]);
        };

        newSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                newPc.setRemoteDescription(message.sdp).then(() => {
                    newPc.createAnswer().then((answer) => {
                        newPc.setLocalDescription(answer);
                        newSocket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                newPc.addIceCandidate(message.candidate);
            }
        };
    }, []);

    const handleStart = () => {
        if (video) {
            video.play().catch((error) => {
                console.error('Error attempting to play', error);
            });
        }
    };

    return (
        <div>
            <button onClick={handleStart}>Start Video</button>
        </div>
    );
};
