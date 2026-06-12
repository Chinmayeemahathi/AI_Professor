import { useState } from "react";
import axios from "axios";

function App() {

  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [topic, setTopic] = useState("");
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {

    if (!url) {
      alert("Please enter YouTube URL");
      return;
    }

    try {

      setLoading(true);

      const response = await axios.get(
        "https://ai-professor-petp.onrender.com/summary",
        {
          params: {
            url: url
          }
        }
      );

      if (response.data.error) {

        alert(response.data.error);

      } else {

        setSummary(response.data.summary);
        setTopic(response.data.topic);

      }

    } catch (error) {

      console.log(error);
      alert("Failed to generate summary");

    } finally {

      setLoading(false);
    }
  };

  const generateQuiz = async () => {

    if (!url) {
      alert("Please enter YouTube URL");
      return;
    }

    try {

      setLoading(true);

      const response = await axios.get(
        "https://ai-professor-petp.onrender.com/quiz",
        {
          params: {
            url: url
          }
        }
      );

      if (response.data.error) {

        alert(response.data.error);

      } else {

        setQuiz(response.data.quiz);
        setTopic(response.data.topic);
        setAnswers({});
        setScore(null);

      }

    } catch (error) {

      console.log(error);
      alert("Failed to generate quiz");

    } finally {

      setLoading(false);
    }
  };

  const submitQuiz = () => {

  console.log("Selected Answers:");
  console.log(answers);

  console.log("Quiz Data:");
  console.log(quiz);

  let correct = 0;

  quiz.forEach((q, index) => {

    console.log(
      "Selected:",
      answers[index]
    );

    console.log(
      "Correct:",
      q.answer
    );

    if (
      answers[index] &&
      answers[index].trim() ===
      q.answer.trim()
    ) {
      correct++;
    }

  });

  setScore(correct);
};

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        padding: "30px 40px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fcfcfc"
      }}
    >

      <style>{`
        #root {
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        body {
          margin: 0 !important;
          width: 100% !important;
        }
      `}</style>

      <h1
        style={{
          textAlign: "center",
          fontSize: "48px",
          marginBottom: "10px"
        }}
      >
        AI_Professor 🎓
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#666",
          marginBottom: "20px"
        }}
      >
        Your AI-powered YouTube learning assistant
      </p>

      {topic && (
        <h2
          style={{
            textAlign: "center",
            color: "#4F46E5"
          }}
        >
          📚 Topic: {topic}
        </h2>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          maxWidth: "900px",
          margin: "20px auto 40px auto"
        }}
      >

        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={generateSummary}
          disabled={loading}
          style={{
            padding: "12px 20px",
            fontWeight: "bold",
            backgroundColor: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Generate Summary
        </button>

        <button
          onClick={generateQuiz}
          disabled={loading}
          style={{
            padding: "12px 20px",
            fontWeight: "bold",
            backgroundColor: "#10B981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Generate Quiz
        </button>

      </div>

      {loading && (
        <p
          style={{
            textAlign: "center"
          }}
        >
          Loading...
        </p>
      )}

      <div
        style={{
          display: "flex",
          gap: "24px"
        }}
      >

        {/* QUIZ PANEL */}

        <div
          style={{
            flex: 3,
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #eaeaea",
            minHeight: "600px"
          }}
        >

          <h2>🧠 Quiz</h2>

          {quiz.length > 0 ? (

            <>
              {quiz.map((q, index) => (

                <div
                  key={index}
                  style={{
                    marginBottom: "25px"
                  }}
                >

                  <h4>
                    {index + 1}. {q.question}
                  </h4>

                  {q.options.map((option, i) => (

                    <label
                      key={i}
                      style={{
                        display: "block",
                        marginBottom: "8px"
                      }}
                    >

                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={() =>
                          setAnswers({
                            ...answers,
                            [index]: option
                          })
                        }
                      />

                      {" "}
                      {option}

                    </label>

                  ))}

                </div>

              ))}

              <button
                onClick={submitQuiz}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#4F46E5",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Submit Quiz
              </button>

              {score !== null && (

                <h3
                  style={{
                    marginTop: "20px",
                    color: "#10B981"
                  }}
                >
                  Score: {score}/{quiz.length}
                </h3>

              )}

            </>

          ) : (

            <p style={{ color: "#888" }}>
              Generate Quiz to see questions
            </p>

          )}

        </div>

        {/* SUMMARY PANEL */}

        <div
          style={{
            flex: 7,
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #eaeaea",
            minHeight: "600px"
          }}
        >

          <h2>📘 AI Summary</h2>

          {summary ? (

            <div
              style={{
                whiteSpace: "pre-line",
                lineHeight: "1.8"
              }}
            >
              {summary}
            </div>

          ) : (

            <p style={{ color: "#888" }}>
              Your summary will appear here...
            </p>

          )}

        </div>

      </div>

    </div>
  );
}

export default App;