import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [paragraph, setParagraph] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const inputRef = useRef(null);

  // Fallback paragraphs in case all APIs fail
  const fallbackParagraphs = [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice. It provides a good mix of common and uncommon letter combinations.",
    "Technology has revolutionized the way we communicate, work, and live our daily lives. From smartphones to artificial intelligence, innovation continues to shape our future in ways we never imagined possible.",
    "Reading books expands our knowledge, improves vocabulary, and enhances critical thinking skills. Literature allows us to explore different worlds, cultures, and perspectives from the comfort of our own homes.",
    "Climate change represents one of the most significant challenges facing our planet today. Scientists worldwide are working together to develop sustainable solutions for a greener and more environmentally conscious future.",
    "The art of cooking combines creativity, science, and tradition to create delicious meals that bring people together. Every recipe tells a story and connects us to different cultures around the world."
  ];

  const fetchParagraph = async () => {
    setIsLoading(true);
    setError("");
    
    // Try multiple API sources
    const apiSources = [
      {
        url: 'https://api.quotable.io/random',
        transform: (data) => data.content
      },
      {
        url: 'https://dummyjson.com/quotes/random',
        transform: (data) => data.quote
      },
      {
        url: 'https://api.api-ninjas.com/v1/quotes',
        headers: { 'X-Api-Key': 'demo' }, // Using demo key, you'd need your own
        transform: (data) => Array.isArray(data) ? data[0]?.quote : data.quote
      }
    ];

    for (const source of apiSources) {
      try {
        const response = await fetch(source.url, {
          headers: source.headers || {}
        });
        
        if (response.ok) {
          const data = await response.json();
          const content = source.transform(data);
          
          if (content && content.length > 50) { // Ensure we have substantial content
            setParagraph(content);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log(`Failed to fetch from ${source.url}:`, error);
        continue;
      }
    }
    
    // If all APIs fail, use a random fallback paragraph
    const randomIndex = Math.floor(Math.random() * fallbackParagraphs.length);
    setParagraph(fallbackParagraphs[randomIndex]);
    setError("Using offline content - API services unavailable");
    setIsLoading(false);
  };

  useEffect(() => {
    fetchParagraph(); 
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isRunning, timeLeft]);

  const startTest = async () => {
    setIsRunning(false);
    await fetchParagraph(); 
    setIsRunning(true);
    setUserInput("");
    setTimeLeft(60);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChange = (e) => {
    if (isRunning && timeLeft > 0) {
      setUserInput(e.target.value);
    }
  };

  const calculateWPM = () => {
    const words = userInput.trim().split(/\s+/).filter(word => word.length > 0).length;
    const timeElapsed = 60 - timeLeft;
    return timeElapsed > 0 ? Math.round((words * 60) / timeElapsed) : 0;
  };

  const calculateAccuracy = () => {
    if (userInput.length === 0) return 100;
    
    const inputChars = userInput.split("");
    const targetChars = paragraph.split("");
    let correct = 0;

    inputChars.forEach((char, idx) => {
      if (char === targetChars[idx]) correct++;
    });

    return Math.round((correct / inputChars.length) * 100);
  };

  const getStatusColor = () => {
    if (!isRunning && timeLeft === 60) return "text-gray-600"; 
    if (timeLeft === 0) return "text-red-600";
    if (timeLeft <= 10) return "text-orange-600";
    return "text-blue-600";
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-center p-6 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className={`w-full max-w-4xl rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        <h1 className={`text-4xl font-bold text-center mb-2 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>Typing Speed Test</h1>
        <p className={`text-center mb-6 transition-colors duration-300 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>Test your typing speed and accuracy</p>

        {error && (
          <div className={`border rounded-lg p-3 mb-4 transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-yellow-900 border-yellow-700 text-yellow-200' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="relative">
          {isLoading && (
            <div className={`absolute inset-0 rounded-lg flex items-center justify-center z-10 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>Loading new content...</div>
            </div>
          )}
          
          <div className={`p-6 rounded-lg border mb-6 min-h-[120px] text-lg leading-relaxed transition-colors duration-300 ${
            isDarkMode 
              ? 'text-gray-200 bg-gray-700 border-gray-600' 
              : 'text-gray-800 bg-gray-50 border-gray-200'
          }`}>
            {paragraph}
          </div>
        </div>

        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleChange}
          disabled={!isRunning || timeLeft === 0 || isLoading}
          className={`w-full h-40 p-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg resize-none transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-200 border-gray-600 placeholder-gray-400' 
              : 'bg-white text-gray-800 border-gray-300 placeholder-gray-500'
          }`}
          placeholder={isRunning ? "Type the text above..." : "Click 'Start Test' to begin typing..."}
        />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className={`p-6 rounded-xl border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-900 to-blue-800 border-blue-700' 
              : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
          }`}>
            <p className={`font-medium mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>Time Left</p>
            <p className={`text-3xl font-bold ${getStatusColor()}`}>{timeLeft}s</p>
          </div>
          <div className={`p-6 rounded-xl border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-900 to-green-800 border-green-700' 
              : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
          }`}>
            <p className={`font-medium mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-green-300' : 'text-green-700'
            }`}>Speed (WPM)</p>
            <p className={`text-3xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`}>{calculateWPM()}</p>
          </div>
          <div className={`p-6 rounded-xl border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-900 to-purple-800 border-purple-700' 
              : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'
          }`}>
            <p className={`font-medium mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-purple-300' : 'text-purple-700'
            }`}>Accuracy</p>
            <p className={`text-3xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>{calculateAccuracy()}%</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={startTest}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 text-lg shadow-lg"
          >
            {isLoading ? "Loading..." : isRunning ? "Restart Test" : "Start Test"}
          </button>
        </div>

        {timeLeft === 0 && (
          <div className={`mt-6 p-6 rounded-xl border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-900 to-blue-900 border-green-700' 
              : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
          }`}>
            <h3 className={`text-xl font-bold text-center mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Test Complete!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div>
                <p className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Final Speed</p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>{calculateWPM()} WPM</p>
              </div>
              <div>
                <p className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Final Accuracy</p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>{calculateAccuracy()}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}