from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

@app.route("/quote", methods=["POST"])
def get_mock_quote():
    try:
        data = request.get_json()

        age = data.get("age")
        smoker = data.get("smoker")
        coverage = data.get("coverage")
        term = data.get("term_years")

        # 🔁 Simple mock logic to simulate premium calculation
        base_rate = 0.03
        age_penalty = (age - 25) * 0.002 if age > 25 else 0
        smoker_penalty = 0.015 if smoker else 0
        total_rate = base_rate + age_penalty + smoker_penalty

        annual_premium = coverage * total_rate * (term / 10)

        return jsonify({
            "quote": round(annual_premium, 2),
            "details": f"Estimated premium for {age} y/o {'smoker' if smoker else 'non-smoker'} for {term} years."
        })

    except Exception as e:
        print("Quote error:", e)
        return jsonify({ "error": str(e) }), 500
    
    #Gemini handler
@app.route("/geminiFunction", methods=["POST"])
def gemini_function():
    data = request.get_json()
    message = data.get("message", "")

    if not message:
        return jsonify({"message": "No input received."}), 400

    try:
        vertexai.init(project="pelagic-quanta-455716-s2", location="us-central1")
        model = GenerativeModel("gemini-pro")

        prompt = f"""
        Extract the following details from the text related to a life insurance query:
        - Age (integer)
        - Smoker (yes/no)
        - Coverage amount (in USD)
        - Term duration (in years)

        If the message is unrelated to insurance, return:
        {{
          "message": "Sorry, I had trouble understanding your insurance request. Could you please rephrase?"
        }}

        Input: {message}

        Output JSON format:
        {{
          "message": "<summary or explanation>",
          "age": <number>,
          "smoker": <true/false>,
          "coverage": <number>,
          "term_years": <number>
        }}
        """

        result = model.generate_content(prompt)
        response_text = result.text

        try:
            parsed = json.loads(response_text)
        except json.JSONDecodeError:
            return jsonify({
                "message": "Sorry, I had trouble understanding your insurance request. Could you please rephrase?"
            }), 200

        required = ["age", "smoker", "coverage", "term_years"]
        if not all(k in parsed and parsed[k] not in [None, ""] for k in required):
            return jsonify({
                "message": "Sorry, I had trouble understanding your insurance request. Could you please rephrase?"
            }), 200

        return jsonify(parsed), 200

    except Exception as e:
        print("Gemini error:", e)
        return jsonify({ "message": "Internal error while processing your request." }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
