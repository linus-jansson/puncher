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
    const [isCounting, setIsCounting] = useState(false);
    const [firstTimePunched, setFirstTimePunched] = useState<number | undefined>(undefined);
    const [lastPausedTime, setLastPausedTime] = useState<number | undefined>(undefined);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timeToSubtract, setTimeToSubtract] = useState(0);
    
    const handleInteraction = (e: KeyboardEvent<HTMLDivElement> | any) => {
        if (e.type === 'keyup' && e.key !== ' ') return;
        let miliNow = Date.now();
        // Event handler for when the user interact with the timer, IE pressing spacebar eller clicking the timer

        // If the user is pausing the timer, we need to set the lastPausedTime to the current time
        if (isCounting) {
            setLastPausedTime(miliNow);
        } else {
            // If the user is resuming the timer, we need to subtract the elapsed time while the timer was paused from time state
            if (lastPausedTime !== undefined) {
                setTimeToSubtract(prev => prev + (miliNow - lastPausedTime));
                window.localStorage.setItem('timeToSubtract', (timeToSubtract + (miliNow - lastPausedTime)).toString());
                // reset the lastTimePaused to undefined
                setLastPausedTime(undefined);
            } else if (firstTimePunched === undefined) {
                setFirstTimePunched(miliNow);
                window.localStorage.setItem('firstTimePunched', miliNow.toString());
            }
        }
        // setElapsedTime(() => CalculateTimeElapsed(firstTimePunched || 0, miliNow, timeToSubtract));
        setIsCounting(prev => !prev);
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

        // If the user refreshes the page
        // we need to get the previous state from localStorage
        let _isCounting = window.localStorage.getItem('isCounting') === 'true';
        let _firstTimePunched = parseInt(window.localStorage.getItem('firstTimePunched')!, 10);
        let _timeElapsed = parseInt(window.localStorage.getItem('elapsedTime')!, 10) || undefined;
        let _timeToSubtract = parseInt(window.localStorage.getItem('timeToSubtract')!, 10) || 0;

        setIsCounting(_isCounting );
        setFirstTimePunched(_firstTimePunched || undefined);
        setTimeToSubtract(_timeToSubtract);

        if (_timeElapsed !== undefined) {
            setElapsedTime(_timeElapsed);
        }

    }, [])
    
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
                className="px-3 py-1 mb-4 font-semibold text-red-700 bg-white border border-red-500 rounded mb-1px-4 hover:bg-red-500 hover:text-white hover:border-transparent"
                onClick={reset}
            >
                Reset
            </button>
            <button
                className='px-3 py-1 font-semibold text-blue-700 bg-white border border-blue-500 rounded hover:bg-blue-500 hover:text-white hover:border-transparent'
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
