import os
import json
from urllib.parse import urlparse, parse_qs

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from groq import Groq

# =========================
# LOAD ENV VARIABLES
# =========================

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# =========================
# FASTAPI APP
# =========================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# HELPER FUNCTIONS
# =========================

def extract_video_id(url):

    if "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]

    parsed_url = urlparse(url)

    if parsed_url.hostname in ("www.youtube.com", "youtube.com"):
        return parse_qs(parsed_url.query).get("v", [None])[0]

    return None


def detect_topic(full_text):

    prompt = f"""
    Determine the SINGLE primary educational topic being taught.

    Rules:
    - Return ONLY the topic name.
    - No explanation.
    - No extra text.
    - Ignore greetings.
    - Ignore promotions.
    - Ignore unrelated discussion.

    Transcript:

    {full_text}
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content.strip()

# =========================
# HOME ROUTE
# =========================

@app.get("/")
def home():
    return {
        "message": "Backend Running"
    }

# =========================
# SUMMARY ROUTE
# =========================

@app.get("/summary")
def generate_summary(url: str):

    video_id = extract_video_id(url)

    if not video_id:
        return {
            "error": "Invalid YouTube URL"
        }

    try:

        transcript = YouTubeTranscriptApi().fetch(video_id)

        full_text = " ".join(
            [item.text for item in transcript]
        )

        full_text = full_text[:5000]

        topic = detect_topic(full_text)

        prompt = f"""
        Topic:
        {topic}

        Create high-quality study notes focused ONLY on this topic.

        Structure:

        1. Overview
        2. Core Concepts
        3. Important Details
        4. Interview Points
        5. Key Takeaways

        Ignore unrelated transcript content.

        Transcript:

        {full_text}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return {
            "topic": topic,
            "summary": response.choices[0].message.content
        }

    except Exception as e:

        return {
            "error": str(e)
        }

# =========================
# QUIZ ROUTE
# =========================

@app.get("/quiz")
def generate_quiz(url: str):

    video_id = extract_video_id(url)

    if not video_id:
        return {
            "error": "Invalid YouTube URL"
        }

    try:

        transcript = YouTubeTranscriptApi().fetch(video_id)

        full_text = " ".join(
            [item.text for item in transcript]
        )

        full_text = full_text[:5000]

        topic = detect_topic(full_text)

        prompt = f"""
        Topic:
        {topic}

        Generate exactly 5 multiple choice questions.

        Return ONLY valid JSON.

        Format:

        [
          {{
            "question": "Question here",
            "options": [
              "Option A",
              "Option B",
              "Option C",
              "Option D"
            ],
            "answer": "Option B"
          }}
        ]

        Transcript:

        {full_text}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        quiz_data = json.loads(
            response.choices[0].message.content
        )

        return {
            "topic": topic,
            "quiz": quiz_data
        }

    except Exception as e:

        return {
            "error": str(e)
        }