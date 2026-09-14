import { useMemo, useRef, useState } from "react";
import { ParsedCommand } from "../types";
import { parseVoiceCommand } from "../data/voiceParser";

interface VoiceSectionProps {
  evidenceList: string[];
  mapNames: string[];
  onCommand: (command: ParsedCommand) => void;
}

export function VoiceSection({ evidenceList, mapNames, onCommand }: VoiceSectionProps) {
  const [manualText, setManualText] = useState("");
  const [status, setStatus] = useState("Idle");
  const [isListening, setIsListening] = useState(false);
  const [lastParsed, setLastParsed] = useState("");
  const recognitionRef = useRef<any>(null);

  const suggestion = useMemo(
    () =>
      "Try: \"add emf\", \"include spirit box\", \"exclude ghost writing\", \"start timer 3\", \"switch to maps\", \"set sanity 40\"",
    []
  );

  const executeText = (text: string) => {
    const parsed = parseVoiceCommand(text, evidenceList, mapNames);
    setLastParsed(JSON.stringify(parsed, null, 2));
    onCommand(parsed);
    return parsed;
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Web Speech API is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus("Stopped listening");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.continuous = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript ?? "";
      const finalText = String(transcript).trim();
      if (!finalText) return;
      setManualText(finalText);
      const parsed = executeText(finalText);
      setStatus(`Heard: ${parsed.sourceText}`);
    };

    recognitionRef.current.onerror = () => {
      setStatus("Speech recognition error. Try again.");
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setStatus("Idle");
    };

    recognitionRef.current.start();
    setIsListening(true);
    setStatus("Listening...");
  };

  const runManual = () => {
    if (!manualText.trim()) return;
    executeText(manualText);
  };

  return (
    <section>
      <header className="section-header">
        <h2>Voice and Command Center</h2>
        <p>Hands-free or fast text commands for core actions.</p>
      </header>

      <div className="panel">
        <h3>Quick Voice</h3>
        <div className="row">
          <button onClick={toggleListening} type="button">
            {isListening ? "Stop listening" : "Start listening"}
          </button>
          <small>{status}</small>
        </div>
      </div>

      <div className="panel">
        <h3>Command Palette</h3>
        <div className="row">
          <input
            value={manualText}
            onChange={(event) => setManualText(event.target.value)}
            placeholder={suggestion}
          />
          <button onClick={runManual} type="button">
            Run
          </button>
        </div>
      </div>

      <div className="panel">
        <h3>Supported Commands</h3>
        <ul>
          <li>clear / reset: clear evidence map/sanity/hunt mode</li>
          <li>add or include [evidence]: lock evidence as confirmed</li>
          <li>exclude or remove [evidence]: mark as impossible</li>
          <li>start timer [number]: starts timer in minutes</li>
          <li>set sanity [number]: updates sanity context</li>
          <li>go to/ switch/open + tabs: finder, maps, tools, journal, voice, settings</li>
          <li>snapshot: saves current Finder filters to journal</li>
        </ul>
      </div>

      <div className="panel">
        <h3>Last Parsed Command</h3>
        <pre>{lastParsed || "Use commands above to manipulate app state."}</pre>
      </div>
    </section>
  );
}
