import { useState, useEffect } from 'react'
import { KeyboardEvent } from 'react'

const formatTime = (millisec: number) => {
    if (millisec < 0) return "Negative time";

    let seconds: any = (millisec / 1000).toFixed(0);
    let minutes: any = Math.floor(seconds / 60);
    let hours: any = "";
  
    if (minutes > 59) {
      hours = Math.floor(minutes / 60);
      hours = hours >= 10 ? hours : "0" + hours;
      minutes = minutes - hours * 60;
      minutes = minutes >= 10 ? minutes : "0" + minutes;
    }
  
    seconds = Math.floor(seconds % 60);
    seconds = seconds >= 10 ? seconds : "0" + seconds;
    if (hours != "") {
      return hours + "h " + minutes + "m " + seconds + "s";
    }
  
    return minutes + "m " + seconds + "s";
}

function CalculateTimeElapsed(startTime:number, endTime:number, timeToSubtract:number) {
    return (endTime - startTime) - timeToSubtract;
}

function App() {
    const [isCounting, setIsCounting] = 
        useState(() =>  window.localStorage.getItem('isCounting') === 'true');
    
    const [firstTimePunched, setFirstTimePunched] = 
        useState<number | undefined>(() => parseInt(window.localStorage.getItem('firstTimePunched')!, 10) || undefined);
    
    const [lastPausedTime, setLastPausedTime] = 
        useState<number | undefined>(() => parseInt(window.localStorage.getItem('lastPausedTime')!, 10) || undefined);
    
    const [elapsedTime, setElapsedTime] = 
        useState(() => parseInt(window.localStorage.getItem('elapsedTime')!, 10) || 0);

    const [timeToSubtract, setTimeToSubtract] = 
        useState(() => parseInt(window.localStorage.getItem('timeToSubtract')!, 10) || 0);
    
    const pauseTimer = () => {
        let miliNow = Date.now();
        setLastPausedTime(miliNow);
        let currentElapsedTime = CalculateTimeElapsed(firstTimePunched || 0, miliNow, timeToSubtract);
        setElapsedTime(currentElapsedTime);
    }

    const resumeOrStart = () => {
        let miliNow = Date.now();
        if (lastPausedTime !== undefined) {
            setTimeToSubtract(prev => prev + (miliNow - lastPausedTime!));
            // reset the lastTimePaused to undefined
            setLastPausedTime(undefined);
        } else if (firstTimePunched === undefined) {
            setFirstTimePunched(miliNow);
        }
    }

    const toggleTimer = () => {
        setIsCounting(prev => !prev);
    }

    const handleInteraction = (e: KeyboardEvent<HTMLDivElement> | any) => {
        if (e.type === 'keyup' && e.key !== ' ') return;

        // If the user is pausing the timer, we need to set the lastPausedTime to the current time
        // If the user is resuming the timer, we need to subtract the elapsed time while the timer was paused from time state
        (isCounting) ? pauseTimer() : resumeOrStart();
        toggleTimer();
    }

    const reset = () => {
        setIsCounting(false);
        setElapsedTime(0);
        setFirstTimePunched(undefined);
        setTimeToSubtract(0);
        setLastPausedTime(undefined);
        window.localStorage.clear();
    }

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.localStorage.setItem('isCounting', isCounting.toString());
        window.localStorage.setItem('elapsedTime', elapsedTime.toString());
        window.localStorage.setItem('timeToSubtract', timeToSubtract.toString());
        window.localStorage.setItem('firstTimePunched', (firstTimePunched || 0).toString());
        window.localStorage.setItem('lastPausedTime', (lastPausedTime || 0).toString());

    }, [isCounting, firstTimePunched, lastPausedTime, elapsedTime, timeToSubtract])

    
    
    useEffect(() => {
        const tickInterval = setInterval(() => {
            if (!isCounting || firstTimePunched == undefined) return;
            let newTimeElapsed = CalculateTimeElapsed(firstTimePunched || 0, Date.now(), timeToSubtract);
            setElapsedTime(newTimeElapsed);
            window.localStorage.setItem('elapsedTime', newTimeElapsed.toString());
        }
        , 1000)
        
        return () => clearInterval(tickInterval);
    }, [isCounting, firstTimePunched])

    return (
        <div className="grid h-screen place-items-center" 
            onKeyUp={handleInteraction}
            tabIndex={0}
        >   
            <div className="absolute flex flex-col top-3 left-3">
                <button 
                    className="px-3 py-1 mb-4 font-bold text-red-700 uppercase bg-red-200 border border-red-500 rounded-lg mb-1px-4 hover:bg-red-500 hover:text-white hover:border-transparent"
                    onClick={reset}
                >
                    Reset
                </button>
                <button
                    className='px-3 py-1 font-bold text-blue-700 uppercase bg-blue-200 border border-blue-500 rounded-lg hover:bg-blue-500 hover:text-white hover:border-transparent'
                    onClick={handleInteraction}
                >
                        {isCounting ? "Pause" : "Start"}
                </button>
            </div>
            <div>
                <h1 className={`text-5xl font-bold ${isCounting ? "text-red-500": "text-white"}`}>
                {formatTime(elapsedTime)}
                </h1>
                
            </div>
        </div>
    )
}

export default App
