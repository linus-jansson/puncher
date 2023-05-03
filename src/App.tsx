import { useState, useEffect, useMemo } from 'react'
import { KeyboardEvent } from 'react'


const formatTime = (millisec: number) => {
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


function App() {
    const [isCounting, setIsCounting] = useState(false)
    const [firstTimePunched, setFirstTimePunched] = useState<number | undefined>(undefined)
    const [time, setTime] = useState(0)

    const eventHandler = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== ' ') return;

        setIsCounting(prev => !prev);

        if (firstTimePunched === undefined) {
            let now = Date.now();
            setFirstTimePunched(now);
            window.localStorage.setItem('firstTimePunched', JSON.stringify(now));

        }

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('isCounting', JSON.stringify(!isCounting));
        }
    }

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let isCounting = window.localStorage.getItem('isCounting');
        let firstTimePunched = window.localStorage.getItem('firstTimePunched');

        setIsCounting(isCounting === 'true');
        setFirstTimePunched(parseInt(firstTimePunched!, 10) || undefined);

    }, [])
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isCounting || firstTimePunched === undefined) return
            setTime(Date.now() - firstTimePunched);
        }, 1000)

        return () => {
            clearInterval(interval)
        };
    }, [isCounting, firstTimePunched])

    const reset = () => {
        if (typeof window === 'undefined') return;
        setIsCounting(false);
        setFirstTimePunched(undefined);
        setTime(0);
        window.localStorage.clear();
    }

    return (
        <div className="grid h-screen place-items-center bg-stone-800" 
            onKeyUp={eventHandler}
            tabIndex={0}
        >   
            <button 
                className="absolute top-0 left-0 px-4 py-2 font-semibold text-blue-700 bg-white border border-blue-500 rounded hover:bg-blue-500 hover:text-white hover:border-transparent"
                onClick={reset}
                >
                Reset
            </button>
            <div>
                <h1 className={`text-5xl font-bold ${isCounting? "text-red-500": "text-white"}`}>
                {formatTime(time)}
                </h1>
            </div>
        </div>
    )
}

export default App
