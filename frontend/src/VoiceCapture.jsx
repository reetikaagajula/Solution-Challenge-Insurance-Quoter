import React, { useState, useRef } from "react";

const VoiceCapture = () => {
  const [transcript, setTranscript] = useState("");
  const [geminiData, setGeminiData] = useState(null);
  const [quote, setQuote] = useState(null);
  const [geminiError, setGeminiError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const fullTranscriptRef = useRef("");

  const startListening = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    fullTranscriptRef.current = ""; // reset
    setTranscript("");
    setGeminiData(null);
    setQuote(null);

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        interim += result[0].transcript;

        if (result.isFinal) {
          fullTranscriptRef.current += result[0].transcript + " ";
        }
      }

      setTranscript(fullTranscriptRef.current + interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);

      const finalText = fullTranscriptRef.current.trim();
      setTranscript(finalText);
      await sendToGemini(finalText);
    }
  };

  // const sendToGemini = async (message) => {
  //   try {
  //     const res = await fetch("https://us-central1-pelagic-quanta-455716-s2.cloudfunctions.net/geminiFunction", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ message })
  //     });

  //     const data = await res.json();
  //     setGeminiData(data);

  //     const quoteRes = await fetch("http://localhost:5000/quote", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(data)
  //     });

  //     const quoteData = await quoteRes.json();
  //     setQuote(quoteData);

  //   } catch (err) {
  //     console.error("Error contacting Gemini or quote backend:", err);
  //     alert("An error occurred. Please try again.");
  //   }
  // };


  const sendToGemini = async (message) => {
    try {
      const res = await fetch("https://us-central1-pelagic-quanta-455716-s2.cloudfunctions.net/geminiFunction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
  
      const data = await res.json();
      setGeminiData(data);
  
      const fallback = data.message?.toLowerCase().includes("trouble understanding");
      const isValid = data.age && data.coverage && data.term_years !== undefined;
  
      if (!isValid || fallback) {
        setGeminiError("!Sorry, I had trouble understanding your request. Please try again.");
        setQuote(null);
        return;
      }
  
      setGeminiError(""); // Clear any old errors
  
      const quoteRes = await fetch("http://localhost:5000/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
  
      const quoteData = await quoteRes.json();
      setQuote(quoteData);
  
    } catch (err) {
      console.error("Error contacting Gemini or quote backend:", err);
      setGeminiError("!Something went wrong. Please try again.");
      alert("An error occurred. Please try again.");
    }
  };
  
  

  return (
    <div>
      <h1>🎤 Voice Insurance Quoter</h1>
  
      {!isListening ? (
        <button onClick={startListening}>🎙 Start Speaking</button>
      ) : (
        <button onClick={stopListening}>🛑 Stop & Submit</button>
      )}
  
      {transcript && <p><strong>You said:</strong> {transcript}</p>}
  
      {/*  Show error only if it exists */}
      {geminiError ? (
        <p style={{ color: "red" }}><strong>{geminiError}</strong></p>
      ) : (
        <>
          {/*  Show only when no error */}
          {geminiData && (
            <>
              <p><strong>Gemini says:</strong> {geminiData.message}</p>
              <p><strong>Age:</strong> {geminiData.age}</p>
              <p><strong>Smoker:</strong> {geminiData.smoker ? "Yes" : "No"}</p>
              <p><strong>Coverage:</strong> ${geminiData.coverage}</p>
              <p><strong>Term:</strong> {geminiData.term_years} years</p>
            </>
          )}
  
          {quote && (
            <>
              <p><strong>Estimated Quote:</strong> ${quote.quote}</p>
              <p>{quote.details}</p>
            </>
          )}
        </>
      )}
    </div>
  );  
};

export default VoiceCapture;
