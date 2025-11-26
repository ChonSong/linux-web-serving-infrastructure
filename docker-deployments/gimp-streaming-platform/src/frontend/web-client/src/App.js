import React, { useEffect, useRef, useState } from 'react';
import RFB from '@novnc/novnc/lib/rfb';

const App = () => {
    const rfbRef = useRef(null);
    const containerRef = useRef(null);
    const [status, setStatus] = useState('Disconnected');

    useEffect(() => {
        const connect = () => {
            if (!containerRef.current) return;

            const url = `ws://${window.location.hostname}:8080`;
            const rfb = new RFB(containerRef.current, url);

            rfb.addEventListener('connect', () => {
                setStatus('Connected');
            });

            rfb.addEventListener('disconnect', () => {
                setStatus('Disconnected');
            });

            rfb.addEventListener('credentialsrequired', () => {
                rfb.sendCredentials({ password: 'vncpassword' });
            });

            rfbRef.current = rfb;
        };

        connect();

        return () => {
            if (rfbRef.current) {
                rfbRef.current.disconnect();
            }
        };
    }, []);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', background: '#333', color: '#fff' }}>
                Status: {status}
            </div>
            <div
                ref={containerRef}
                style={{ flex: 1, background: '#000', overflow: 'hidden' }}
            />
        </div>
    );
};

export default App;
