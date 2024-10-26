'use client'
import React from 'react';
import { Maximize } from 'lucide-react';

const FullScreenButton: React.FC = () => {
    const handleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    return (
        <button onClick={handleFullScreen} className='p-2 rounded-full hover:bg-gray-100 transition duration-300'>
            <Maximize className='text-black' />
        </button>
    );
};

export default FullScreenButton;
