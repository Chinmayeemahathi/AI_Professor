@app.get("/quiz")
def generate_quiz(url: str):

    video_id = extract_video_id(url)

    if not video_id:
        return {
            "error": "Invalid YouTube URL"
        }

    try:

        ytt_api = YouTubeTranscriptApi()

        transcript = ytt_api.fetch(video_id)

        full_text = " ".join(
            [item.text for item in transcript]
        )

        prompt = f"""
        Based on the transcript below, generate 5 multiple-choice questions.

        Format:

        Q1. Question

        A. Option
        B. Option
        C. Option
        D. Option

        Correct Answer: X

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

        quiz = response.choices[0].message.content

        return {
            "quiz": quiz
        }

    except Exception as e:

        return {
            "error": str(e)
        }