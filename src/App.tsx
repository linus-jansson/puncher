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
    
  
    const handleInteraction = (e: KeyboardEvent<HTMLDivElement>) => {
        console.log(e.key)
        if (e.key !== ' ') return;
        let miliNow = Date.now();
        // Event handler for when the user interact with the timer, IE pressing spacebar eller clicking the timer

        // If the user is pausing the timer, we need to set the lastPausedTime to the current time
        if (isCounting) {
            setLastPausedTime(miliNow);
        } else {
            // If the user is resuming the timer, we need to subtract the elapsed time while the timer was paused from time state
            if (lastPausedTime !== undefined) {
                setTimeToSubtract(prev => prev + (miliNow - lastPausedTime));
                // reset the lastTimePaused to undefined
                setLastPausedTime(undefined);
            } else if (firstTimePunched === undefined) {
                setFirstTimePunched(miliNow);
                window.localStorage.setItem('firstTimePunched', miliNow.toString());
            }
        }

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
        let isCounting = window.localStorage.getItem('isCounting');
        let firstTimePunched = window.localStorage.getItem('firstTimePunched');

        setIsCounting(isCounting === 'true');
        setFirstTimePunched(parseInt(firstTimePunched!, 10) || undefined);

    }, [])
    
    useEffect(() => {
        const tickInterval = setInterval(() => {
            if (!isCounting || firstTimePunched == undefined) return;
            setElapsedTime(() => CalculateTimeElapsed(firstTimePunched || 0, Date.now(), timeToSubtract))
        }
        , 1000)
        
        return () => clearInterval(tickInterval);
    }, [isCounting, firstTimePunched])

    return (
        <div className="grid h-screen place-items-center bg-stone-800" 
            onKeyUp={handleInteraction}
            tabIndex={0}
        >   
            <button 
                className="absolute top-0 left-0 px-4 py-2 font-semibold text-blue-700 bg-white border border-blue-500 rounded hover:bg-blue-500 hover:text-white hover:border-transparent"
                onClick={reset}
                >
                Reset
            </button>
            <div>
                <h1 className={`text-5xl font-bold ${isCounting ? "text-red-500": "text-white"}`}>
                {formatTime(elapsedTime)}
                </h1>
            </div>
        </div>
    )
}

export default App
